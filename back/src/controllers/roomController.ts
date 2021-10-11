import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
// Misc
import PgQuery from "../db/pg";
import { getCache, setCache } from "../db/cache";
import { createToken } from "../utils/jwt";

export const joinRoom = async (req: Request, res: Response) => {
  const roomId = req.params.id;

  // check if room exists on Redis
  const roomCachedData = parseInt((await getCache(roomId)) as string);

  if (roomCachedData !== 0 && !roomCachedData) {
    return res.status(404).json({
      message: "This room does not exist",
    });
  }

  // if nb of clients is greater than zero /and IP adresses differ,/ we save it to PG (it's a "real" room)
  if (roomCachedData > 0) {
    await PgQuery.createRoom(roomId);
  }

  // increment number of clients in room
  await setCache(roomId, `${roomCachedData + 1}`);

  return res.status(201).json({
    token: createToken({ roomId, ip: req.ip }),
  });
};

export const createRoom = async (_req: Request, res: Response) => {
  const roomId = uuidv4();

  // save room to Redis
  await setCache(roomId, "0");

  res.status(200).json({
    roomId: roomId,
  });
};
