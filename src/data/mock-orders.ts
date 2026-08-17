import { Order } from "@/types/order";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export const mockUserProfile: UserProfile = {
  name: "Алексей Смирнов",
  email: "alex.smirnov@example.com",
  phone: "+7 (999) 123-45-67",
};

export const mockOrders: Order[] = [
  {
    id: "ord-101",
    orderNumber: "TG-84920",
    createdAt: "2026-08-16T14:30:00Z",
    status: "NEW",
    customerName: "Алексей Смирнов",
    email: "alex.smirnov@example.com",
    phone: "+7 (999) 123-45-67",
    deliveryMethod: "courier",
    city: "Москва",
    address: "ул. Тверская, д. 15, кв. 42",
    comment: "Пожалуйста, позвоните за час до приезда.",
    items: [
      {
        id: "item-1",
        productId: "1",
        name: "Механическая клавиатура Dark Project KD87A",
        price: 8990,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "item-2",
        productId: "3",
        name: "Беспроводная гарнитура HyperX Cloud III Wireless",
        price: 14990,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
      },
    ],
    totalPrice: 23980,
    deliveryCost: 0,
    finalTotal: 23980,
  },
  {
    id: "ord-102",
    orderNumber: "TG-73210",
    createdAt: "2026-08-10T11:15:00Z",
    status: "CONFIRMED",
    customerName: "Алексей Смирнов",
    email: "alex.smirnov@example.com",
    phone: "+7 (999) 123-45-67",
    deliveryMethod: "pickup",
    city: "Москва",
    address: "Флагманский пункт выдачи (ул. Тверская, д. 12)",
    comment: "Заберу в субботу днем.",
    items: [
      {
        id: "item-3",
        productId: "2",
        name: "Игровая мышь Logitech G Pro X Superlight 2",
        price: 15490,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
      },
    ],
    totalPrice: 15490,
    deliveryCost: 0,
    finalTotal: 15490,
  },
  {
    id: "ord-103",
    orderNumber: "TG-59104",
    createdAt: "2026-07-22T09:40:00Z",
    status: "COMPLETED",
    customerName: "Алексей Смирнов",
    email: "alex.smirnov@example.com",
    phone: "+7 (999) 123-45-67",
    deliveryMethod: "courier",
    city: "Москва",
    address: "ул. Ленина, д. 8, кв. 10",
    items: [
      {
        id: "item-4",
        productId: "4",
        name: "Игровой монитор ASUS ROG Swift PG279QM",
        price: 64990,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "item-5",
        productId: "6",
        name: "Коврик для мыши SteelSeries QcK Heavy XXL",
        price: 3490,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80",
      },
    ],
    totalPrice: 71970,
    deliveryCost: 0,
    finalTotal: 71970,
  },
  {
    id: "ord-104",
    orderNumber: "TG-42008",
    createdAt: "2026-06-15T18:00:00Z",
    status: "CANCELLED",
    customerName: "Алексей Смирнов",
    email: "alex.smirnov@example.com",
    phone: "+7 (999) 123-45-67",
    deliveryMethod: "courier",
    city: "Москва",
    address: "ул. Тверская, д. 15, кв. 42",
    comment: "Отменен покупателем",
    items: [
      {
        id: "item-6",
        productId: "5",
        name: "SSD накопитель Samsung 990 PRO 2TB",
        price: 18990,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
      },
    ],
    totalPrice: 18990,
    deliveryCost: 0,
    finalTotal: 18990,
  },
];
