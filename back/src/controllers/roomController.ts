import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
// Misc
import PgQuery from "../db/pg";
import { getCache, setCache } from "../db/cache";
import { createToken } from "../utils/jwt";
import catchError from "../utils/catchError";
import AppError from "../utils/appError";

export const joinRoom = catchError(async (req: Request, res: Response, next: NextFunction) => {
  const roomId = req.params.id;

  // check if room exists on Redis
  const roomCachedData = parseInt((await getCache(roomId)) as string);

  if (roomCachedData !== 0 && !roomCachedData) {
    return next(new AppError(404, "This room does not exist"));
  }

  if (roomCachedData === 0) {
    // increment number of clients in room
    await setCache(roomId, `${roomCachedData + 1}`);
  } else if (roomCachedData === 1) {
    // if the room contains at least two different people we save it to PG (it's a "real" room)
    // TODO: implement IP check
    PgQuery.createRoom(roomId);
  }

  return res.status(201).json({
    token: createToken({ roomId, ip: req.ip }),
  });
});

export const createRoom = catchError(async (_req: Request, res: Response) => {
  const roomId = uuidv4();

  // save room to Redis
  await setCache(roomId, "0");

  res.status(200).json({
    roomId: roomId,
  });
});
