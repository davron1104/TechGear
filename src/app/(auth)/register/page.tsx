import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Регистрация — TechGear",
  description: "Создайте аккаунт в интернет-магазине TechGear и покупайте девайсы со скидками и историей заказов.",
};

export default function RegisterPage() {
  return (
    <div className="w-full py-8 sm:py-12 flex items-center justify-center">
      <RegisterForm />
    </div>
  );
}
