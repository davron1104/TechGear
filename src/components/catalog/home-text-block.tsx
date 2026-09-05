import React from "react";
import {
  HomeTextBlockSettings,
  DEFAULT_HOME_TEXT_BLOCK_SETTINGS,
} from "@/lib/settings";
import { Locale } from "@/i18n";
import { Sparkles, ShieldCheck, Truck, Headphones } from "lucide-react";

interface HomeTextBlockProps {
  settings: HomeTextBlockSettings;
  locale: Locale;
}

const FEATURE_ICONS = [ShieldCheck, Truck, Headphones] as const;

export function HomeTextBlock({ settings, locale }: HomeTextBlockProps) {
  if (!settings || !settings.enabled) {
    return null;
  }

  // Выбираем локализованный контент с фолбэком на русский язык
  const langData = settings[locale] || settings.ru;
  const title = langData.title?.trim() || settings.ru.title?.trim() || "";
  const content = langData.content?.trim() || settings.ru.content?.trim() || "";

  if (!title && !content) {
    return null;
  }

  return (
    <section
      aria-label={title}
      className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl text-white my-8"
    >
      {/* Декоративное неоновое циановое и янтарное свечение */}
      <div className="absolute -right-24 -top-24 w-80 h-80 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 space-y-6">
        {/* Бейдж */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-[#06B6D4] text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>TechGear Store</span>
        </div>

        {/* Заголовок и основной текст */}
        <div className="space-y-4 max-w-4xl">
          {title && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {title}
            </h2>
          )}
          {content && (
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line">
              {content}
            </p>
          )}
        </div>

        {/* Микро-плашки преимуществ (динамические с локализацией) */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => {
            const Icon = FEATURE_ICONS[i];
            const defaultFeature =
              DEFAULT_HOME_TEXT_BLOCK_SETTINGS.ru.features[i];

            const featTitle =
              langData.features?.[i]?.title?.trim() ||
              settings.ru.features?.[i]?.title?.trim() ||
              defaultFeature.title;

            const featDesc =
              langData.features?.[i]?.description?.trim() ||
              settings.ru.features?.[i]?.description?.trim() ||
              defaultFeature.description;

            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800"
              >
                <div className="p-2 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                    {featTitle}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {featDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

