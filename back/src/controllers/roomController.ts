import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
// Misc
import PgQuery from "../db/pg";
import { getCache, setCache, setRoomInCache } from "../db/cache";
import { createToken } from "../utils/jwt";
import catchError from "../utils/catchError";
import AppError from "../utils/appError";

export const joinRoom = catchError(async (req: Request, res: Response, next: NextFunction) => {
  const roomId = req.params.id;
  const author = req.body.author;

  // check if room exists in cache
  const roomCachedData = parseInt((await getCache(roomId)) as string);

  if (isNaN(roomCachedData)) {
    return next(new AppError(404, "This room does not exist"));
  }

  // Increase code readability by extracting into functions that throw errors, and catch them here

  if (roomCachedData !== 0 && !roomCachedData) {
    // check if room exists in db
    const roomDbData = await PgQuery.getRoom(roomId);

    if (!roomDbData) {
      return next(new AppError(404, "This room does not exist"));
    } else {
      // save room in cache
      await setRoomInCache(roomId);
    }
  }

  if (roomCachedData === 0) {
    // increment number of clients in room
    await setCache(roomId, `${roomCachedData + 1}`);
  } else if (roomCachedData === 1) {
    // if the room contains at least two different people we save it to PG (it's a "real" room)
    // TODO: implement IP check
    PgQuery.createRoom(roomId);
  }

  res.status(201).json({
    roomId,
    token: createToken({ roomId, author, ip: req.ip }),
  });
});

export const createRoom = catchError(async (_req: Request, res: Response) => {
  const roomId = uuidv4();

  // save room in cache
  await setRoomInCache(roomId);

  res.status(200).json({
    roomId: roomId,
  });
});
