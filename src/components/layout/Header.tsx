import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Fruits", path: "/fruits" },
    { title: "Corporate Gift", path: "/corporate-gift" },
    { title: "FAQ", path: "/faq" },
    { title: "About", path: "/about" },
    { title: "Contact", path: "/contact" },
    { title: "Gallery", path: "/gallery" },
    { title: "Track Order", path: "/track-order" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/images/fresh-bazar.jpg"
              alt="Deshi Fresh Bazar"
              width={150}
              height={40}
              className="h-auto"
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
        <div className="flex items-center gap-4">
          <Link href="/cart" className="hidden sm:flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm font-medium">Cart</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/login">Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/register">Register</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Cart</span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
