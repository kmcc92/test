import "./lib/env"; // validate env first
import express from "express";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./lib/env";
import authRoutes from "./routes/auth";
import itemRoutes from "./routes/items";
import auctionRoutes, { setSocketServer } from "./routes/auctions";
import brandRoutes from "./routes/brands";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: [env.FRONTEND_URL, env.MERCHANT_PORTAL_URL],
    methods: ["GET", "POST"],
  },
});

setSocketServer(io);

app.use(helmet());
app.use(cors({ origin: [env.FRONTEND_URL, env.MERCHANT_PORTAL_URL] }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/auctions", auctionRoutes);
app.use("/brands", brandRoutes);

app.use(errorHandler);

// Socket.io: auction room management
io.on("connection", (socket) => {
  socket.on("auction:join", (auctionId: string) => {
    socket.join(`auction:${auctionId}`);
  });

  socket.on("auction:leave", (auctionId: string) => {
    socket.leave(`auction:${auctionId}`);
  });
});

const PORT = parseInt(env.PORT, 10);
httpServer.listen(PORT, () => {
  console.log(`🚀 TESTF API running on http://localhost:${PORT}`);
});

export { io };
