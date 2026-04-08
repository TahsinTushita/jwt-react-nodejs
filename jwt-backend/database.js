import mysql from "mysql2";
import dotenv from "dotenv";

// access .env variables
dotenv.config({ path: "./.env" });

// create a query connection pool
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

// get all users
export async function getUsers() {
  const [res] = await pool.query("SELECT id, name, orders, admin FROM user");
  return res;
}

// get a single user by id
export async function getUserById(id) {
  const [user] = await pool.query(
    `SELECT id, name, admin FROM user WHERE id = ?`,
    [id],
  );
  return user[0];
}

// get a single user by name
export async function getUserByName(name) {
  const [user] = await pool.query(
    `SELECT id, name, admin FROM user WHERE name = ?`,
    [name],
  );
  return user[0];
}

// create a user
export async function createUser(name, password, admin = 0) {
  const result = await pool.query(
    `INSERT INTO user(name, password, admin) VALUES (?, ?, ?)`,
    [name, password, admin],
  );

  return getUserById(result[0].insertId);
}

// check to see if the user exists
export async function login(name) {
  const [user] = await pool.query(
    `SELECT id, name, admin, password FROM user WHERE name = ?`,
    [name],
  );

  return user[0];
}

// get a user using their refreshToken
export async function getUserWithRefreshToken(token) {
  const [user] = await pool.query(
    `SELECT id, name, admin FROM user WHERE refreshToken = ?`,
    [token],
  );

  return user[0];
}

// update a user's refreshToken
export async function updateRefreshToken(token, id) {
  const result = await pool.query(
    `UPDATE user SET refreshToken = ? WHERE id = ?`,
    [token, id],
  );

  return result;
}
