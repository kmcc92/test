import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { Server as SocketServer } from "socket.io";

const router = Router();

let io: SocketServer | undefined;
export function setSocketServer(server: SocketServer) {
  io = server;
}

const createAuctionSchema = z.object({
  itemId: z.string().uuid(),
  reservePrice: z.string().regex(/^\d+$/, "Must be a wei amount as string"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  onChainId: z.string().optional(),
});

const placeBidSchema = z.object({
  amount: z.string().regex(/^\d+$/, "Must be a wei amount as string"),
  txHash: z.string().optional(),
});

router.get("/live", async (req, res, next) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: { status: "ACTIVE", endTime: { gt: new Date() } },
      include: {
        item: { include: { brand: { select: { name: true, logo: true } } } },
        seller: { select: { id: true, walletAddress: true } },
        bids: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { endTime: "asc" },
    });
    res.json(auctions);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: {
        item: { include: { brand: { select: { name: true, logo: true } } } },
        seller: { select: { id: true, walletAddress: true } },
        bids: {
          orderBy: { createdAt: "desc" },
          include: { bidder: { select: { id: true, walletAddress: true } } },
        },
      },
    });
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    res.json(auction);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/create",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = createAuctionSchema.parse(req.body);

      const item = await prisma.item.findUnique({
        where: { id: data.itemId },
        include: { brand: true },
      });
      if (!item) return res.status(404).json({ error: "Item not found" });
      if (item.brand.userId !== req.user!.userId) {
        return res.status(403).json({ error: "You do not own this item" });
      }

      const existing = await prisma.auction.findFirst({
        where: { itemId: data.itemId, status: "ACTIVE" },
      });
      if (existing) return res.status(409).json({ error: "Item already has an active auction" });

      const auction = await prisma.auction.create({
        data: {
          itemId: data.itemId,
          sellerId: req.user!.userId,
          reservePrice: BigInt(data.reservePrice),
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          onChainId: data.onChainId,
          status: "ACTIVE",
        },
      });

      res.status(201).json(auction);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/:id/bid",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { amount, txHash } = placeBidSchema.parse(req.body);
      const auctionId = req.params.id;

      const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
      if (!auction) return res.status(404).json({ error: "Auction not found" });
      if (auction.status !== "ACTIVE") return res.status(400).json({ error: "Auction is not active" });
      if (new Date() >= auction.endTime) return res.status(400).json({ error: "Auction has ended" });

      const bidAmount = BigInt(amount);
      const reserve = BigInt(auction.reservePrice.toString());
      const highest = auction.highestBid ? BigInt(auction.highestBid.toString()) : 0n;
      const minBid = highest === 0n ? reserve : highest + (highest * 5n / 100n);

      if (bidAmount < minBid) {
        return res.status(400).json({
          error: "Bid too low",
          minimumBid: minBid.toString(),
        });
      }

      // Prevent duplicate bids at same amount from same user
      const duplicate = await prisma.bid.findUnique({
        where: { auctionId_bidderId_amount: { auctionId, bidderId: req.user!.userId, amount: bidAmount } },
      });
      if (duplicate) return res.status(409).json({ error: "Duplicate bid" });

      const [bid] = await prisma.$transaction([
        prisma.bid.create({
          data: { auctionId, bidderId: req.user!.userId, amount: bidAmount, txHash },
        }),
        prisma.auction.update({
          where: { id: auctionId },
          data: { highestBid: bidAmount, highestBidderId: req.user!.userId },
        }),
      ]);

      // Broadcast to all clients watching this auction
      if (io) {
        io.to(`auction:${auctionId}`).emit("bid:new", {
          auctionId,
          bidderId: req.user!.userId,
          amount: amount,
          timestamp: bid.createdAt,
        });
      }

      res.status(201).json(bid);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
