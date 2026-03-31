import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getUser, getUsers, createUser, login } from "./database.js";

const app = express();
const saltRounds = 11;

app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization",
  );
  next();
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

dotenv.config();

// Get all users
app.get("/api/users", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});

// Get a specific user
app.get("/api/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUser(id);
  res.send(user);
});

// Create a user
app.post("/api/users", async (req, res) => {
  const { name, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const user = await createUser(name, hashedPassword);
  res.status(201).send(user);
});

let refreshTokens = [];

// Generate a new access and refresh token
app.post("/api/refresh", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) return res.status(401).send("You are not authenticated");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).send("Refresh token is not valid");
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);
    res.status(200).send({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, admin: user.admin },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, admin: user.admin },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    },
  );
};

// Login
app.post("/api/login", async (req, res) => {
  const { name, password } = req.body;
  const user = await login(name);
  if (user) {
    const storedHash = user.password;
    const match = await bcrypt.compare(password, storedHash);

    if (match) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);

      res.send({
        name: user.name,
        admin: user.admin,
        orders: user.orders,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(400).send("Username or password is incorrect!");
    }
  } else {
    res.status(400).send("Username or password is incorrect!");
  }
});

// Verify the access token
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send("Token is not valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).send("You are not authenticated!");
  }
};

// Delete a user
app.delete("/api/users/:id", verify, (req, res) => {
  if (req.user.id === Number(req.params.id) || req.user.admin) {
    res.status(200).send("User has been deleted!");
  } else {
    res.status(403).send("You are not allowed to delete this user!");
  }
});

app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).send("You logged out successfully!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
