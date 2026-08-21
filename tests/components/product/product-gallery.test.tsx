import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { ProductGallery } from "@/components/product/product-gallery";
import { Product } from "@/types/product";

const mockProductWithMultipleImages: Product = {
  id: "prod-1",
  slug: "test-product",
  name: "Test Phone",
  description: "Test description",
  shortDescription: "Short desc",
  price: 30000,
  image: "/images/main.jpg",
  images: ["/images/main.jpg", "/images/side.jpg", "/images/back.jpg"],
  categoryId: "cat-1",
  categorySlug: "phones",
  categoryName: "Смартфоны",
  brand: "TechBrand",
  stock: 5,
  characteristics: {},
  createdAt: new Date().toISOString(),
};

const mockProductWithSingleImage: Product = {
  ...mockProductWithMultipleImages,
  images: [], // Будет использовать fallback на product.image
};

describe("ProductGallery Component", () => {
  it("should render main image by default and status badge", () => {
    render(<ProductGallery product={mockProductWithMultipleImages} />);

    const mainImage = screen.getByAltText("Test Phone — фото 1") as HTMLImageElement;
    expect(mainImage).toBeInTheDocument();
    expect(mainImage.src).toContain("/images/main.jpg");
    
    // Должен отображаться статус "В наличии"
    expect(screen.getByText("В наличии")).toBeInTheDocument();
  });

  it("should show 'Нет в наличии' if stock is 0", () => {
    render(<ProductGallery product={{ ...mockProductWithMultipleImages, stock: 0 }} />);
    expect(screen.getByText("Нет в наличии")).toBeInTheDocument();
  });

  it("should show low stock warning badge if stock is <= 3", () => {
    render(<ProductGallery product={{ ...mockProductWithMultipleImages, stock: 2 }} />);
    expect(screen.getByText("Осталось 2 шт.")).toBeInTheDocument();
  });

  it("should render thumbnail buttons if multiple images exist", () => {
    render(<ProductGallery product={mockProductWithMultipleImages} />);

    const thumbnails = screen.getAllByRole("button", { name: /Выбрать фото/ });
    expect(thumbnails).toHaveLength(3);
  });

  it("should not render thumbnail buttons if only one image exists", () => {
    render(<ProductGallery product={mockProductWithSingleImage} />);

    const thumbnails = screen.queryAllByRole("button", { name: /Выбрать фото/ });
    expect(thumbnails).toHaveLength(0);
  });

  it("should switch main image when thumbnail is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductGallery product={mockProductWithMultipleImages} />);

    // Кликаем по второй миниатюре
    const secondThumb = screen.getByRole("button", { name: "Выбрать фото 2" });
    await user.click(secondThumb);

    // Главная картинка должна обновиться
    const updatedImage = screen.getByAltText("Test Phone — фото 2") as HTMLImageElement;
    expect(updatedImage).toBeInTheDocument();
    expect(updatedImage.src).toContain("/images/side.jpg");
  });

  it("should cycle images using next and prev buttons", async () => {
    const user = userEvent.setup();
    render(<ProductGallery product={mockProductWithMultipleImages} />);

    const nextButton = screen.getByRole("button", { name: "Следующее изображение" });
    const prevButton = screen.getByRole("button", { name: "Предыдущее изображение" });

    // Кликаем "Следующее"
    await user.click(nextButton);
    expect(screen.getByAltText("Test Phone — фото 2")).toBeInTheDocument();

    // Кликаем "Следующее" еще раз
    await user.click(nextButton);
    expect(screen.getByAltText("Test Phone — фото 3")).toBeInTheDocument();

    // Кликаем "Предыдущее"
    await user.click(prevButton);
    expect(screen.getByAltText("Test Phone — фото 2")).toBeInTheDocument();
  });
});
