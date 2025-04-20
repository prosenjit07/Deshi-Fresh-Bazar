import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="https://ext.same-assets.com/377203966/1844563651.png"
                alt="Premium Fruits"
                width={150}
                height={40}
                className="h-auto w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium Fruits (PF) is an Agritech Fruit chain initiative by BD. We supply premium quality fruits from our contracted and registered fruit farmers.
            </p>
            <div className="mt-4 flex space-x-4">
              <Link
                href="https://facebook.com"
                className="text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                className="text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://youtube.com"
                className="text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-medium">Contact Us</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Head Office:</span> House #3/E, Section Road (New), Dhaka North City, Dhanmondi, Bangladesh
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Dhaka Warehouse:</span> Midinburgh City, Gazipur, Dhaka-1712, Bangladesh
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Phone:</span> +88 17000000000, +88 19000000000
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Email:</span> info@premiumfruitbd.com
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-medium">Useful Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                FAQs
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/return-policy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Return Policy
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-base font-medium">Payment Methods</h3>
            <div className="flex flex-wrap gap-2">
              {/* Payment method icons */}
              <div className="rounded-md bg-white p-1 shadow-sm">
                <Image
                  src="https://ext.same-assets.com/377203966/3964408185.gif"
                  alt="Payment Methods"
                  width={250}
                  height={80}
                  className="h-auto w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Premium Fruits. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
