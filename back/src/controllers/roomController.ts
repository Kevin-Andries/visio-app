import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import PgQuery from "../db/pg";

export const joinRoom = async (req: Request, res: Response) => {
  const { roomId } = req.body;

  const room = await PgQuery.getRoom(roomId);

  res.status(200).json({
    room,
  });
};

export const createRoom = async (_req: Request, res: Response) => {
  const roomId = uuidv4();

  // save room to DB
  await PgQuery.createRoom(roomId);

  res.status(200).json({
    roomId,
  });
};
