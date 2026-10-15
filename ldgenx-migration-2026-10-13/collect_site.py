#!/usr/bin/env python3
"""Read-only public-site collection for the LDgenX content migration."""
import concurrent.futures as cf
import datetime as dt
import hashlib
import json
import re
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET
from lxml import html as LH

ROOT = Path(__file__).resolve().parent
HOSTS = {"www.ldgenx.fr", "ldgenx.fr", "www.ldgenx.com", "ldgenx.com"}
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; LDgenX-content-migration/1.0)"}
STAMP = dt.datetime.now(dt.timezone.utc).isoformat()

def dump(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")

def norm(url):
    p = urlsplit(url)
    host = p.hostname or ""
    if host in HOSTS:
        host = "www." + host.removeprefix("www.")
    return urlunsplit(("https", host, p.path.rstrip("/") or "/", "", ""))

def page_url(url):
    p = urlsplit(url)
    if p.scheme not in ("https", "http") or p.hostname not in HOSTS:
        return False
    if p.path.startswith(("/uploads/", "/ecommerce/", "/bo-", "/js/", "/css/", "/bundles/")):
        return False
    if re.search(r"\.(?:png|jpe?g|gif|webp|svg|ico|pdf|zip|mp4|xml|txt|css|js)$", p.path, re.I):
        return False
    return True

def fetch(url, binary=False):
    try:
        with urlopen(Request(url, headers=HEADERS), timeout=25) as response:
            data = response.read()
            return {"requested_url": url, "final_url": response.url, "status": response.status,
                    "content_type": response.headers.get("Content-Type", ""), "body": data,
                    "retrieved_at": dt.datetime.now(dt.timezone.utc).isoformat()}
    except HTTPError as e:
        return {"requested_url": url, "final_url": e.url, "status": e.code, "error": str(e)}
    except Exception as e:
        return {"requested_url": url, "status": None, "error": type(e).__name__ + ": " + str(e)}

def md_node(e, base):
    if not isinstance(e.tag, str):
        return ""
    tag = str(e.tag).lower()
    if tag in ("script", "style", "noscript", "iframe"):
        return ""
    if tag == "img":
        src = e.get("src") or e.get("data-src")
        return "![" + (e.get("alt") or "") + "](" + urljoin(base, src) + ")" if src else ""
    if tag == "br":
        return "\n"
    content = re.sub(r"\s+", " ", e.text or "")
    for c in e:
        content += md_node(c, base) + re.sub(r"\s+", " ", c.tail or "")
    content = content.strip()
    if not content:
        return ""
    if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
        return "\n\n" + "#" * int(tag[1]) + " " + content + "\n\n"
    if tag == "a":
        href = e.get("href")
        return "[" + content + "](" + urljoin(base, href) + ")" if href and not href.startswith(("javascript:", "#")) else content
    if tag in ("strong", "b"):
        return "**" + content + "**"
    if tag in ("em", "i"):
        return "*" + content + "*"
    if tag == "li":
        return "\n- " + content + "\n"
    if tag == "tr":
        cells = [c.text_content().strip().replace("|", "\\|") for c in e if c.tag in ("td", "th")]
        return "\n| " + " | ".join(cells) + " |\n" if cells else content
    if tag in ("p", "div", "section", "article", "ul", "ol", "table", "form"):
        return "\n\n" + content + "\n\n"
    return content

def parse_page(record):
    url = record["requested_url"]
    data = record.pop("body", None)
    lang = "fr" if urlsplit(url).hostname.endswith(".fr") else "en"
    slug = urlsplit(url).path.strip("/").replace("/", "__") or "index"
    slug = re.sub(r"[^a-zA-Z0-9_-]", "-", slug)
    folder = ROOT / "source" / lang
    if data is None:
        return record
    if "html" not in record["content_type"].lower():
        record["error"] = "Unexpected non-HTML response for a page URL"
        return record
    text = data.decode("utf-8", "replace")
    doc = LH.fromstring(text)
    folder.mkdir(parents=True, exist_ok=True)
    raw_path = folder / (slug + ".html")
    raw_path.write_bytes(data)
    final_url = record["final_url"]
    title = " ".join(doc.xpath("//title/text()"))
    meta = {x.get("name") or x.get("property"): x.get("content", "")
            for x in doc.xpath("//meta[@name or @property]")}
    canonical = doc.xpath('//link[contains(concat(" ",normalize-space(@rel)," ")," canonical ")]/@href')
    record.update({"language": lang, "title": title, "meta": meta,
                   "canonical_url": urljoin(final_url, canonical[0]) if canonical else None,
                   "raw_html_path": str(raw_path.relative_to(ROOT)), "raw_sha256": hashlib.sha256(data).hexdigest()})
    links = []
    for a in doc.xpath("//a[@href]"):
        href = urljoin(final_url, a.get("href"))
        links.append({"url": href, "text": re.sub(r"\s+", " ", a.text_content()).strip(),
                      "title": a.get("title", ""), "download": a.get("download")})
    record["links"] = links
    images = []
    for e in doc.xpath("//img"):
        candidates = []
        for attr in ("src", "data-src", "data-original", "data-lazy-src", "data-thumb"):
            if e.get(attr) and not e.get(attr).startswith("data:"):
                candidates.append({"url": urljoin(final_url, e.get(attr)), "attribute": attr})
        for entry in (e.get("srcset") or "").split(","):
            if entry.strip():
                candidates.append({"url": urljoin(final_url, entry.strip().split()[0]), "attribute": "srcset"})
        images.append({"alt": e.get("alt", ""), "title": e.get("title", ""),
                       "width": e.get("width"), "height": e.get("height"), "sources": candidates})
    for e in doc.xpath("//*[@data-thumb or @style]"):
        refs = ([e.get("data-thumb")] if e.get("data-thumb") else []) + re.findall(r"url\(['\"]?([^)'\"]+)", e.get("style", ""))
        for ref in refs:
            if not ref.startswith("data:"):
                images.append({"alt": "", "sources": [{"url": urljoin(final_url, ref), "attribute": "background-or-thumbnail"}]})
    record["images"] = images
    record["headings"] = [{"level": int(e.tag[1]), "text": e.text_content().strip()}
                           for e in doc.xpath("//h1|//h2|//h3|//h4") if e.text_content().strip()]
    forms = []
    for form in doc.xpath("//form"):
        fields = []
        for e in form.xpath('.//input[not(@type="hidden")]|.//textarea|.//select'):
            field = {"tag": e.tag, "type": e.get("type", e.tag), "name": e.get("name", ""),
                     "placeholder": e.get("placeholder", ""), "required": e.get("required") is not None}
            if e.tag == "select":
                field["options"] = [o.text_content().strip() for o in e.xpath(".//option")]
            fields.append(field)
        forms.append({"action": urljoin(final_url, form.get("action") or final_url),
                      "method": form.get("method", "get"), "fields": fields})
    record["forms"] = forms
    sections = doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," headline ")]')
    usable = [e for e in sections if "header" not in e.get("class", "").split()
              and not any("liens rapides" in x.text_content().casefold() or "quick links" in x.text_content().casefold() or x.text_content().strip().casefold()=="links"
                          for x in e.xpath(".//h3"))]
    if not usable:
        usable = doc.xpath("//main|//article") or doc.xpath("//body")
    markdown = "\n\n".join(md_node(e, final_url) for e in usable)
    markdown = re.sub(r"\n[ \t]+", "\n", markdown)
    markdown = re.sub(r"\n{3,}", "\n\n", markdown).strip() + "\n"
    content_path = folder / (slug + ".md")
    content_path.write_text("<!-- Source: " + final_url + " | Collected: " + STAMP + " -->\n\n" + markdown, encoding="utf-8")
    record["content_path"] = str(content_path.relative_to(ROOT))
    record["content_characters"] = len(markdown)
    record["content_sha256"] = hashlib.sha256(markdown.encode()).hexdigest()
    record["body_text"] = "\n".join(e.text_content().strip() for e in usable)
    record["metadata_path"] = str((folder / (slug + ".json")).relative_to(ROOT))
    dump(folder / (slug + ".json"), record)
    return record

def main():
    seeds = set()
    discovery = ROOT / "source" / "discovery"
    for lang, host in [("fr", "www.ldgenx.fr"), ("en", "www.ldgenx.com")]:
        mapped = json.loads((discovery / ("map_" + lang + ".json")).read_text())
        seeds.update(norm(e["url"]) for e in mapped.get("links", []) if page_url(e["url"]))
        for name in ["sitemap.xml", "robots.txt"]:
            r = fetch("https://" + host + "/" + name)
            if "body" in r:
                (discovery / (lang + "_" + name)).write_bytes(r["body"])
                if name == "sitemap.xml":
                    try:
                        seeds.update(norm(x.text) for x in ET.fromstring(r["body"]).iter()
                                     if x.tag.endswith("loc") and x.text and page_url(x.text))
                    except ET.ParseError:
                        pass
    pages = []
    checked = set()
    discovered = set(seeds)
    while discovered - checked:
        wave = sorted(discovered - checked)
        if len(checked) + len(wave) > 120:
            raise RuntimeError("Unexpected page volume: inspect discovered URLs before broadening scope")
        print("Collecting wave:", len(wave), flush=True)
        with cf.ThreadPoolExecutor(max_workers=4) as pool:
            futures = {pool.submit(fetch, u): u for u in wave}
            for future in cf.as_completed(futures):
                u = futures[future]
                checked.add(u)
                record = parse_page(future.result())
                pages.append(record)
                print(record.get("status"), u, record.get("title", ""), record.get("content_characters", 0), flush=True)
                for link in record.get("links", []):
                    if page_url(link["url"]):
                        discovered.add(norm(link["url"]))
                dump(ROOT / "data" / "pages.json", {"collected_at": STAMP, "scope": sorted(HOSTS),
                                                       "pages": sorted(pages, key=lambda p:p["requested_url"]),
                                                       "discovered_urls": sorted(discovered)})
    print("COLLECTION COMPLETE", len(pages), "URLs checked;", sum(p.get("status")==200 for p in pages), "HTTP 200", flush=True)

if __name__ == "__main__":
    main()
