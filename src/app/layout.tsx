import "@/app/globals.css";
import type { Metadata } from "next";
import ClientBody from "./ClientBody";
import { CartProvider } from '@/contexts/CartContext';

export const metadata: Metadata = {
  title: "Deshi Fresh Bazar | Fresh Fruits Delivery from Gardens",
  description: "Deshi Fresh Bazar (PF) is an Agritech Fruit chain initiative delivering safer fruits directly from gardens to your doorstep.",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
