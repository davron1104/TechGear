import type { Metadata } from "next";
import { getPrivatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  robots: getPrivatePageRobots(),
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
