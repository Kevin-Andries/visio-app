import { Request, Response, NextFunction } from "express";

type Callback = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export default function catchError(cb: Callback) {
  return (req: Request, res: Response, next: NextFunction) => {
    cb(req, res, next).catch(next);
  };
}
