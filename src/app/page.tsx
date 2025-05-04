// For static site generation
export const dynamic = 'force-static';

import Image from "next/image";
import Link from "next/link";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const featuredProducts = [
    {
      id: 1,
      name: "Katimon (2 KG Crate)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 1199,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
    },
    {
      id: 2,
      name: "Katimon (5 KG Crate)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 2299,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
    },
    {
      id: 3,
      name: "Katimon (10 KG Crate)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 4499,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
    },
    {
      id: 4,
      name: "Katimon (20 KG Crate)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 9000,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
    },
  ];

  const features = [
    {
      id: "01",
      title: "Registered Safe Garden",
      description: "We collect fruits from our registered & harmful chemical free fruit gardens.",
      image: "https://ext.same-assets.com/377203966/1134941912.webp",
    },
    {
      id: "02",
      title: "Premium Quality Product",
      description: "We only select and sort premium standards fruits for your best experience.",
      image: "https://ext.same-assets.com/377203966/1681878220.webp",
    },
    {
      id: "03",
      title: "Premium Packaging",
      description: "Maybe you want to gift yourself, your family, your friends. We packaged the best package!",
      image: "https://ext.same-assets.com/377203966/220553349.webp",
    },
    {
      id: "04",
      title: "Garden Fresh Delivery",
      description: "We take pre-orders from customers and deliver quicker direct from garden to table.",
      image: "https://ext.same-assets.com/377203966/2606514306.webp",
    },
  ];

  return (
    <RootLayout>
      {/* Hero section */}
      <section
        className="relative bg-cover bg-center py-24"
        style={{
          backgroundImage: "url(/assets/images/fresh-bazar.jpg)",
          backgroundSize: "cover"
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 flex flex-col items-center text-center text-white">
          <h1 className="mb-4 text-5xl font-bold">Deshi Fresh Bazar.</h1>
          <p className="mb-8 max-w-2xl text-lg">
            A fruit-only agri initiative delivering safer fruits directly from gardens.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild className="bg-green-700 hover:bg-green-800">
              <Link href="/gardens">Our Contracted Gardens</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-green-800">
              <Link href="/fruits">Try our fruits</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="bg-white py-12">
        <div className="container">
          <div className="flex justify-around mb-8">
            <Link
              href="/fruits"
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="rounded-full bg-gray-100 p-4">
                <Image
                  src="https://ext.same-assets.com/377203966/610671350.webp"
                  alt="All Fruits"
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>
              <span className="font-medium">All Fruits</span>
            </Link>
            <Link
              href="/fruits/katimon"
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="rounded-full bg-gray-100 p-4">
                <Image
                  src="https://ext.same-assets.com/377203966/610671350.webp"
                  alt="Katimon"
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>
              <span className="font-medium">Katimon</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products section */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold uppercase">
            All Fruits
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-green-500"></div>
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="font-medium text-green-700">৳ {product.price}</p>
                    <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
                      <Link href={`/product/${product.id}`}>
                        Add to cart
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white">
              <Link href="/fruits">View all products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why we are different section */}
      <section className="bg-white py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold uppercase">
            Why We Are Different
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-green-500"></div>
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.id} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-md overflow-hidden h-48 w-60">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={240}
                      height={180}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="mb-2 text-lg font-medium">{feature.id}</div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video section */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold uppercase">
            Stories to Watch
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-green-500"></div>
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg bg-black">
              <div className="aspect-video">
                <Image
                  src="https://ext.same-assets.com/377203966/220553349.webp"
                  alt="Live Fruit Collection"
                  width={800}
                  height={450}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/30 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">Live Fruit Collection From Registered Garden</h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-black">
              <div className="aspect-video">
                <Image
                  src="https://ext.same-assets.com/377203966/220553349.webp"
                  alt="Premium Packaging Process"
                  width={800}
                  height={450}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/30 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">Our Premium Packaging Process</h3>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">Please click the link to place your order.</p>
            <Button asChild className="bg-green-700 hover:bg-green-800">
              <Link href="/fruits">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </RootLayout>
  );
}
