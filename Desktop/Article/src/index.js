import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import router from "./routes/route.js";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

dotenv.config();

const app = express();
const httpServer = createServer(app);
//MIddlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/api/v1", router);

//Redis setup

const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

await redisClient.connect();

// Duplicate clients for Pub/Sub
const publisher = redisClient.duplicate();
const subscriber = redisClient.duplicate();

await publisher.connect();
await subscriber.connect();

// Make publisher available in controllers
app.set("redisClient", publisher);

// create socket.io

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
//make set "io" avalable in controller
app.set("io", io);

// ==============================
// REDIS SUBSCRIBER → SOCKET EMIT
// ==============================

await subscriber.subscribe("articles_channel", (message) => {
  const parsed = JSON.parse(message);

  // 🔥 THIS IS IMPORTANT
  io.emit(parsed.event, parsed.data);
});

const Port = process.env.PORT;
const MONGO_DB = process.env.MONGODB;

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

mongoose
  .connect(MONGO_DB)
  .then(() => {
    httpServer.listen(Port, () => {
      console.log(`server is running on ${Port}`);
    });
    console.log("Mongodb is connected");
  })
  .catch((error) => {
    console.log(error);
  });
