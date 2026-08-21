import { describe, it, expect } from "vitest";
import { checkoutSchema } from "@/lib/validations/checkout";

describe("checkoutSchema Zod Validation", () => {
  const validPickupData = {
    name: "Иван Иванов",
    email: "ivan@example.com",
    phone: "89991234567",
    deliveryMethod: "pickup" as const,
    city: "Москва",
  };

  const validCourierData = {
    name: "Иван Иванов",
    email: "ivan@example.com",
    phone: "89991234567",
    deliveryMethod: "courier" as const,
    city: "Москва",
    street: "Ленина",
    house: "10",
  };

  it("should validate valid pickup data successfully", () => {
    const result = checkoutSchema.safeParse(validPickupData);
    expect(result.success).toBe(true);
  });

  it("should validate valid courier data successfully", () => {
    const result = checkoutSchema.safeParse(validCourierData);
    expect(result.success).toBe(true);
  });

  it("should fail validation if courier delivery is chosen but street and house are missing", () => {
    const invalidCourier = {
      ...validCourierData,
      street: "",
      house: "",
    };

    const result = checkoutSchema.safeParse(invalidCourier);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      expect(errorMap.street).toContain("Укажите улицу для курьерской доставки");
      expect(errorMap.house).toContain("Укажите номер дома");
    }
  });

  it("should fail validation if email is incorrect", () => {
    const invalidEmailData = {
      ...validPickupData,
      email: "invalid-email",
    };

    const result = checkoutSchema.safeParse(invalidEmailData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      expect(errorMap.email).toContain("Введите корректный email для отправки чека");
    }
  });

  it("should fail validation if phone number is too short", () => {
    const invalidPhoneData = {
      ...validPickupData,
      phone: "123",
    };

    const result = checkoutSchema.safeParse(invalidPhoneData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      expect(errorMap.phone).toContain("Номер телефона должен содержать минимум 10 цифр");
    }
  });

  it("should fail validation if name is empty or too short", () => {
    const invalidNameData = {
      ...validPickupData,
      name: "И",
    };

    const result = checkoutSchema.safeParse(invalidNameData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      expect(errorMap.name).toContain("Имя должно содержать не менее 2 символов");
    }
  });
});
