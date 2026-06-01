import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import {
  requireSwaggerAuth,
  swaggerDocsPath,
  swaggerJson,
  swaggerUiHandler,
  swaggerUiMiddleware,
} from "./docs/swagger.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { ApiMeta, ServerSuccess } from "./utils/constants.js";
import { serverResponse } from "./utils/serverResponse.js";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.get("/api/docs.json", requireSwaggerAuth, swaggerJson);
app.use(swaggerDocsPath, requireSwaggerAuth, swaggerUiMiddleware, swaggerUiHandler);
app.use("/api", apiRateLimiter);

app.get("/", (_req, res) => {
  serverResponse.success(res, "SmartTask API is running", {
    service: ApiMeta.SERVICE_NAME,
    status: "ok",
    healthUrl: "/health",
  });
});

app.get("/health", (_req, res) => {
  serverResponse.success(res, ServerSuccess.HEALTH, {
    service: ApiMeta.SERVICE_NAME,
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
