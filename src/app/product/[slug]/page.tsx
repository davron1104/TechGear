import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Страница товара: {slug} (Заглушка)</h1>
    </div>
  );
}
