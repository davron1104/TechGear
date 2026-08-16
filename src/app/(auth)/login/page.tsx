import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Вход в аккаунт — TechGear",
  description: "Войдите в личный кабинет интернет-магазина TechGear для управления заказами.",
};

export default function LoginPage() {
  return (
    <div className="w-full py-8 sm:py-12 flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
