// JSON-only CLI transport. This Mac intermittently times out in Node's HTTPS stack;
// curl works reliably. Credentials and bodies remain in stdin/pipes, never command args.
// Only safe GET/HEAD reads retry; an ambiguous write is never repeated silently.
import { spawn } from "node:child_process";
export function installQaJsonTransport() {
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init),
      url = new URL(request.url);
    if (
      url.hostname !== "api.supabase.com" &&
      !url.hostname.endsWith(".supabase.co")
    )
      return original(input, init);
    if (request.headers.get("content-type")?.includes("multipart/"))
      throw new Error("QA JSON transport does not support file uploads.");
    const body = ["GET", "HEAD"].includes(request.method)
      ? null
      : await request.text();
    const config = [
      `url = ${JSON.stringify(request.url)}`,
      `request = ${JSON.stringify(request.method)}`,
      ...[...request.headers]
        .filter(
          ([k]) =>
            ![
              "content-length",
              "transfer-encoding",
              "accept-encoding",
              "expect",
            ].includes(k),
        )
        .map(([k, v]) => `header = ${JSON.stringify(k + ": " + v)}`),
      'header = "Expect:"',
      ...(body ? [`data = ${JSON.stringify(body)}`] : []),
    ].join("\n");
    return new Promise((resolve, reject) => {
      const child = spawn(
        "curl",
        [
          "-4",
          "--http1.1",
          "--silent",
          "--show-error",
          "--connect-timeout",
          "8",
          "--max-time",
          "60",
          ...(request.method === "HEAD"
            ? ["--head", "--output", "/dev/null"]
            : []),
          ...(["GET", "HEAD"].includes(request.method)
            ? ["--retry", "2", "--retry-all-errors", "--retry-delay", "1"]
            : []),
          "--dump-header",
          "/dev/fd/3",
          "--write-out",
          "\n%{http_code} %{size_upload} %{time_connect} %{time_starttransfer}",
          "--config",
          "-",
        ],
        { stdio: ["pipe", "pipe", "pipe", "pipe"] },
      );
      child.stdout.setEncoding("utf8");
      child.stdio[3].setEncoding("utf8");
      let output = "",
        rawHeaders = "";
      const aborted = () => child.kill();
      request.signal.addEventListener("abort", aborted, { once: true });
      child.stdout.on("data", (chunk) => {
        output += chunk;
        if (output.length > 8000000) child.kill();
      });
      child.stdio[3].on("data", (chunk) => {
        rawHeaders += chunk;
      });
      child.stderr.resume();
      child.on("error", () =>
        reject(new Error("QA HTTPS transport unavailable.")),
      );
      child.on("close", (code) => {
        request.signal.removeEventListener("abort", aborted);
        const split = output.lastIndexOf("\n"),
          metadata = output
            .slice(split + 1)
            .trim()
            .split(/\s+/);
        if (code !== 0 || request.signal.aborted)
          return reject(
            new Error(
              `QA HTTPS connection failed: ${request.method} ${url.hostname}${url.pathname}, curl ${code}, upload ${metadata[1] ?? "-"}B, connect ${metadata[2] ?? "-"}s, response ${metadata[3] ?? "-"}s.`,
            ),
          );
        const status = Number(metadata[0]);
        if (status < 200 || status > 599)
          return reject(new Error("QA HTTPS response invalid."));
        const headers = new Headers();
        const block = rawHeaders
          .trim()
          .split(/\r?\n\r?\n/)
          .filter((x) => x.startsWith("HTTP/"))
          .at(-1);
        for (const line of block?.split(/\r?\n/).slice(1) ?? []) {
          const colon = line.indexOf(":");
          if (colon > 0)
            headers.append(line.slice(0, colon), line.slice(colon + 1).trim());
        }
        resolve(
          new Response(
            request.method === "HEAD" || [204, 205, 304].includes(status)
              ? null
              : output.slice(0, split),
            { status, headers },
          ),
        );
      });
      if (request.signal.aborted) child.kill();
      else child.stdin.end(config + "\n");
    });
  };
  return () => {
    globalThis.fetch = original;
  };
}
