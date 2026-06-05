"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { trackMetaPixelCustomEvent } from "@/lib/meta-pixel";
import logo from "@/assets/images/fresh-logo.jpg";
import AuthModal from "@/components/AuthModal";

export default function Header() {
  const router = useRouter();
  const { getCartCount } = useCart();
  const { user, logout } = useUser();
  const cartCount = getCartCount();
  const [isOpen, setIsOpen] = useState(false);

  const handleCartClick = () => {
    trackMetaPixelCustomEvent("CartClick", {
      cart_count: cartCount,
      source: "header",
    });
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Fruits", path: "/fruits" },
    // { title: "Corporate Gift", path: "/corporate-gift" },
    { title: "FAQ", path: "/faq" },
    { title: "About", path: "/about" },
    { title: "Contact", path: "/contact" },
    { title: "Gallery", path: "/gallery" },
    { title: "Track Order", path: "/track-order" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container relative flex h-20 items-center justify-between md:h-16">
        
        {/* Mobile Menu (Left) */}
        <div className="flex items-center md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-10 w-10" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col gap-0 w-[85vw] max-w-[320px]">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Image
                  src={logo}
                  alt="Deshi Fresh Bazar"
                  width={140}
                  height={28}
                  className="h-[55px] w-auto"
                />
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3.5 text-base font-semibold text-gray-700 rounded-xl transition-all hover:bg-green-50 hover:text-green-700 active:bg-green-100"
                    >
                      {link.title}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                <Link
                  href="/cart"
                  onClick={handleCartClick}
                  className="flex items-center justify-between w-full px-5 py-4 text-base font-semibold text-white bg-green-700 rounded-xl transition-all hover:bg-green-800 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-green-700 shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Deshi Fresh Bazar"
              width={80}
              height={15}
              className="h-[55px] w-auto transition-all duration-200 lg:h-[60px] xl:h-[65px] 2xl:h-[70px]"
              priority
              quality={100}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 flex -translate-x-1/2 items-center md:hidden"
        >
          <Image
            src={logo}
            alt="Deshi Fresh Bazar"
            width={120}
            height={24}
            className="h-[58px] w-auto transition-all duration-200"
            priority
            quality={100}
          />
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/cart" onClick={handleCartClick} className="hidden md:flex items-center gap-2 relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-3 -right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green-700 text-[10px] font-bold text-white md:-top-4 md:h-5 md:w-5 md:text-xs">
                {cartCount}
              </span>
            )}
            <span className="hidden text-sm font-medium sm:inline-block">Cart</span>
          </Link>
          <AuthModal user={user} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}

