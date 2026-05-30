declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: "user" | "superadmin";
    }
  }
}

export {};
