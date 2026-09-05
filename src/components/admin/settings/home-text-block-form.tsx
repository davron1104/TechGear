"use client";

import React, { useState, useTransition } from "react";
import {
  HomeTextBlockSettings,
  LocalizedTextContent,
  LocalizedFeature,
  DEFAULT_HOME_TEXT_BLOCK_SETTINGS,
} from "@/lib/settings";
import { updateHomeTextBlockSettings } from "@/actions/settings-actions";
import {
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Globe,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  ShieldCheck,
  Truck,
  Headphones,
  Award,
} from "lucide-react";

interface HomeTextBlockFormProps {
  initialSettings: HomeTextBlockSettings;
}

type LangTab = "ru" | "uz" | "en";

const TAB_CONFIG: Record<
  LangTab,
  { label: string; fullLabel: string; flag: string; required: boolean }
> = {
  ru: { label: "RU", fullLabel: "Русский (основной)", flag: "🇷🇺", required: true },
  uz: { label: "UZ", fullLabel: "O‘zbekcha", flag: "🇺🇿", required: false },
  en: { label: "EN", fullLabel: "English", flag: "🇬🇧", required: false },
};

const FEATURE_META = [
  {
    index: 0 as const,
    label: "Преимущество 1 (Оригинальность / Гарантия)",
    icon: ShieldCheck,
    color: "text-[#06B6D4]",
    bgColor: "bg-[#06B6D4]/10",
  },
  {
    index: 1 as const,
    label: "Преимущество 2 (Доставка)",
    icon: Truck,
    color: "text-[#06B6D4]",
    bgColor: "bg-[#06B6D4]/10",
  },
  {
    index: 2 as const,
    label: "Преимущество 3 (Поддержка / Сервис)",
    icon: Headphones,
    color: "text-[#06B6D4]",
    bgColor: "bg-[#06B6D4]/10",
  },
];

export function HomeTextBlockForm({ initialSettings }: HomeTextBlockFormProps) {
  const [formData, setFormData] = useState<HomeTextBlockSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<LangTab>("ru");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleToggleEnabled = () => {
    setFormData((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
    if (serverError) setServerError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleTextChange = (
    lang: LangTab,
    field: "title" | "content",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));

    const errorKey = `${lang}.${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
    if (serverError) setServerError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleFeatureChange = (
    lang: LangTab,
    index: 0 | 1 | 2,
    field: keyof LocalizedFeature,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedFeatures = [...prev[lang].features] as [
        LocalizedFeature,
        LocalizedFeature,
        LocalizedFeature,
      ];
      updatedFeatures[index] = {
        ...updatedFeatures[index],
        [field]: value,
      };
      return {
        ...prev,
        [lang]: {
          ...prev[lang],
          features: updatedFeatures,
        },
      };
    });

    const errorKey = `${lang}.features.${index}.${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
    if (serverError) setServerError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateHomeTextBlockSettings(formData);
      if (res.success) {
        setFormData(res.data);
        setSuccessMessage(
          "Текстовый блок и преимущества главной страницы успешно обновлены."
        );
      } else {
        setServerError(res.error || "Не удалось сохранить настройки текстового блока.");
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      }
    });
  };

  const currentLangData = formData[activeTab];
  const activeTitle =
    currentLangData.title.trim() || (activeTab !== "ru" ? formData.ru.title : "");
  const activeContent =
    currentLangData.content.trim() ||
    (activeTab !== "ru" ? formData.ru.content : "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-900">Успешно</h4>
            <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Ошибка сохранения</h4>
            <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header with Status Switch */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#06B6D4]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Информационный блок витрины
              </h3>
              <p className="text-xs text-slate-500">
                Управление презентационным текстом, заголовком и тремя преимуществами на главной
              </p>
            </div>
          </div>

          {/* Visibility Toggle Button */}
          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              formData.enabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {formData.enabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-600" />
                <span>Блок включен</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-slate-400" />
                <span>Блок выключен</span>
              </>
            )}
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Language Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#06B6D4]" />
                Языковые версии блока
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeTab === "ru"
                  ? "Основной язык (обязателен)"
                  : "При отсутствии будет показана русская версия"}
              </span>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
              {(["ru", "uz", "en"] as LangTab[]).map((tab) => {
                const config = TAB_CONFIG[tab];
                const isCurrent = activeTab === tab;
                const isFilled =
                  formData[tab].title.trim() && formData[tab].content.trim();

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <span>{config.flag}</span>
                    <span>{config.label}</span>
                    <span className="hidden sm:inline text-xs font-normal text-slate-500">
                      ({config.fullLabel})
                    </span>
                    {isFilled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Основные текстовые поля (Заголовок и Текст) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              Заголовок и описание ({TAB_CONFIG[activeTab].label})
            </h4>

            {/* Title Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`home-title-${activeTab}`}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Заголовок блока
                  {TAB_CONFIG[activeTab].required && (
                    <span className="text-rose-500 ml-0.5">*</span>
                  )}
                </label>
                <span className="text-xs text-slate-400">
                  {formData[activeTab].title.length} / 150
                </span>
              </div>
              <input
                id={`home-title-${activeTab}`}
                type="text"
                value={formData[activeTab].title}
                onChange={(e) =>
                  handleTextChange(activeTab, "title", e.target.value)
                }
                placeholder={DEFAULT_HOME_TEXT_BLOCK_SETTINGS[activeTab].title}
                maxLength={150}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all ${
                  fieldErrors[`${activeTab}.title`]
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-200"
                }`}
              />
              {fieldErrors[`${activeTab}.title`] && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {fieldErrors[`${activeTab}.title`][0]}
                </p>
              )}
            </div>

            {/* Content Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`home-content-${activeTab}`}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Основной текст блока
                  {TAB_CONFIG[activeTab].required && (
                    <span className="text-rose-500 ml-0.5">*</span>
                  )}
                </label>
                <span className="text-xs text-slate-400">
                  {formData[activeTab].content.length} / 3000
                </span>
              </div>
              <textarea
                id={`home-content-${activeTab}`}
                rows={3}
                value={formData[activeTab].content}
                onChange={(e) =>
                  handleTextChange(activeTab, "content", e.target.value)
                }
                placeholder={DEFAULT_HOME_TEXT_BLOCK_SETTINGS[activeTab].content}
                maxLength={3000}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all leading-relaxed ${
                  fieldErrors[`${activeTab}.content`]
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-200"
                }`}
              />
              {fieldErrors[`${activeTab}.content`] && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {fieldErrors[`${activeTab}.content`][0]}
                </p>
              )}
            </div>
          </div>

          {/* 2. Преимущества магазина (3 карточки) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#06B6D4]" />
                3 Преимущества магазина ({TAB_CONFIG[activeTab].label})
              </h4>
              <span className="text-xs text-slate-400">
                Отображаются внизу информационного блока
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {FEATURE_META.map(({ index, label, icon: Icon, color, bgColor }) => {
                const feature = formData[activeTab].features[index];
                const defaultFeature =
                  DEFAULT_HOME_TEXT_BLOCK_SETTINGS[activeTab].features[index];
                const titleError =
                  fieldErrors[`${activeTab}.features.${index}.title`];
                const descError =
                  fieldErrors[`${activeTab}.features.${index}.description`];

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg ${bgColor} ${color} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {label}
                      </span>
                    </div>

                    {/* Feature Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor={`feature-title-${activeTab}-${index}`}
                          className="block text-[11px] font-bold text-slate-600 uppercase"
                        >
                          Заголовок
                          {TAB_CONFIG[activeTab].required && (
                            <span className="text-rose-500 ml-0.5">*</span>
                          )}
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {feature.title.length} / 60
                        </span>
                      </div>
                      <input
                        id={`feature-title-${activeTab}-${index}`}
                        type="text"
                        value={feature.title}
                        onChange={(e) =>
                          handleFeatureChange(
                            activeTab,
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder={defaultFeature.title}
                        maxLength={60}
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                          titleError ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                        }`}
                      />
                      {titleError && (
                        <p className="text-[11px] text-rose-600 mt-0.5 font-medium">
                          {titleError[0]}
                        </p>
                      )}
                    </div>

                    {/* Feature Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor={`feature-desc-${activeTab}-${index}`}
                          className="block text-[11px] font-bold text-slate-600 uppercase"
                        >
                          Описание
                          {TAB_CONFIG[activeTab].required && (
                            <span className="text-rose-500 ml-0.5">*</span>
                          )}
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {feature.description.length} / 100
                        </span>
                      </div>
                      <input
                        id={`feature-desc-${activeTab}-${index}`}
                        type="text"
                        value={feature.description}
                        onChange={(e) =>
                          handleFeatureChange(
                            activeTab,
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder={defaultFeature.description}
                        maxLength={100}
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                          descError ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                        }`}
                      />
                      {descError && (
                        <p className="text-[11px] text-rose-600 mt-0.5 font-medium">
                          {descError[0]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeTab !== "ru" && (
              <div className="flex items-center gap-2 p-3 bg-cyan-50/60 border border-cyan-200/60 rounded-xl text-xs text-cyan-800">
                <Info className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <span>
                  Для языка {TAB_CONFIG[activeTab].label} пустые поля заголовков,
                  текста и преимуществ автоматически заменяются русской версией на витрине.
                </span>
              </div>
            )}
          </div>

          {/* 3. Live Preview Block (полное соответствие витрине) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                Предпросмотр блока на главной ({TAB_CONFIG[activeTab].label})
              </span>
              {!formData.enabled && (
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Скрыт на витрине
                </span>
              )}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl text-white p-6 sm:p-8 space-y-6">
              {/* Decorative cyan and amber radial glow */}
              <div className="absolute -right-20 -top-20 w-72 h-72 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-4 max-w-3xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-[#06B6D4] text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>TechGear Store</span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {activeTitle || "Заголовок блока..."}
                </h3>

                {/* Content */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {activeContent || "Основной текст блока..."}
                </p>
              </div>

              {/* 3 Features Preview */}
              <div className="relative z-10 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {FEATURE_META.map(({ index, icon: Icon }) => {
                  const feature = formData[activeTab].features[index];
                  const fallbackRuFeature = formData.ru.features[index];
                  const defaultFeature =
                    DEFAULT_HOME_TEXT_BLOCK_SETTINGS.ru.features[index];

                  const featTitle =
                    feature.title.trim() ||
                    (activeTab !== "ru" ? fallbackRuFeature.title : "") ||
                    defaultFeature.title;
                  const featDesc =
                    feature.description.trim() ||
                    (activeTab !== "ru" ? fallbackRuFeature.description : "") ||
                    defaultFeature.description;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800"
                    >
                      <div className="p-2 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                          {featTitle}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {featDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer with Save Button */}
        <div className="p-5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Изменения вступают в силу мгновенно после сохранения и обновляют витрину магазина.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold text-sm rounded-xl transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Сохранить текстовый блок</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
