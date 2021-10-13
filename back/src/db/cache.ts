import Redis from "redis";

const redis = Redis.createClient();

export function getCache(key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    redis.get(key, (error, data) => {
      if (error) return reject(error);
      return resolve(data);
    });
  });
}

export function setCache(key: string, data: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    redis.set(key, data, (error, data) => {
      if (error) return reject(error);
      return resolve(data);
    });
  });
}