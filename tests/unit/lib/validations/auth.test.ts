import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("auth Zod Validation schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should fail validation for empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain("Пароль обязателен для заполнения");
      }
    });

    it("should fail validation for short password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain("Пароль должен содержать минимум 6 символов");
      }
    });
  });

  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const result = registerSchema.safeParse({
        name: "Константин",
        email: "konst@example.com",
        password: "securepassword",
        confirmPassword: "securepassword",
      });
      expect(result.success).toBe(true);
    });

    it("should fail validation if passwords do not match", () => {
      const result = registerSchema.safeParse({
        name: "Константин",
        email: "konst@example.com",
        password: "securepassword1",
        confirmPassword: "securepassword2",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toContain("Пароли не совпадают");
      }
    });

    it("should fail validation for too short name", () => {
      const result = registerSchema.safeParse({
        name: "К",
        email: "konst@example.com",
        password: "password",
        confirmPassword: "password",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toContain("Имя должно содержать минимум 2 символа");
      }
    });
  });
});
