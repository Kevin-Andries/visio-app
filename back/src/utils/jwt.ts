import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface IPayload {
  [key: string]: any;
}

export function createToken(payload: IPayload) {
  return jwt.sign(payload, JWT_SECRET);
}

export function verify(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}
