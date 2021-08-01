import { Pool as PgPool } from "pg";

const Pool = new PgPool({ ssl: { rejectUnauthorized: process.env.NODE_ENV === "development" ? false : true } });

enum Queries {
  createRoom = "INSERT INTO rooms VALUES($1) RETURNING *",
  getRoom = "SELECT * FROM rooms WHERE rooms.id = $1",
  //createTable = "CREATE TABLE rooms (id varchar(100) PRIMARY KEY)",
  //delete = "DROP TABLE rooms"
}

async function getRoom(roomId: string) {
  return Pool.query(Queries.getRoom, [roomId])
    .then((res) => (res.rowCount === 1 ? res.rows[0] : res.rows))
    .catch((err) => console.error(err));
}

async function createRoom(roomId: string) {
  return Pool.query(Queries.createRoom, [roomId])
    .then((res) => (res.rowCount === 1 ? res.rows[0] : res.rows))
    .catch((err) => console.error(err));
}

const PgQuery = {
  getRoom,
  createRoom,
};

export default PgQuery;
