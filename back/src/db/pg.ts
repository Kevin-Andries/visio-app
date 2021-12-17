import { Pool as PgPool } from "pg";

const Pool = new PgPool({ ssl: { rejectUnauthorized: process.env.NODE_ENV === "development" ? false : true } });

Pool.connect()
  .then(() => console.log("Connected to PG"))
  .catch((_err) => console.log("ERROR PG"));

enum Queries {
  getAllRooms = "SELECT COUNT(*) FROM rooms",
  createRoom = "INSERT INTO rooms VALUES($1)",
  getRoom = "SELECT * FROM rooms WHERE rooms.id = $1",
}

async function getRoom(roomId: string) {
  return Pool.query(Queries.getRoom, [roomId])
    .then((res) => (res.rowCount === 1 ? res.rows[0] : null))
    .catch((err) => console.error(err));
}

async function getAllRooms() {
  return Pool.query(Queries.getAllRooms)
    .then((res) => (res.rowCount === 1 ? res.rows[0] : res.rows))
    .catch((err) => console.error(err));
}

async function createRoom(roomId: string, tries: number = 1) {
  try {
    await Pool.query(Queries.createRoom, [roomId]);
  } catch (err) {
    // if there is an error while saving room to DB, we try again after 5 secondes. We try 3 times max
    if (tries < 3) setTimeout(() => createRoom(roomId, tries + 1), 5000);
  }
}

const PgQuery = {
  getRoom,
  getAllRooms,
  createRoom,
};

export default PgQuery;
