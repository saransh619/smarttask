import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ServerErrors, UserRole } from "./constants.js";

export async function seedSuperAdmin() {
  const name = process.env.SUPER_ADMIN_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.log(ServerErrors.ADMIN.SUPER_ADMIN_SKIPPED);
    return;
  }

  const existingSuperAdmin = await User.findOne({
    $or: [{ email }, { role: UserRole.SUPER_ADMIN }],
  });

  if (existingSuperAdmin) {
    console.log(ServerErrors.ADMIN.SUPER_ADMIN_EXISTS);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: UserRole.SUPER_ADMIN,
  });

  console.log(ServerErrors.ADMIN.SUPER_ADMIN_CREATED);
}
