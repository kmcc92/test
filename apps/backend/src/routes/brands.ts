import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

const registerBrandSchema = z.object({
  name: z.string().min(1).max(100),
  logo: z.string().url().optional(),
  logoIpfsHash: z.string().optional(),
  metadataIpfsHash: z.string().optional(),
});

const updateRulesSchema = z.object({
  verificationRules: z.array(
    z.object({
      ruleType: z.enum(["NFC", "QR", "SERIAL", "HOLOGRAM"]),
      ruleValue: z.string(),
      active: z.boolean().default(true),
    })
  ),
});

router.post(
  "/register",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = registerBrandSchema.parse(req.body);

      const existing = await prisma.brand.findUnique({ where: { userId: req.user!.userId } });
      if (existing) return res.status(409).json({ error: "Brand already registered for this user" });

      const brand = await prisma.brand.create({
        data: {
          userId: req.user!.userId,
          name: data.name,
          logo: data.logo,
          logoIpfsHash: data.logoIpfsHash,
          metadataIpfsHash: data.metadataIpfsHash,
        },
      });

      // Upgrade user role
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { role: "BRAND_OWNER" },
      });

      res.status(201).json(brand);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id/rules",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { verificationRules } = updateRulesSchema.parse(req.body);

      const brand = await prisma.brand.findUnique({ where: { id: req.params.id } });
      if (!brand) return res.status(404).json({ error: "Brand not found" });

      const isOwner = brand.userId === req.user!.userId;
      const isAdmin = req.user!.role === "ADMIN";
      if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

      const updated = await prisma.brand.update({
        where: { id: req.params.id },
        data: { verificationRules },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// Admin: approve brand
router.post(
  "/:id/approve",
  authenticate,
  requireRole("ADMIN"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const brand = await prisma.brand.update({
        where: { id: req.params.id },
        data: { verified: true },
      });
      res.json(brand);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { verified: true },
      select: { id: true, name: true, logo: true, createdAt: true },
    });
    res.json(brands);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: { items: { take: 20, orderBy: { createdAt: "desc" } } },
    });
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    res.json(brand);
  } catch (err) {
    next(err);
  }
});

export default router;
