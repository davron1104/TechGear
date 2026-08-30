export type OrderStatus = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: "courier" | "pickup";
  city: string;
  address?: string;
  comment?: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryCost: number;
  finalTotal: number;
  currency?: string;
  exchangeRate?: number;
}
