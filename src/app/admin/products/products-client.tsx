"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  Plus,
  X,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productSchema } from "@/lib/validations/product";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/actions/product-actions";
import { uploadProductImage } from "@/actions/upload-actions";

// Form schema without characteristics & images (managed in separate local state)
const formSchema = productSchema.omit({ characteristics: true, images: true });
type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category: Category;
  price: number;
  brand: string;
  stock: number;
  image: string;
  images?: string[];
  shortDescription: string;
  description: string;
  characteristics: Record<string, string>;
  isPopular?: boolean;
  deletedAt: string | null;
  createdAt: string;
}

interface CharacteristicRow {
  key: string;
  value: string;
}

interface AdminProductsClientProps {
  initialProducts: ProductData[];
  categories: Category[];
}

// Transliteration helper for auto-generating slug from Russian text
const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
        ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e",
        ю: "yu", я: "ya",
      };
      return map[char] ?? char;
    })
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export function AdminProductsClient({
  initialProducts,
  categories,
}: AdminProductsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [characteristics, setCharacteristics] = useState<CharacteristicRow[]>([
    { key: "", value: "" },
  ]);

  // Image upload state
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Additional Gallery Images state
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
  const [additionalUrlInput, setAdditionalUrlInput] = useState("");
  const [additionalUploadError, setAdditionalUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      categoryId: "",
      price: 0,
      brand: "",
      stock: 0,
      image: "",
      shortDescription: "",
      description: "",
      isPopular: false,
    },
  });

  const currentImageUrl = watch("image");

  // ── Helpers ──────────────────────────────────────────────────────────────

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
      hasError ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
    }`;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError(null);

    // Client-side MIME validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError(
        "Недопустимый формат файла. Поддерживаются только JPG, PNG, WebP, GIF."
      );
      return;
    }

    // Client-side size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError(
        `Размер файла (${(file.size / (1024 * 1024)).toFixed(1)} МБ) превышает лимит 5 МБ.`
      );
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadProductImage(formData);
      if (res.success) {
        setValue("image", res.url, { shouldValidate: true });
        setImageUploadError(null);
      } else {
        setImageUploadError(res.error || "Не удалось загрузить изображение.");
      }
    } catch {
      setImageUploadError("Произошла ошибка при загрузке файла.");
    } finally {
      setIsUploadingImage(false);
      // Reset input value to allow re-selecting same file if needed
      e.target.value = "";
    }
  };

  const handleAdditionalFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (additionalImages.length >= 5) {
      setAdditionalUploadError("Максимум 5 дополнительных изображений.");
      return;
    }

    setAdditionalUploadError(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setAdditionalUploadError("Поддерживаются только JPG, PNG, WebP, GIF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAdditionalUploadError(
        `Размер файла (${(file.size / (1024 * 1024)).toFixed(1)} МБ) превышает лимит 5 МБ.`
      );
      return;
    }

    setIsUploadingAdditional(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadProductImage(formData);
      if (res.success) {
        setAdditionalImages((prev) => [...prev, res.url]);
        setAdditionalUploadError(null);
      } else {
        setAdditionalUploadError(res.error || "Не удалось загрузить изображение.");
      }
    } catch {
      setAdditionalUploadError("Ошибка при загрузке файла.");
    } finally {
      setIsUploadingAdditional(false);
      e.target.value = "";
    }
  };

  const handleAddAdditionalUrl = () => {
    const trimmed = additionalUrlInput.trim();
    if (!trimmed) return;

    if (additionalImages.length >= 5) {
      setAdditionalUploadError("Максимум 5 дополнительных изображений.");
      return;
    }

    if (!trimmed.startsWith("/") && !/^https?:\/\//i.test(trimmed)) {
      setAdditionalUploadError(
        "Введите корректную ссылку http(s):// или путь /uploads/..."
      );
      return;
    }

    if (additionalImages.includes(trimmed) || currentImageUrl === trimmed) {
      setAdditionalUploadError("Это изображение уже добавлено.");
      return;
    }

    setAdditionalImages((prev) => [...prev, trimmed]);
    setAdditionalUrlInput("");
    setAdditionalUploadError(null);
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalUploadError(null);
  };

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

  // ── Form open/close ───────────────────────────────────────────────────────

  const openCreateForm = () => {
    setEditingProduct(null);
    setIsSlugManuallyEdited(false);
    setImageUploadError(null);
    setImageInputMode("upload");
    setAdditionalImages([]);
    setAdditionalUrlInput("");
    setAdditionalUploadError(null);
    setCharacteristics([{ key: "", value: "" }]);
    reset({
      name: "",
      slug: "",
      categoryId: categories[0]?.id ?? "",
      price: 0,
      brand: "",
      stock: 0,
      image: "",
      shortDescription: "",
      description: "",
      isPopular: false,
    });
    setStatusMessage(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: ProductData) => {
    setEditingProduct(product);
    setIsSlugManuallyEdited(true);
    setImageUploadError(null);
    setImageInputMode(product.image?.startsWith("/uploads/") ? "upload" : "url");
    const extra = (product.images || []).filter((img) => img !== product.image);
    setAdditionalImages(extra);
    setAdditionalUrlInput("");
    setAdditionalUploadError(null);
    const charRows = Object.entries(product.characteristics).map(
      ([key, value]) => ({ key, value })
    );
    setCharacteristics(charRows.length > 0 ? charRows : [{ key: "", value: "" }]);
    reset({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      price: product.price,
      brand: product.brand,
      stock: product.stock,
      image: product.image,
      shortDescription: product.shortDescription,
      description: product.description,
      isPopular: product.isPopular ?? false,
    });
    setStatusMessage(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // ── Characteristics helpers ───────────────────────────────────────────────

  const addCharacteristic = () =>
    setCharacteristics((prev) => [...prev, { key: "", value: "" }]);

  const removeCharacteristic = (index: number) =>
    setCharacteristics((prev) => prev.filter((_, i) => i !== index));

  const updateCharacteristic = (
    index: number,
    field: "key" | "value",
    val: string
  ) =>
    setCharacteristics((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row))
    );

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteClick = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Удалить товар "${name}"?\n\nЕсли товар связан с заказами, он будет скрыт (Soft Delete) и не будет отображаться в каталоге.`
      )
    )
      return;

    setStatusMessage(null);
    startTransition(async () => {
      try {
        const res = await deleteProduct(id);
        if (res.success) {
          setStatusMessage({ text: "Товар успешно удалён.", type: "success" });
          router.refresh();
        } else {
          setStatusMessage({
            text: res.error || "Не удалось удалить товар.",
            type: "error",
          });
        }
      } catch {
        setStatusMessage({
          text: "Произошла системная ошибка при удалении.",
          type: "error",
        });
      }
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (formData: FormValues) => {
    setStatusMessage(null);

    // Convert characteristics rows → Record<string, string>
    const charRecord: Record<string, string> = {};
    for (const row of characteristics) {
      if (row.key.trim()) {
        charRecord[row.key.trim()] = row.value.trim();
      }
    }

    const fullData = {
      ...formData,
      images: additionalImages,
      characteristics: charRecord,
    };

    startTransition(async () => {
      try {
        const res = editingProduct
          ? await updateProduct(editingProduct.id, fullData)
          : await createProduct(fullData);

        if (res.success) {
          setStatusMessage({
            text: editingProduct
              ? "Товар успешно обновлён."
              : "Товар успешно создан.",
            type: "success",
          });
          closeForm();
          router.refresh();
        } else {
          setStatusMessage({
            text: res.error || "Ошибка при сохранении товара.",
            type: "error",
          });
          if ("fields" in res && res.fields) {
            Object.entries(res.fields).forEach(([field, messages]) => {
              setError(field as keyof FormValues, {
                type: "server",
                message: messages[0],
              });
            });
          }
        }
      } catch {
        setStatusMessage({ text: "Произошла неожиданная ошибка.", type: "error" });
      }
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Admin Top Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-[#0F172A] tracking-tight">
              TechGear
              <span className="text-[#06B6D4] font-normal"> Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-semibold">
              <Link
                href="/admin"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Обзор
              </Link>
              <Link
                href="/admin/categories"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Категории
              </Link>
              <Link
                href="/admin/products"
                className="text-[#06B6D4] border-b-2 border-[#06B6D4] py-4"
              >
                Товары
              </Link>
              <Link
                href="/admin/orders"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Заказы
              </Link>
              <Link
                href="/admin/settings"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Настройки
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> В магазин
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Управление товарами
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Создавайте, редактируйте и удаляйте товары интернет-магазина
            </p>
          </div>
          <button
            id="btn-add-product"
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-xs font-bold shadow-md transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить товар
          </button>
        </div>

        {/* Status Message */}
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

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">
              Список товаров ({initialProducts.length})
            </h2>
            <span className="text-xs text-slate-400">
              Мягко удалённые товары отображаются серым цветом
            </span>
          </div>

          {initialProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">
                Нет товаров. Создайте первый товар.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                    <th className="py-3 px-6">Товар</th>
                    <th className="py-3 px-4">Категория</th>
                    <th className="py-3 px-4 text-right">Цена</th>
                    <th className="py-3 px-4 text-center">Остаток</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {initialProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        product.deletedAt ? "opacity-50" : ""
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                          )}
                          <div>
                            <div
                              className={`font-semibold text-slate-900 ${
                                product.deletedAt
                                  ? "line-through text-slate-400"
                                  : ""
                              }`}
                            >
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-400 font-mono">
                                {product.slug}
                              </span>
                              {product.isPopular && !product.deletedAt && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                  ⭐ Популярный
                                </span>
                              )}
                            </div>
                            {product.deletedAt && (
                              <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                Скрыт (Soft Delete)
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-sm font-semibold text-slate-900">
                        {product.price.toLocaleString("ru-RU")} сум
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${
                            product.stock > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!product.deletedAt && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditClick(product)}
                              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Редактировать"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteClick(product.id, product.name)
                              }
                              disabled={isPending}
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Create/Edit Modal ─────────────────────────────────────────────── */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#06B6D4]">
                  <Package className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  {editingProduct ? "Редактировать товар" : "Добавить товар"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 space-y-5"
              noValidate
            >
              {/* Name + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="prod-name"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Название *
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    placeholder="Механическая клавиатура..."
                    {...register("name")}
                    onChange={handleNameChange}
                    className={inputClass(!!errors.name)}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="prod-slug"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Слаг (URL) *
                  </label>
                  <input
                    id="prod-slug"
                    type="text"
                    placeholder="mekhanicheskaya-klaviatura"
                    {...register("slug")}
                    onChange={handleSlugChange}
                    className={`${inputClass(!!errors.slug)} font-mono`}
                  />
                  {errors.slug && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="prod-category"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Категория *
                  </label>
                  <select
                    id="prod-category"
                    {...register("categoryId")}
                    className={inputClass(!!errors.categoryId)}
                  >
                    <option value="">— Выберите категорию —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="prod-brand"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Бренд *
                  </label>
                  <input
                    id="prod-brand"
                    type="text"
                    placeholder="Logitech, Razer..."
                    {...register("brand")}
                    className={inputClass(!!errors.brand)}
                  />
                  {errors.brand && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.brand.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="prod-price"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Цена (UZS) *
                  </label>
                  <input
                    id="prod-price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="450000"
                    {...register("price", { valueAsNumber: true })}
                    className={`${inputClass(!!errors.price)} font-mono`}
                  />
                  {errors.price && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="prod-stock"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Остаток (шт.) *
                  </label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="10"
                    {...register("stock", { valueAsNumber: true })}
                    className={`${inputClass(!!errors.stock)} font-mono`}
                  />
                  {errors.stock && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload / URL Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Главное изображение *
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setImageInputMode("upload");
                        setImageUploadError(null);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        imageInputMode === "upload"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Загрузить с ПК
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageInputMode("url");
                        setImageUploadError(null);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        imageInputMode === "url"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Указать URL
                    </button>
                  </div>
                </div>

                {imageInputMode === "upload" ? (
                  <div className="space-y-3">
                    {/* File Dropzone or Preview */}
                    {currentImageUrl ? (
                      <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Изображение прикреплено</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            {currentImageUrl}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                            <span>Заменить</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              onChange={handleFileUpload}
                              disabled={isUploadingImage}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setValue("image", "", { shouldValidate: true })}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Удалить фото"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          isUploadingImage
                            ? "border-[#06B6D4] bg-cyan-50/20 cursor-wait"
                            : "border-slate-200 hover:border-[#06B6D4] bg-slate-50/50 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleFileUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center gap-2 text-[#06B6D4]">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xs font-semibold">
                              Сохранение на сервере...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#06B6D4] mb-2">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                              Нажмите для выбора файла с компьютера
                            </span>
                            <span className="text-[11px] text-slate-400 mt-1">
                              PNG, JPG, WebP, GIF до 5 МБ
                            </span>
                          </div>
                        )}
                      </label>
                    )}

                    {/* Upload Error Banner */}
                    {imageUploadError && (
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                          <p className="font-medium">{imageUploadError}</p>
                          <p className="text-[11px] text-rose-600 mt-0.5">
                            Вы можете переключиться на вкладку «Указать URL» и вставить прямую ссылку на изображение.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      id="prod-image"
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      {...register("image")}
                      className={inputClass(!!errors.image)}
                    />

                    {/* Direct URL Preview */}
                    {currentImageUrl && (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-white border border-slate-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 font-mono truncate flex-1">
                          {currentImageUrl}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Validation error from hook-form */}
                {errors.image && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* Additional Gallery Images Section */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Дополнительные фото для галереи
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Для слайдера на странице товара (до 5 дополнительных фото)
                    </p>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {additionalImages.length} / 5
                  </span>
                </div>

                {/* Thumbnails of added additional images */}
                {additionalImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {additionalImages.map((imgUrl, idx) => (
                      <div
                        key={imgUrl + idx}
                        className="group relative aspect-square bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-1"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Галерея ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                          title="Удалить фото"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Additional Image Controls */}
                {additionalImages.length < 5 && (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <label
                        className={`px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 ${
                          isUploadingAdditional ? "opacity-50 cursor-wait" : ""
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleAdditionalFileUpload}
                          disabled={isUploadingAdditional}
                          className="hidden"
                        />
                        {isUploadingAdditional ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06B6D4]" />
                            <span>Загрузка...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 text-[#06B6D4]" />
                            <span>Загрузить с ПК</span>
                          </>
                        )}
                      </label>

                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          placeholder="Или вставьте URL дополнительного фото..."
                          value={additionalUrlInput}
                          onChange={(e) => setAdditionalUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddAdditionalUrl();
                            }
                          }}
                          className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
                        />
                        <button
                          type="button"
                          onClick={handleAddAdditionalUrl}
                          disabled={!additionalUrlInput.trim()}
                          className="px-3 py-2 bg-slate-900 hover:bg-[#06B6D4] disabled:opacity-40 disabled:hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          Добавить
                        </button>
                      </div>
                    </div>

                    {additionalUploadError && (
                      <p className="text-xs text-rose-600 font-medium">
                        {additionalUploadError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label
                  htmlFor="prod-short-desc"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Краткое описание *{" "}
                  <span className="text-slate-400 normal-case font-normal">
                    (до 500 символов)
                  </span>
                </label>
                <textarea
                  id="prod-short-desc"
                  rows={2}
                  placeholder="Одна-две фразы о товаре..."
                  {...register("shortDescription")}
                  className={`${inputClass(!!errors.shortDescription)} resize-none`}
                />
                {errors.shortDescription && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="prod-desc"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Полное описание *
                </label>
                <textarea
                  id="prod-desc"
                  rows={4}
                  placeholder="Подробное описание товара..."
                  {...register("description")}
                  className={`${inputClass(!!errors.description)} resize-none`}
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Characteristics — dynamic key-value rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Характеристики
                  </label>
                  <button
                    type="button"
                    onClick={addCharacteristic}
                    className="flex items-center gap-1 text-xs text-[#06B6D4] hover:text-[#0891B2] font-medium transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Добавить
                  </button>
                </div>
                <div className="space-y-2">
                  {characteristics.map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Название"
                        value={row.key}
                        onChange={(e) =>
                          updateCharacteristic(index, "key", e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Значение"
                        value={row.value}
                        onChange={(e) =>
                          updateCharacteristic(index, "value", e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeCharacteristic(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                        title="Удалить строку"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Product Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors select-none">
                  <input
                    type="checkbox"
                    {...register("isPopular")}
                    className="mt-0.5 w-4 h-4 rounded text-[#06B6D4] focus:ring-[#06B6D4] border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      ⭐ Популярный товар
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Отображать этот товар в блоке «Популярные товары» на главной странице
                    </p>
                  </div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
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
                    <span>
                      {editingProduct ? "Сохранить изменения" : "Создать товар"}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isPending}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-70"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
