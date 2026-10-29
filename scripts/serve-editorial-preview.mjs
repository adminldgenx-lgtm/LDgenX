// Production artifact adapter for local browser QA; deployment uses Cloudflare workerd.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const port = Number(process.argv[2] || 4186),
  root = resolve("dist");
const worker = (await import("../dist/_worker.js/index.js")).default;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".xml": "application/xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
};
const assets = {
  async fetch(request) {
    const url = new URL(request.url);
    let path = decodeURIComponent(url.pathname);
    if (/^\/(admin|espace)(\/|$)/.test(path)) path = "/portal.html";
    else if (path === "/") path = "/index.html";
    else if (!extname(path)) path += ".html";
    const file = resolve(root, "." + path);
    if (!file.startsWith(root + "/"))
      return new Response("Forbidden", { status: 403 });
    try {
      if (!(await stat(file)).isFile()) throw new Error();
      return new Response(await readFile(file), {
        headers: {
          "Content-Type": mime[extname(file)] || "application/octet-stream",
        },
      });
    } catch {
      return new Response(await readFile(root + "/404.html"), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  },
};
createServer(async (req, res) => {
  try {
    const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
      method: req.method,
      headers: req.headers,
    });
    const response = await worker.fetch(request, { ASSETS: assets });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (e) {
    console.error(e.name, e.message);
    res.writeHead(500);
    res.end("Preview failure");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Editorial production preview: http://127.0.0.1:${port}`),
);
