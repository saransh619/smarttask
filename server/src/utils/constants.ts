export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const TaskPriority = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
} as const;

export const TaskStatus = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
} as const;

export const SortBy = {
  SMART: "smart",
  DUE_DATE: "dueDate",
  PRIORITY: "priority",
  STATUS: "status",
  TITLE: "title",
  CREATED_AT: "createdAt",
} as const;

export const SortOrder = {
  ASC: "asc",
  DESC: "desc",
} as const;

export const SortingAlgorithm = {
  MERGE: "merge",
  QUICK: "quick",
} as const;

export const CookieNames = {
  TOKEN: "token",
} as const;

export const UserRole = {
  USER: "user",
  SUPER_ADMIN: "superadmin",
} as const;

export const ApiMeta = {
  SERVICE_NAME: "smarttask-api",
  DSA_ALGORITHMS: ["Priority Queue", "Hash Maps", "Binary Search", "Merge Sort/Quick Sort"],
} as const;

export const ServerErrors = {
  VALIDATION_FAILED: "Validation failed",
  INTERNAL_SERVER_ERROR: "Internal server error",
  ROUTE_NOT_FOUND: "Route not found",
  RESOURCE_NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
  AUTH: {
    REQUIRED: "Authentication required",
    INVALID_OR_EXPIRED_SESSION: "Invalid or expired session",
    INVALID_CREDENTIALS: "Invalid email or password",
    INSUFFICIENT_ROLE: "You do not have permission to access this resource",
  },
  USER: {
    NOT_FOUND: "User not found",
    EXISTS: "An account with this email already exists",
    LISTED: "Users fetched successfully",
    INVALID_ID: "Invalid user id",
  },
  TASK: {
    NOT_FOUND: "Task not found",
    INVALID_ID: "Invalid task id",
    TITLE_REQUIRED: "Title is required",
    DUE_DATE_REQUIRED: "A valid due date is required",
    DUE_DATE_PAST: "Due date cannot be in the past",
  },
  ADMIN: {
    STATS_FETCHED: "Admin statistics fetched successfully",
    SUPER_ADMIN_EXISTS: "Superadmin already exists",
    SUPER_ADMIN_CREATED: "Superadmin seeded successfully",
    SUPER_ADMIN_SKIPPED: "Superadmin seed skipped because credentials are not configured",
  },
  EMAIL: {
    REQUIRED: "A valid email is required",
  },
  PASSWORD: {
    REQUIRED: "Password is required",
    MIN_LENGTH: "Password must contain at least 8 characters",
  },
  NAME: {
    LENGTH: "Name must be 2-80 characters",
  },
} as const;

export const ServerSuccess = {
  HEALTH: "SmartTask API is healthy",
  AUTH: {
    REGISTERED: "Account created successfully",
    LOGIN: "Logged in successfully",
    LOGOUT: "Logged out successfully",
    ME: "Authenticated user fetched successfully",
    SESSION: "Session checked successfully",
  },
  ADMIN: {
    STATS: "Admin statistics fetched successfully",
    USERS_LISTED: "Users fetched successfully",
  },
  TASK: {
    CREATED: "Task created successfully",
    LISTED: "Tasks fetched successfully",
    FETCHED: "Task fetched successfully",
    UPDATED: "Task updated successfully",
    DELETED: "Task deleted successfully",
  },
} as const;
