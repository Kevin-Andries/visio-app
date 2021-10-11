import { Pool as PgPool } from "pg";

const Pool = new PgPool({ ssl: { rejectUnauthorized: process.env.NODE_ENV === "development" ? false : true } });

enum Queries {
  getAllRooms = "SELECT COUNT(*) FROM rooms",
  createRoom = "INSERT INTO rooms VALUES($1)",
  getRoom = "SELECT * FROM rooms WHERE rooms.id = $1",
  //createTable = "CREATE TABLE rooms (id varchar(100) PRIMARY KEY)",
  //delete = "DROP TABLE rooms"
}

async function getRoom(roomId: string) {
  return Pool.query(Queries.getRoom, [roomId])
    .then((res) => (res.rowCount === 1 ? res.rows[0] : res.rows))
    .catch((err) => console.error(err));
}

async function getAllRooms() {
  return Pool.query(Queries.getAllRooms)
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
  getAllRooms,
  createRoom,
};

export default PgQuery;
