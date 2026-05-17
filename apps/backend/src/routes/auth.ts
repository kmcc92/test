import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  walletAddress: z.string().optional(),
  role: z.enum(["BUYER", "BRAND_OWNER"]).default("BUYER"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        walletAddress: data.walletAddress,
        role: data.role,
      },
      select: { id: true, email: true, role: true, walletAddress: true, createdAt: true },
    });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user.id, email: user.email, role: user.role, walletAddress: user.walletAddress },
      token,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
