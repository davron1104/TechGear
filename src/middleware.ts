import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, isValidLocale, LOCALE_COOKIE_NAME } from "@/i18n";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  // 1. Пропускаем админку, API, внутренние роуты Next.js и статические файлы с расширениями
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return;
  }

  // 2. Проверяем, содержит ли URL уже валидный языковой префикс (/ru, /uz, /en)
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isValidLocale(firstSegment)) {
    // Уже локализованный URL — пропускаем без повторных редиректов
    return;
  }

  // Если первый сегмент — неподдерживаемый двухбуквенный код (например, /de, /fr),
  // пропускаем в [locale]/layout.tsx, где отработает нативный notFound()
  if (firstSegment && firstSegment.length === 2 && !isValidLocale(firstSegment)) {
    return;
  }

  // 3. Определяем целевую локаль:
  // а) Из cookie NEXT_LOCALE (если валиден)
  // б) Из заголовка Accept-Language (если uz -> uz, en -> en, иначе ru)
  // в) Fallback: DEFAULT_LOCALE ("ru")
  const cookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  let targetLocale = isValidLocale(cookieLocale) ? cookieLocale : null;

  if (!targetLocale) {
    const acceptLanguage = req.headers.get("accept-language")?.toLowerCase() || "";
    if (acceptLanguage.includes("uz")) {
      targetLocale = "uz";
    } else if (acceptLanguage.includes("en")) {
      targetLocale = "en";
    } else {
      targetLocale = DEFAULT_LOCALE;
    }
  }

  // 4. Формируем локализованный URL с сохранением исходного пути и параметров строки запроса
  const targetPath = pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  const redirectUrl = new URL(`${targetPath}${search}`, req.url);

  return NextResponse.redirect(redirectUrl);
});

export const config = {
  // Перехватываем все маршруты кроме api, _next/static, _next/image и favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
