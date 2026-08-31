"use client";

import React, { useState, useTransition } from "react";
import {
  updateExchangeRate,
  refreshExchangeRateFromCbu,
} from "@/actions/settings-actions";
import {
  DollarSign,
  TrendingUp,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Clock,
  Building2,
  Globe2,
} from "lucide-react";

interface ExchangeRateFormProps {
  initialRate: number;
  initialUpdatedAt?: string | null;
  initialSource?: string | null;
}

export function ExchangeRateForm({
  initialRate,
  initialUpdatedAt = null,
  initialSource = null,
}: ExchangeRateFormProps) {
  const [currentRate, setCurrentRate] = useState<number>(initialRate);
  const [rateInput, setRateInput] = useState<string>(initialRate.toString());
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [source, setSource] = useState<string | null>(
    initialSource || "Центральный банк РУз (cbu.uz)"
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isManualPending, startManualTransition] = useTransition();
  const [isSyncPending, startSyncTransition] = useTransition();

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRateInput(e.target.value);
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  // Ручное сохранение курса
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const parsed = parseFloat(rateInput);
    if (isNaN(parsed)) {
      setError("Пожалуйста, введите корректное число.");
      return;
    }

    if (parsed < 1000) {
      setError("Курс USD не может быть меньше 1 000 сум.");
      return;
    }

    if (parsed > 100000) {
      setError("Курс USD не может превышать 100 000 сум.");
      return;
    }

    startManualTransition(async () => {
      const res = await updateExchangeRate({ rate: parsed });
      if (res.success) {
        setCurrentRate(res.data.exchangeRate);
        setRateInput(res.data.exchangeRate.toString());
        if (res.data.updatedAt) setUpdatedAt(res.data.updatedAt);
        if (res.data.source) setSource(res.data.source);
        setSuccessMessage(
          `Курс успешно сохранен вручную: 1 USD = ${res.data.exchangeRate.toLocaleString(
            "ru-RU"
          )} сум`
        );
      } else {
        setError(res.error || "Не удалось обновить курс валюты.");
      }
    });
  };

  // Автоматическое получение курса из ЦБ РУз
  const handleSyncCbu = () => {
    setError(null);
    setSuccessMessage(null);

    startSyncTransition(async () => {
      const res = await refreshExchangeRateFromCbu();
      if (res.success) {
        setCurrentRate(res.data.exchangeRate);
        setRateInput(res.data.exchangeRate.toString());
        setUpdatedAt(res.data.updatedAt);
        setSource(res.data.source);
        setSuccessMessage(
          `Курс успешно обновлен из ЦБ РУз: 1 USD = ${res.data.exchangeRate.toLocaleString(
            "ru-RU"
          )} сум`
        );
      } else {
        setError(res.error || "Не удалось получить актуальный курс от ЦБ РУз.");
      }
    });
  };

  // Форматирование даты
  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "Не зафиксировано";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const isBusy = isManualPending || isSyncPending;
  const previewAmountUzs = 1250000;
  const numRate = parseFloat(rateInput);
  const validPreviewRate = !isNaN(numRate) && numRate > 0 ? numRate : currentRate;
  const previewUsd = Math.round((previewAmountUzs / validPreviewRate) * 100) / 100;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Карточка текущего статуса курса */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl border border-emerald-100 shadow-xs">
              $
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Текущий рабочий курс
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-0.5">
                1 USD = {currentRate.toLocaleString("ru-RU")} сум
              </div>
            </div>
          </div>

          {/* Кнопка синхронизации с ЦБ РУз */}
          <button
            type="button"
            onClick={handleSyncCbu}
            disabled={isBusy}
            aria-label="Обновить курс из ЦБ РУз"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-[#06B6D4] text-xs font-bold transition-all border border-cyan-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            {isSyncPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#06B6D4]" />
                <span>Запрос к ЦБ РУз...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-[#06B6D4]" />
                <span>Обновить из ЦБ РУз</span>
              </>
            )}
          </button>
        </div>

        {/* Метаданные: Источник и Время */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/80">
            <Building2 className="w-4 h-4 text-cyan-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Источник курса
              </span>
              <span className="font-semibold text-slate-900">{source}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/80">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Последнее обновление
              </span>
              <span className="font-semibold text-slate-900">
                {formatDateTime(updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Уведомления об успехе или ошибке */}
      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 shadow-2xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{successMessage}</div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">{error}</div>
        </div>
      )}

      {/* Блок ручного переопределения (Manual Override) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#06B6D4]" />
            <span>Ручное переопределение курса</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Вы можете вручную задать фиксированный курс. При этом автообновление останется доступным по кнопке выше или по ежедневному расписанию.
          </p>
        </div>

        <form onSubmit={handleManualSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="exchange-rate-input"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Курс доллара (в сумах за 1 USD)
            </label>
            <div className="relative">
              <input
                id="exchange-rate-input"
                type="number"
                min="1000"
                max="100000"
                step="any"
                value={rateInput}
                onChange={handleRateChange}
                disabled={isBusy}
                placeholder="Например: 12800"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all disabled:opacity-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                UZS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Допустимый диапазон: от 1 000 до 100 000 сум.
            </p>
          </div>

          {/* Пример пересчета */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
            <span className="font-semibold text-slate-700 block">
              Пример расчета цен на витрине при данном курсе:
            </span>
            <div className="flex items-center justify-between text-slate-600">
              <span>Товар стоимостью 1 250 000 сум:</span>
              <span className="font-mono font-bold text-slate-900">
                ≈ ${previewUsd} USD
              </span>
            </div>
          </div>

          {/* Кнопки формы */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isBusy || parseFloat(rateInput) === currentRate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-[#0F172A] cursor-pointer disabled:cursor-not-allowed"
            >
              {isManualPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить вручную</span>
                </>
              )}
            </button>

            {parseFloat(rateInput) !== currentRate && (
              <button
                type="button"
                onClick={() => {
                  setRateInput(currentRate.toString());
                  setError(null);
                }}
                disabled={isBusy}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Информационный блок о безопасности и неизменности */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 text-xs text-blue-900 space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-blue-950">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Архитектурные правила обработки валют TechGear</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-blue-800/90 pl-1">
          <li>
            Официальный источник: <strong>Центральный банк Республики Узбекистан (cbu.uz)</strong>.
          </li>
          <li>
            Базовые цены всех товаров в базе данных хранятся в <strong>UZS</strong> и никогда не изменяются при колебаниях курса.
          </li>
          <li>
            Исторические заказы сохраняют свой курс на момент оформления (<code>order.exchangeRate</code>) и не пересчитываются.
          </li>
          <li>
            При недоступности внешнего API магазин гарантированно продолжает работу на последнем валидном значении курса.
          </li>
        </ul>
      </div>
    </div>
  );
}
