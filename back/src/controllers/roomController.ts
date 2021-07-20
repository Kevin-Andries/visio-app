import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const joinRoom = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
  });
};

export const createRoom = (_req: Request, res: Response) => {
  res.status(200).json({
    roomId: uuidv4(),
  });
};
