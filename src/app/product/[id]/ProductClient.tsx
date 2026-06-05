"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from '@/contexts/CartContext';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  buildProductPixelPayload,
  trackMetaPixelCustomEvent,
  trackMetaPixelEvent,
} from "@/lib/meta-pixel";

interface Package {
  id: string;
  name: string;
  price: number;
  productId: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  details: string | null;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  packages: Package[];
}

interface ProductClientProps {
  product: Product | undefined;
  products: Product[];
}

function parseImageList(image: string | null | undefined) {
  if (!image) return [];
  return image
    .split(/[\n,|]+/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatTaka(value: number) {
  return `৳${value.toLocaleString("en-US")}`;
}

function ZoomableImage({
  src,
  alt,
  priority,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState({ x: 50, y: 50 });
  const [hoverCapable, setHoverCapable] = useState(true);

  useEffect(() => {
    setHoverCapable(window.matchMedia("(hover: hover)").matches);
  }, []);

  const zoomScale = 1.85;

  const updateOriginFromPointerEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;
    setTransformOrigin({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    updateOriginFromPointerEvent(e);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (hoverCapable && e.pointerType === "mouse") {
      setIsZoomed(true);
      updateOriginFromPointerEvent(e);
    }
  };

  const handlePointerLeave = () => {
    if (hoverCapable) setIsZoomed(false);
  };

  const handleClick = () => {
    if (hoverCapable) return;
    setIsZoomed((v) => !v);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white ${className}`}>
      <div
        className={`h-full ${hoverCapable ? "cursor-zoom-in" : "cursor-zoom-in active:cursor-zoom-out"}`}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <div className="relative h-full w-full bg-white min-h-[400px]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority={priority}
            style={{
              transformOrigin: `${transformOrigin.x}% ${transformOrigin.y}%`,
              transform: isZoomed ? `scale(${zoomScale})` : "scale(1)",
              transition: "transform 180ms ease",
            }}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
        {hoverCapable ? "Hover to zoom" : isZoomed ? "Tap to reset" : "Tap to zoom"}
      </div>
    </div>
  );
}

export default function ProductClient({ product, products }: ProductClientProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, items: cartItems } = useCart();
  const router = useRouter();
  const lastTrackedProductId = useRef<string | null>(null);

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(
    () => product?.packages[0] ?? null
  );

  const images = useMemo(() => parseImageList(product?.image), [product?.image]);
  const activeImageSrc = images[0] ?? product?.image ?? "";
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!product) return;
    setSelectedPackage(product.packages[0] ?? null);
    setQuantity(1);
    setSelectedImageIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product || lastTrackedProductId.current === product.id) {
      return;
    }

    lastTrackedProductId.current = product.id;

    const pixelPayload = buildProductPixelPayload({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category.name,
    });

    trackMetaPixelEvent("ViewContent", pixelPayload);
    trackMetaPixelCustomEvent("ProductView", pixelPayload);
  }, [product]);

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-4">The product you are looking for does not exist.</p>
        <Button asChild className="mt-6 bg-green-700 hover:bg-green-800">
          <Link href="/fruits">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const hasPackages = product.packages.length > 0;
  const displayedPrice = selectedPackage?.price ?? product.price;
  const selectedImageSrc =
    images[selectedImageIndex] ?? (images[0] ?? activeImageSrc);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    const pixelPayload = buildProductPixelPayload({
      id: product.id,
      name: product.name,
      price: selectedPackage?.price ?? product.price,
      quantity,
      category: product.category.name,
    });

    // @ts-expect-error - handling type mismatch with the CartContext
    addItem(product, quantity, selectedPackage?.id);
    trackMetaPixelEvent("AddToCart", pixelPayload);
    toast.success("Added to cart successfully");
  };

  const handleBuyNow = () => {
    const pixelPayload = buildProductPixelPayload({
      id: product.id,
      name: product.name,
      price: selectedPackage?.price ?? product.price,
      quantity,
      category: product.category.name,
    });
    const existingCartItem = cartItems.find(item => 
      item.id === product.id && item.selectedPackage === selectedPackage?.id
    );

    if (!existingCartItem) {
      // @ts-expect-error - handling type mismatch with the CartContext
      addItem(product, quantity, selectedPackage?.id);
      trackMetaPixelEvent("AddToCart", pixelPayload);
      toast.success("Added to cart successfully");
    }

    trackMetaPixelEvent("InitiateCheckout", pixelPayload);
    trackMetaPixelCustomEvent("BuyNow", pixelPayload);
    router.push("/cart");
  };

  return (
    <div className="bg-gray-50">
      <div className="container py-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/fruits" className="hover:text-foreground">
            Fruits
          </Link>
          <span>/</span>
          <Link href={`/fruits/${product.category.slug}`} className="hover:text-foreground">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-7">
            <div className={`grid grid-cols-1 gap-4 h-full ${images.length > 1 ? 'lg:grid-cols-[96px_1fr]' : ''}`}>
              {images.length > 1 ? (
                <div className="order-2 flex gap-2 overflow-auto lg:order-1 lg:flex-col lg:overflow-visible">
                  {images.map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 w-20 flex-none overflow-hidden rounded-xl border bg-white transition ${
                        selectedImageIndex === index
                          ? "border-green-700 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-green-700"
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <Image src={img} alt={product.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="order-1 lg:order-2 h-full">
                <ZoomableImage src={selectedImageSrc} alt={product.name} priority className="h-full" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-full">
            <div className="lg:sticky lg:top-24 h-full">
              <div className="rounded-2xl border bg-white p-6 shadow-sm h-full flex flex-col">
                <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="text-3xl font-extrabold text-green-700">
                    {formatTaka(displayedPrice)}
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      product.stock > 0
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {product.stock > 0 ? "In stock" : "Out of stock"}
                  </div>
                </div>

                {hasPackages ? (
                  <div className="mt-6">
                    <div className="text-sm font-semibold">Select package</div>
                    <div className="mt-3 space-y-2">
                      {product.packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackage(pkg)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                            selectedPackage?.id === pkg.id
                              ? "border-green-700 bg-green-50"
                              : "border-gray-200 hover:border-green-700 hover:bg-green-50"
                          }`}
                        >
                          <div className="font-medium">{pkg.name}</div>
                          <div className="font-semibold text-green-700">
                            {formatTaka(pkg.price)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto pt-6">
                  <div className="text-sm font-semibold">Quantity</div>
                  <div className="mt-3 inline-flex items-center rounded-xl border bg-white">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 rounded-l-xl"
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <div className="flex h-10 w-14 items-center justify-center border-x text-sm font-semibold">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 rounded-r-xl"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                      className="h-11 bg-green-700 hover:bg-green-800"
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
                      onClick={handleBuyNow}
                      disabled={product.stock <= 0}
                    >
                      Buy Now
                    </Button>
                  </div>

                  {product.stock <= 0 ? (
                    <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      This product is currently out of stock
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* description & details section */}
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {product.details ? (
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold">Details</h2>
              <div
                className="mt-3 rich-text-content"
                dangerouslySetInnerHTML={{ __html: product.details }}
              />
            </div>
          ) : null}
        </div>

        {/* end right section */}

        {products.length > 0 ? (
          <div className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <Link href="/fruits" className="text-sm font-semibold text-green-700 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((relProduct: Product) => {
                const relImages = parseImageList(relProduct.image);
                const relImageSrc = relImages[0] ?? relProduct.image;
                return (
                  <Card
                    key={relProduct.id}
                    className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                  >
                    <Link href={`/product/${relProduct.id}`} className="block">
                      <div className="relative aspect-square bg-gray-50">
                        <Image
                          src={relImageSrc}
                          alt={relProduct.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link href={`/product/${relProduct.id}`} className="hover:underline">
                        <h3 className="min-h-[44px] font-semibold leading-snug">
                          {relProduct.name}
                        </h3>
                      </Link>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="font-semibold text-green-700">
                          {formatTaka(relProduct.price)}
                        </p>
                        <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
                          <Link href={`/product/${relProduct.id}`}>View</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}






