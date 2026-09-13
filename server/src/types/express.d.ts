declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: "user" | "admin" | "superadmin";
    }
  }
}

export {};
