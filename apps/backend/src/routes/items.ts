import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

const registerItemSchema = z.object({
  chipId: z.string().min(1),
  ipfsHash: z.string().min(1),
  nftTokenId: z.string().optional(),
  mintTxHash: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

router.post(
  "/register",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = registerItemSchema.parse(req.body);

      const brand = await prisma.brand.findUnique({ where: { userId: req.user!.userId } });
      if (!brand) return res.status(403).json({ error: "No brand found for this user" });
      if (!brand.verified) return res.status(403).json({ error: "Brand not yet verified" });

      const item = await prisma.item.create({
        data: {
          chipId: data.chipId,
          ipfsHash: data.ipfsHash,
          nftTokenId: data.nftTokenId,
          mintTxHash: data.mintTxHash,
          metadata: data.metadata,
          brandId: brand.id,
        },
        include: { brand: { select: { name: true } } },
      });

      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:chipId/verify", async (req, res, next) => {
  try {
    const item = await prisma.item.findUnique({
      where: { chipId: req.params.chipId },
      include: {
        brand: {
          select: { name: true, logo: true, verified: true, verificationRules: true },
        },
      },
    });

    if (!item) return res.status(404).json({ error: "Item not found" });

    res.json({
      authentic: item.brand.verified,
      item: {
        id: item.id,
        chipId: item.chipId,
        nftTokenId: item.nftTokenId,
        ipfsHash: item.ipfsHash,
        metadata: item.metadata,
        createdAt: item.createdAt,
      },
      brand: item.brand,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
