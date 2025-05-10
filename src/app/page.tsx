// For static site generation
export const dynamic = 'force-static';

import Image from "next/image";
import Link from "next/link";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import banner from "@/assets/images/banner.jpg";

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
        className="relative min-h-[30vh] flex items-center justify-center bg-cover bg-center bg-fixed overflow-hidden"
        style={{
          backgroundImage: `url(${banner.src})`,
          backgroundSize: "cover"
        }}
      >
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 backdrop-blur-[2px]" />
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight animate-fade-in relative">
                <span className="inline-block transform hover:scale-105 transition-transform duration-300">Deshi</span>{" "}
                <span className="inline-block transform hover:scale-105 transition-transform duration-300 text-green-400">Fresh</span>{" "}
                <span className="inline-block transform hover:scale-105 transition-transform duration-300">Bazar</span>
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-green-400"></span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-2xl animate-fade-in-up font-medium tracking-wide">
                সরাসরি বাগান থেকে নিরাপদ ও তাজা ফল – এখন আপনার দুয়ারে!
              </p>
            </div>
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl animate-fade-in-up leading-relaxed backdrop-blur-sm bg-black/10 p-6 rounded-lg shadow-xl border border-white/10">
              দেশি ফ্রেশ বাজার একটি ফলমাত্র কৃষি উদ্যোগ, যেখানে আমরা দেশজ বাগান থেকে সংগ্রহ করা স্বাস্থ্যকর, বিষমুক্ত ও টাটকা ফল সরাসরি আপনার হাতে পৌঁছে দিই। কোনো প্রকার মধ্যস্থতা ছাড়াই, কৃষকের শ্রম আর প্রকৃতির উপহার আপনার ঘরে।
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8 animate-fade-in-up">
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/20"
              >
                <Link href="/gardens">Our Contracted Gardens</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-white text-gray hover:bg-white hover:text-green-700 px-8 py-3 rounded-full transform transition-all duration-300 hover:scale-105"
              >
                <Link href="/fruits">Try our fruits</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 to-transparent" />
      </section>

      {/* Categories section
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
      </section> */}

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
            Our Stories
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-green-500"></div>
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group overflow-hidden rounded-lg bg-black/5 shadow-lg transition-all hover:shadow-xl">
              <div className="aspect-video relative overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/L6bSkrqZsi4?autoplay=0"
                  title="Live Fruit Collection From Registered Garden"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                নিবন্ধিত বাগান থেকে সরাসরি ফল সংগ্রহ
                </h3>
                <p className="text-sm text-gray-600">আমাদের নিবন্ধিত বাগান থেকে আমরা কীভাবে সাবধানে তাজা ফল সংগ্রহ করি, আমাদের গ্রাহকদের জন্যর সর্বোচ্চ মানের ফল নিশ্চিত করি তা দেখুন।</p>
              </div>
            </div>

            <div className="group overflow-hidden rounded-lg bg-black/5 shadow-lg transition-all hover:shadow-xl">
              <div className="aspect-video relative overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/VQyuPf1QiVM?autoplay=0"
                  title="Our Premium Packaging Process"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                আমাদের প্রিমিয়াম প্যাকেজিং প্রক্রিয়া
                </h3>
                <p className="text-sm text-gray-600">আমাদের সূক্ষ্ম প্যাকেজিং প্রক্রিয়া আবিষ্কার করুন যা নিশ্চিত করে যে আপনার ফলগুলি তাজা এবং নিখুঁত অবস্থায় পৌঁছায়।</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="mb-6 text-sm text-gray-600">Please click the link to place your order.</p>
            <Button asChild className="bg-green-700 hover:bg-green-800 transform transition-transform hover:scale-105">
              <Link href="/fruits">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </RootLayout>
  );
}
