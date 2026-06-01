import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import swaggerUi from "swagger-ui-express";
import {
  ApiMeta,
  SortBy,
  SortingAlgorithm,
  SortOrder,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "../utils/constants.js";

const docsPath = "/api/docs";

function timingSafeEqualText(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function requireSwaggerAuth(req: Request, res: Response, next: NextFunction) {
  const username = process.env.SWAGGER_USERNAME;
  const password = process.env.SWAGGER_PASSWORD;

  if (!username || !password) {
    res.status(503).json({
      success: false,
      statusCode: 503,
      message: "Swagger docs are not configured",
    });
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="SmartTask Swagger Docs"');
    res.status(401).send("Authentication required");
    return;
  }

  const encodedCredentials = authHeader.slice("Basic ".length);
  const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString("utf8");
  const separatorIndex = decodedCredentials.indexOf(":");
  const providedUsername =
    separatorIndex >= 0 ? decodedCredentials.slice(0, separatorIndex) : "";
  const providedPassword =
    separatorIndex >= 0 ? decodedCredentials.slice(separatorIndex + 1) : "";

  const validUsername = timingSafeEqualText(providedUsername, username);
  const validPassword = timingSafeEqualText(providedPassword, password);

  if (!validUsername || !validPassword) {
    res.set("WWW-Authenticate", 'Basic realm="SmartTask Swagger Docs"');
    res.status(401).send("Invalid Swagger credentials");
    return;
  }

  next();
}

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "SmartTask API",
    version: "1.0.0",
    description:
      "API documentation for SmartTask authentication, task management, and superadmin endpoints.",
  },
  servers: [
    {
      url: process.env.API_BASE_URL ?? "http://localhost:5000",
      description: "Configured API server",
    },
  ],
  tags: [
    { name: "Health", description: "Service status endpoints" },
    { name: "Auth", description: "Authentication and session endpoints" },
    { name: "Tasks", description: "Authenticated task CRUD endpoints" },
    { name: "Admin", description: "Superadmin-only endpoints" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT auth cookie set after login or registration.",
      },
    },
    schemas: {
      ApiEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Request completed successfully" },
          data: { type: "object", nullable: true },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "665f7f2d8a4a57d0fbb4d221" },
          name: { type: "string", example: "Saransh Pachhai" },
          email: { type: "string", format: "email", example: "saransh@example.com" },
          role: { type: "string", enum: Object.values(UserRole), example: UserRole.USER },
        },
      },
      Task: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665f7f2d8a4a57d0fbb4d222" },
          title: { type: "string", example: "Prepare project report" },
          description: { type: "string", example: "Summarize SmartTask API progress" },
          dueDate: { type: "string", format: "date-time", example: "2026-06-05T10:00:00.000Z" },
          priority: {
            type: "string",
            enum: Object.values(TaskPriority),
            example: TaskPriority.HIGH,
          },
          status: { type: "string", enum: Object.values(TaskStatus), example: TaskStatus.TODO },
          tags: { type: "array", items: { type: "string" }, example: ["api", "docs"] },
          owner: { type: "string", example: "665f7f2d8a4a57d0fbb4d221" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TaskInput: {
        type: "object",
        required: ["title", "dueDate"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 120, example: "Prepare project report" },
          description: { type: "string", maxLength: 1000, example: "Summarize SmartTask API progress" },
          dueDate: { type: "string", format: "date-time", example: "2026-06-05T10:00:00.000Z" },
          priority: { type: "string", enum: Object.values(TaskPriority), example: TaskPriority.HIGH },
          status: { type: "string", enum: Object.values(TaskStatus), example: TaskStatus.TODO },
          tags: {
            type: "array",
            items: { type: "string", minLength: 1, maxLength: 32 },
            example: ["api", "docs"],
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "saransh@example.com" },
          password: { type: "string", format: "password", example: "strong-password" },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 80, example: "Saransh Pachhai" },
          email: { type: "string", format: "email", example: "saransh@example.com" },
          password: { type: "string", format: "password", minLength: 8, example: "strong-password" },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          total: { type: "integer", example: 42 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalPages: { type: "integer", example: 5 },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Authentication is missing or invalid.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiEnvelope" },
          },
        },
      },
      Forbidden: {
        description: "The authenticated user does not have permission.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiEnvelope" },
          },
        },
      },
      ValidationError: {
        description: "Request validation failed.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiEnvelope" },
          },
        },
      },
      NotFound: {
        description: "The requested resource was not found.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiEnvelope" },
          },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "API root",
        responses: {
          "200": {
            description: "API service metadata.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API health status.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created and auth cookie set.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "409": { description: "Email already exists." },
          "429": { description: "Too many auth attempts." },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Logged in and auth cookie set.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { description: "Too many auth attempts." },
        },
      },
    },
    "/api/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Check current session",
        responses: {
          "200": {
            description: "Current session status. Returns user or null.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated user.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out",
        responses: {
          "200": {
            description: "Auth cookie cleared.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
        },
      },
    },
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: Object.values(TaskStatus) } },
          { name: "priority", in: "query", schema: { type: "string", enum: Object.values(TaskPriority) } },
          { name: "tag", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: Object.values(SortBy), default: SortBy.SMART } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: Object.values(SortOrder), default: SortOrder.ASC } },
          { name: "algorithm", in: "query", schema: { type: "string", enum: Object.values(SortingAlgorithm), default: SortingAlgorithm.MERGE } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
        ],
        responses: {
          "200": {
            description: "Tasks with pagination metadata and algorithm labels.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create task",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Task fetched.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update task",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Task updated.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Task deleted.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Get admin stats",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "User and task statistics.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List standard users",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
        ],
        responses: {
          "200": {
            description: "Paginated standard users.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiEnvelope" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
  },
};

export const swaggerUiMiddleware = swaggerUi.serve;
export const swaggerUiHandler = swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "SmartTask API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "none",
    tagsSorter: "alpha",
    operationsSorter: "alpha",
  },
});

export function swaggerJson(_req: Request, res: Response) {
  res.json(swaggerSpec);
}

export const swaggerDocsPath = docsPath;
