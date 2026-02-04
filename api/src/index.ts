import cors from "cors";
import http from "http";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

import config from "./config";
import authRoutes from "./routes/auth";
import { errorMiddleware } from "./middlewares/error";

const app = express();

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));
app.use(cors({ origin: config.CORS_ORIGIN }));

app.use(errorMiddleware);

app.get("/", (_, res) => {
  return res.json({ message: "Hello World!" });
});

app.use("/auth", authRoutes);

const server = http.createServer(app);

server.listen(config.PORT, () => {
  console.log(`Server is running on: http://localhost:${config.PORT}`);
});
