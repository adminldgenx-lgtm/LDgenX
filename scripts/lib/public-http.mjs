import http from "node:http";
import https from "node:https";
import { Resolver } from "node:dns/promises";

// Optional public DNS is diagnostic only: TLS still verifies the requested hostname.
// It lets a fresh domain deployment be tested while the OS caches the previous address.
const resolver = process.env.LDGENX_DNS_SERVER ? new Resolver() : null;
if (resolver) resolver.setServers([process.env.LDGENX_DNS_SERVER]);
const addresses = new Map();
const lookup = resolver
  ? (host, options, callback) => {
      if (!addresses.has(host)) addresses.set(host, resolver.resolve4(host));
      addresses.get(host).then(
        (values) =>
          options.all
            ? callback(
                null,
                values.map((address) => ({ address, family: 4 })),
              )
            : callback(null, values[0], 4),
        callback,
      );
    }
  : undefined;
const agents = {
  "https:": new https.Agent({ keepAlive: true, lookup, maxSockets: 8 }),
  "http:": new http.Agent({ keepAlive: true, lookup, maxSockets: 8 }),
};

export function publicRequest(address, method = "GET") {
  const url = new URL(address);
  return new Promise((resolve, reject) => {
    const request = (url.protocol === "https:" ? https : http).request(
      url,
      {
        method,
        agent: agents[url.protocol],
        headers: { "User-Agent": "LDgenX-production-verification/1.0" },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("error", reject);
        response.on("end", () =>
          resolve({
            url: url.href,
            status: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    request.setTimeout(25000, () =>
      request.destroy(new Error(`Timed out: ${url.href}`)),
    );
    request.on("error", reject);
    request.end();
  });
}
