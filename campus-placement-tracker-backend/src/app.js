import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { globalErrorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Campus Placement Tracker backend is running"
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;