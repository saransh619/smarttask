import { Schema, model, type InferSchemaType } from "mongoose";
import { UserRole } from "../utils/constants.js";

export const userRoles = Object.values(UserRole);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: userRoles, default: UserRole.USER, index: true },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
