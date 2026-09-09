import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { MulterError } from "multer";
import userRouter from "./routes/user_routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/users", userRouter);

app.use((err, req, res, next) => {
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_UNEXPECTED_FIELD"
        ? `Unexpected file field "${err.field}". Expected "avatar" or "coverImage".`
        : err.message;
    return res.status(400).json({
      success: false,
      message,
      errors: [],
      statusCode: 400,
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    statusCode,
  });
});

export { app };
