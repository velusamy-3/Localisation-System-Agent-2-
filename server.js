const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = __dirname;
const MAX_SIZE = 20 * 1024 * 1024; // 20MB limit

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const server = http.createServer((req, res) => {

  // ===============================
  // 🔥 SAVE FILE API
  // ===============================
  if (req.method === "POST" && req.url === "/save-file") {

    let body = "";
    let size = 0;

    req.on("data", chunk => {
      size += chunk.length;

      if (size > MAX_SIZE) {
        console.log("❌ Payload too large");
        res.writeHead(413);
        res.end("Payload too large");
        req.destroy();
        return;
      }

      body += chunk;
    });

    req.on("end", () => {
      try {
        if (!body) {
          res.writeHead(400);
          return res.end("Empty body");
        }

        const data = JSON.parse(body);

        let filePath = data.filePath;

        if (!filePath) {
          res.writeHead(400);
          return res.end("Missing filePath");
        }

        if (!path.isAbsolute(filePath)) {
          filePath = path.join(ROOT, filePath);
        }

        ensureDir(filePath);

        let saved = false;

        // ✅ CASE 1: base64 data (assets)
        if (data.data && typeof data.data === "string" && data.data.length > 10) {
          const buffer = Buffer.from(data.data, "base64");
          fs.writeFileSync(filePath, buffer);
          saved = true;
        }

        // ✅ CASE 2: HTML/text
        else if (data.content && data.content.length > 0) {
          fs.writeFileSync(filePath, data.content, "utf8");
          saved = true;
        }

        // ✅ CASE 3: copy from source
        else if (data.sourcePath && fs.existsSync(data.sourcePath)) {
          fs.copyFileSync(data.sourcePath, filePath);
          saved = true;
        }

        if (!saved) {
          res.writeHead(400);
          return res.end("No content provided");
        }

        console.log("✅ Saved:", filePath);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));

      } catch (err) {
        console.error("❌ JSON/Error:", err.message);
        res.writeHead(500);
        res.end("Server error");
      }
    });

    req.on("error", err => {
      console.error("❌ Request error:", err.message);
    });

    return;
  }

  // ===============================
  // 🌐 STATIC FILE SERVE
  // ===============================
  let filePath = decodeURIComponent(req.url.split("?")[0]);

  if (filePath === "/") filePath = "/index.html";

  filePath = path.join(ROOT, filePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {

    const ext = path.extname(filePath).toLowerCase();

    const MIME = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp4": "video/mp4",
      ".woff": "font/woff",
      ".woff2": "font/woff2"
    };

    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400"
    });

    fs.createReadStream(filePath).pipe(res);

    console.log("📄 Served:", filePath);

  } else {
    res.writeHead(404);
    res.end("404 Not Found");
    console.log("❌ 404:", filePath);
  }

});

// ===============================
// 🔥 SERVER CONFIG (IMPORTANT)
// ===============================
server.timeout = 300000; // 5 minutes

server.on("clientError", (err, socket) => {
  console.log("⚠️ Client error:", err.message);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

// ===============================
// 🚀 START SERVER
// ===============================
server.listen(PORT, "0.0.0.0", () => {
  console.log("\n🚀 Server running!");
  console.log("👉 http://localhost:" + PORT);
  console.log("💾 POST /save-file to store files\n");
});