import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Вход в аккаунт — TechGear",
  description: "Войдите в личный кабинет интернет-магазина TechGear для управления заказами.",
};

export default function LoginPage() {
  return (
    <div className="w-full py-8 sm:py-12 flex items-center justify-center">
      <Suspense fallback={<div className="text-sm text-slate-500">Загрузка...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
