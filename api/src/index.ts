import cors from "cors";
import http from "http";
import morgan from "morgan";
import express from "express";

import { env } from "./config";
import authRoutes from "./routes/auth";
import { errorMiddleware } from "./middlewares/error";

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));
app.use(cors({ origin: env.CORS_ORIGIN }));

app.use(errorMiddleware);

app.get("/", (_, res) => {
  return res.json({ message: "Hello World!" });
});

app.use("/auth", authRoutes);

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server is running on: http://localhost:${env.PORT}`);
});
