import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation failed", details: err.flatten().fieldErrors });
  }

  if (err.message.startsWith("P2002")) {
    return res.status(409).json({ error: "Resource already exists" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
