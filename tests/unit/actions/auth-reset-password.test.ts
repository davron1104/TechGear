import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { sendPasswordResetLink, resetPassword } from "@/actions/auth-actions";
import { sendPasswordResetEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import crypto from "crypto";

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/mail", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_new_password"),
  },
}));

describe("Password Reset Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendPasswordResetLink", () => {
    it("should fail for invalid email input", async () => {
      const result = await sendPasswordResetLink({ email: "invalid-email" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Неверный адрес электронной почты");
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("should return generic success message when user does not exist (protect against enumeration)", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const result = await sendPasswordResetLink({ email: "nonexistent@example.com" });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Если указанный email зарегистрирован");
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should delete old tokens, create tokenHash, and send email when user exists", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@example.com",
        name: "Test User",
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);
      vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValueOnce({ count: 1 });
      vi.mocked(prisma.passwordResetToken.create).mockResolvedValueOnce({} as unknown as Awaited<ReturnType<typeof prisma.passwordResetToken.create>>);
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      const result = await sendPasswordResetLink({ email: "USER@EXAMPLE.COM" }, "uz");

      expect(result.success).toBe(true);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "user@example.com" },
      });
      expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
      });
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-123",
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      });

      // Check tokenHash length (SHA-256 is 64 hex characters)
      const createCall = vi.mocked(prisma.passwordResetToken.create).mock.calls[0][0];
      expect(createCall.data.tokenHash).toHaveLength(64);

      // Verify email was sent with raw token and locale
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.any(String),
        "uz"
      );
    });

    it("should handle unexpected errors during email sending gracefully without leaking tokens", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-123",
        email: "user@example.com",
      } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(new Error("SMTP connection failed"));

      const result = await sendPasswordResetLink({ email: "user@example.com" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Произошла системная ошибка при отправке ссылки.");
    });
  });

  describe("resetPassword", () => {
    it("should return error if token is missing", async () => {
      const result = await resetPassword("", {
        password: "newpassword123",
        confirmPassword: "newpassword123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Токен сброса отсутствует");
    });

    it("should return validation errors if passwords do not match", async () => {
      const result = await resetPassword("raw-token", {
        password: "newpassword123",
        confirmPassword: "mismatchedpassword",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Неверные данные пароля");
      expect(result.fields?.confirmPassword).toBeDefined();
    });

    it("should return error if token is not found in database", async () => {
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValueOnce(null);

      const result = await resetPassword("invalid-token", {
        password: "newpassword123",
        confirmPassword: "newpassword123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("недействительна или устарела");
    });

    it("should return error if token has expired", async () => {
      const expiredDate = new Date(Date.now() - 60 * 1000); // 1 minute in the past
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValueOnce({
        id: "token-record-1",
        userId: "user-123",
        tokenHash: "somehash",
        expiresAt: expiredDate,
      } as unknown as Awaited<ReturnType<typeof prisma.passwordResetToken.findUnique>>);

      const result = await resetPassword("expired-token", {
        password: "newpassword123",
        confirmPassword: "newpassword123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("недействительна или устарела");
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("should successfully reset password, hash it, and delete token inside transaction", async () => {
      const validToken = "valid-raw-token-123";
      const expectedTokenHash = crypto
        .createHash("sha256")
        .update(validToken)
        .digest("hex");

      const futureDate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes in future
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValueOnce({
        id: "token-record-999",
        userId: "user-123",
        tokenHash: expectedTokenHash,
        expiresAt: futureDate,
        user: { id: "user-123", email: "user@example.com" },
      } as unknown as Awaited<ReturnType<typeof prisma.passwordResetToken.findUnique>>);

      vi.mocked(prisma.$transaction).mockResolvedValueOnce([{}, {}]);

      const result = await resetPassword(validToken, {
        password: "newpassword123",
        confirmPassword: "newpassword123",
      });

      expect(result.success).toBe(true);
      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: expectedTokenHash },
        include: { user: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123", 10);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should return error when database transaction fails", async () => {
      const validToken = "valid-raw-token";
      const futureDate = new Date(Date.now() + 30 * 60 * 1000);
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValueOnce({
        id: "token-record-999",
        userId: "user-123",
        tokenHash: "hash",
        expiresAt: futureDate,
      } as unknown as Awaited<ReturnType<typeof prisma.passwordResetToken.findUnique>>);

      vi.mocked(prisma.$transaction).mockRejectedValueOnce(new Error("DB transaction error"));

      const result = await resetPassword(validToken, {
        password: "newpassword123",
        confirmPassword: "newpassword123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Произошла ошибка при изменении пароля");
    });
  });
});
