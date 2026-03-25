import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getUsers() {
  const [res] = await pool.query("SELECT id, name, orders, admin FROM user");
  return res;
}

export async function getUser(id) {
  const [user] = await pool.query(
    `SELECT id, name, orders, admin FROM user WHERE id = ?`,
    [id],
  );
  return user[0];
}

export async function createUser(name, password, admin = 0) {
  const result = await pool.query(
    `INSERT INTO user(name, password, admin) VALUES (?, ?, ?)`,
    [name, password, admin],
  );

  return getUser(result[0].insertId);
}

export async function login(name) {
  const [user] = await pool.query(`SELECT * FROM user WHERE name = ?`, [name]);

  return user[0];
}
