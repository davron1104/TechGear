import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Восстановление пароля — TechGear",
  description: "Восстановление доступа к личному кабинету TechGear.",
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full py-8 sm:py-12 flex items-center justify-center">
      <Suspense fallback={<div className="text-sm text-slate-500">Загрузка...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
