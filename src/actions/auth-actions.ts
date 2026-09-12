"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import {
  registerSchema,
  resetPasswordSchema,
  setNewPasswordSchema,
  RegisterInput,
  ResetPasswordInput,
  SetNewPasswordInput,
} from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/mail";

/**
 * Registers a new user.
 * Password is encrypted using bcryptjs.
 */
export async function registerUser(data: unknown) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: "Неверные данные формы",
      fields: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Пользователь с таким email уже существует",
        fields: { email: ["Этот email уже используется"] },
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    // Automatically create a cart for the new user
    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.",
    };
  }
}

/**
 * Generates a password reset token, saves its SHA-256 hash to the database,
 * and sends the raw token via email.
 */
export async function sendPasswordResetLink(data: unknown, rawLocale?: string) {
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: "Неверный адрес электронной почты",
    };
  }

  const { email } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    const successMessage = "Если указанный email зарегистрирован, на него будет отправлена ссылка для сброса пароля.";

    if (!user) {
      return {
        success: true,
        message: successMessage,
      };
    }

    // Generate secure random token (64 hex characters)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash the token using SHA-256
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

    // Delete any old tokens for this user and create a new one
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send the raw token in the link with locale
    await sendPasswordResetEmail(user.email, rawToken, rawLocale);

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    console.error(
      "Password reset request error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      error: "Произошла системная ошибка при отправке ссылки.",
    };
  }
}

/**
 * Verifies the password reset token hash and updates the user's password.
 */
export async function resetPassword(token: string, data: unknown) {
  if (!token) {
    return { success: false, error: "Токен сброса отсутствует" };
  }

  const result = setNewPasswordSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: "Неверные данные пароля",
      fields: result.error.flatten().fieldErrors,
    };
  }

  const { password } = result.data;

  try {
    // Hash the raw token from the URL using SHA-256 to lookup the DB
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return {
        success: false,
        error: "Ссылка для сброса пароля недействительна или устарела.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Atomically update user password and remove the token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "Произошла ошибка при изменении пароля. Пожалуйста, попробуйте позже.",
    };
  }
}
