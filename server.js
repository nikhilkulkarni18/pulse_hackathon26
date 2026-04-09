const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "127.0.0.1";
const ROOT_DIR = __dirname;
const ENTRY_PATH = "/01%20Mockup/";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function sendResponse(response, statusCode, headers, body) {
  response.writeHead(statusCode, headers);
  response.end(body);
}

function serveFile(filePath, response) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendResponse(response, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
        return;
      }

      sendResponse(
        response,
        500,
        { "Content-Type": "text/plain; charset=utf-8" },
        "Could not read the requested file.",
      );
      return;
    }

    sendResponse(response, 200, { "Content-Type": getMimeType(filePath) }, data);
  });
}

function resolveRequestPath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split("?")[0]);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const joinedPath = path.join(ROOT_DIR, normalizedPath);

  if (!joinedPath.startsWith(ROOT_DIR)) {
    return null;
  }

  return joinedPath;
}

const server = http.createServer((request, response) => {
  if (!request.url) {
    sendResponse(response, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad request");
    return;
  }

  if (request.url === "/") {
    sendResponse(response, 302, { Location: ENTRY_PATH }, "");
    return;
  }

  const resolvedPath = resolveRequestPath(request.url);
  if (!resolvedPath) {
    sendResponse(response, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
    return;
  }

  fs.stat(resolvedPath, (error, stats) => {
    if (error) {
      sendResponse(response, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
      return;
    }

    if (stats.isDirectory()) {
      serveFile(path.join(resolvedPath, "index.html"), response);
      return;
    }

    serveFile(resolvedPath, response);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Cult Pulse demo is running at http://localhost:${PORT}${ENTRY_PATH}`);
});
