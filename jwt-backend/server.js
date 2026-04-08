import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import cors from "cors";
import {
  getUserById,
  getUserByName,
  getUsers,
  createUser,
  login,
  getUserWithRefreshToken,
  updateRefreshToken,
} from "./database.js";

const app = express();

// used for bcrypt to encrypt passwords
const saltRounds = 11;

// used for the app to be able to use json
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

// credentials is set to true so that we can send cookies
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// used so that the app can parse cookies
app.use(cookieParser());

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// used to access .env variables
dotenv.config();

// Get all users
app.get("/api/users", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});

// Get a specific user by id
app.get("/api/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUserById(id);
  res.send(user);
});

// hash refresh token before storing it in the database
function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Create a user
app.post("/api/users", async (req, res) => {
  const { name, password } = req.body;

  const duplicate = await getUserByName(name);

  if (duplicate?.name === name) {
    return res.sendStatus(409);
  } else {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await createUser(name, hashedPassword);
    return res.status(201).send(user);
  }
});

let refreshTokens = [];

// Generate a new access token while the refresh token is valid
app.post("/api/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).send("You are not authenticated");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).send("Refresh token is not valid");
  }

  const hashedToken = hashRefreshToken(refreshToken);
  const user = await getUserWithRefreshToken(hashedToken);

  if (user) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        err && console.log(err);
        const newAccessToken = generateAccessToken(decoded);
        res.status(200).send({
          id: user.id,
          name: user.name,
          admin: user.admin,
          accessToken: newAccessToken,
        });
      },
    );
  } else {
    return res.status(403).send("Refresh token is not valid");
  }
});

// generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, admin: user.admin },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

// generate refresh token
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
      await updateRefreshToken(hashRefreshToken(refreshToken), user.id);

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        // sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.send({
        id: user.id,
        name: user.name,
        admin: user.admin,
        accessToken,
      });
    } else {
      res.status(400).send("Username or password is incorrect!");
    }
  } else {
    res.status(400).send("Username or password is incorrect!");
  }
});

// Verify the access token
const verifyAccessToken = (req, res, next) => {
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
app.delete("/api/users/:id", verifyAccessToken, (req, res) => {
  if (req.user.id === Number(req.params.id) || req.user.admin) {
    res.status(200).send("User has been deleted!");
  } else {
    res.status(403).send("You are not allowed to delete this user!");
  }
});

// logout
app.post("/api/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  const user = await getUserWithRefreshToken(hashRefreshToken(refreshToken));
  if (user) {
    await updateRefreshToken(null, user.id);
  }

  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      // sameSite: "none",
    })
    .status(200)
    .send("You logged out successfully!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
