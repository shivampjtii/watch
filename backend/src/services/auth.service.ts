import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validator.js";

export const registerUser = async (
  data: RegisterInput
) => {
  const existingUser = await User.findOne({
    email: data.email,
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    12
  );

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    coins: 0,
  });

  const token = generateToken(user._id.toString());

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      coins: user.coins,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const loginUser = async (
  data: LoginInput
) => {
  const user = await User.findOne({
    email: data.email,
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id.toString());

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      coins: user.coins,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const getCurrentUser = async (
  userId: string
) => {
  const user = await User.findById(userId).select(
    "-password"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    coins: user.coins,
    createdAt: user.createdAt,
  };
};