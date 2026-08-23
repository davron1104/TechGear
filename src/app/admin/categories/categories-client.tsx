"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderPlus, Edit2, Trash2, Loader2, ArrowLeft, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryInput } from "@/lib/validations/category";
import { createCategory, updateCategory, deleteCategory } from "@/actions/category-actions";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface AdminCategoriesClientProps {
  initialCategories: CategoryWithCount[];
}

// Transliteration helper for auto-generating slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
        ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
        я: "ya"
      };
      return map[char] !== undefined ? map[char] : char;
    })
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
};

export function AdminCategoriesClient({ initialCategories }: AdminCategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // Track if slug has been manually edited by the user
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const categoryName = watch("name");

  // Automatically update slug if name changes and user has not manually edited slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value, { shouldValidate: true });
    if (!isSlugManuallyEdited) {
      setValue("slug", generateSlug(value), { shouldValidate: true });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setValue("slug", e.target.value, { shouldValidate: true });
  };

  const handleEditClick = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setStatusMessage(null);
    setIsSlugManuallyEdited(true);
    setValue("name", category.name);
    setValue("slug", category.slug);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setIsSlugManuallyEdited(false);
    reset({ name: "", slug: "" });
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить категорию "${name}"?`)) {
      return;
    }

    setStatusMessage(null);

    startTransition(async () => {
      try {
        const res = await deleteCategory(id);
        if (res.success) {
          setStatusMessage({ text: "Категория успешно удалена.", type: "success" });
          router.refresh();
        } else {
          setStatusMessage({ text: res.error || "Не удалось удалить категорию.", type: "error" });
        }
      } catch (err) {
        setStatusMessage({ text: "Произошла системная ошибка при удалении.", type: "error" });
      }
    });
  };

  const onSubmit = async (data: CategoryInput) => {
    setStatusMessage(null);

    startTransition(async () => {
      try {
        let res;
        if (editingCategory) {
          res = await updateCategory(editingCategory.id, data);
        } else {
          res = await createCategory(data);
        }

        if (res.success) {
          setStatusMessage({
            text: editingCategory ? "Категория успешно обновлена." : "Категория успешно создана.",
            type: "success",
          });
          handleCancelEdit();
          router.refresh();
        } else {
          setStatusMessage({ text: res.error || "Произошла ошибка при сохранении.", type: "error" });
          if (res.fields) {
            Object.entries(res.fields).forEach(([field, messages]) => {
              setError(field as any, {
                type: "server",
                message: messages[0],
              });
            });
          }
        }
      } catch (err) {
        setStatusMessage({ text: "Произошла неожиданная ошибка.", type: "error" });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Admin Top Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-[#0F172A] tracking-tight">
              TechGear<span className="text-[#06B6D4] font-normal"> Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-semibold">
              <Link href="/admin" className="text-slate-500 hover:text-slate-900 transition-colors py-4">
                Обзор
              </Link>
              <Link href="/admin/categories" className="text-[#06B6D4] border-b-2 border-[#06B6D4] py-4">
                Категории
              </Link>
              <Link href="/admin/products" className="text-slate-500 hover:text-slate-900 transition-colors py-4">
                Товары
              </Link>
              <Link href="/admin/orders" className="text-slate-500 hover:text-slate-900 transition-colors py-4">
                Заказы
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> В магазин
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Управление категориями
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Создавайте, редактируйте и удаляйте категории товаров вашего интернет-магазина
          </p>
        </div>

        {/* Global status messages */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs leading-relaxed border ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of categories */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900">Список категорий ({initialCategories.length})</h2>
              </div>

              {initialCategories.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  Нет созданных категорий. Создайте первую категорию в панели справа.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                        <th className="py-3 px-6">Название / Слаг</th>
                        <th className="py-3 px-6 text-center">Товары</th>
                        <th className="py-3 px-6 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {initialCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-900">{category.name}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{category.slug}</div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 font-mono">
                              {category._count.products}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditClick(category)}
                                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Редактировать"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(category.id, category.name)}
                                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Form Create/Edit */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#06B6D4]">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  {editingCategory ? "Редактировать категорию" : "Добавить категорию"}
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Название
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Например, Клавиатуры"
                    {...register("name")}
                    onChange={handleNameChange}
                    className={`w-full px-3 py-2 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                      errors.name ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label
                    htmlFor="slug"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Слаг (URL)
                  </label>
                  <input
                    id="slug"
                    type="text"
                    placeholder="keyboards"
                    {...register("slug")}
                    onChange={handleSlugChange}
                    className={`w-full px-3 py-2 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                      errors.slug ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
                    }`}
                  />
                  {errors.slug && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.slug.message}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-xs font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Сохранение...</span>
                      </>
                    ) : (
                      <>
                        {editingCategory ? (
                          <span>Сохранить изменения</span>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Создать категорию</span>
                          </>
                        )}
                      </>
                    )}
                  </button>

                  {editingCategory && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isPending}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      Отмена
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
