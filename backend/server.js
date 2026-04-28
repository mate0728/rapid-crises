require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Init DB (NeDB — no connection needed, just require)
require("./config/db");

const app = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST","PATCH","DELETE"] },
});
app.set("io", io);

let connectedClients = 0;
io.on("connection", (socket) => {
  connectedClients++;
  io.emit("system:clients", connectedClients);
  console.log(`🔌 +1 client [${socket.id}] total=${connectedClients}`);

  socket.on("ping", () => socket.emit("pong", { time: Date.now() }));
  socket.on("personnel:location", (data) => socket.broadcast.emit("personnel:location", data));
  socket.on("comms:message", (msg) => socket.broadcast.emit("comms:message", msg));

  socket.on("disconnect", () => {
    connectedClients = Math.max(0, connectedClients - 1);
    io.emit("system:clients", connectedClients);
    console.log(`🔴 -1 client total=${connectedClients}`);
  });
});

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000, max: 300,
  message: { success: false, error: "Rate limit exceeded" },
}));

app.use((req, res, next) => {
  if (req.method !== "GET") console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/alerts",    require("./routes/alertRoutes"));
app.use("/api/personnel", require("./routes/personnelRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "OPERATIONAL", uptime: Math.floor(process.uptime()), connectedClients, timestamp: new Date().toISOString() });
});

// ── Static Frontend ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/admin.html")));
app.use((req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ success: false, error: "Not found" });
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
});

// ── Error Handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌", err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ── Boot ───────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const seedPersonnel = require("./config/seed");

(async () => {
  await seedPersonnel();
  server.listen(PORT, () => {
    console.log(`\n🚀 CrisisNexus running → http://localhost:${PORT}`);
    console.log(`📡 WebSocket active`);
    console.log(`🏥 Health → http://localhost:${PORT}/api/health\n`);
  });
})();
