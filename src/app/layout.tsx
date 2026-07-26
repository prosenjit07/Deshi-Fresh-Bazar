import "@/app/globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import MetaPixelPageView from "@/components/MetaPixelPageView";
import { CartProvider } from '@/contexts/CartContext';
import favicon from "@/assets/favicon/favicon.ico";
import { UserProvider } from "@/contexts/UserContext";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: {
    default: "Deshi Fresh Bazar | Chemical-Free Fresh Fruits",
    template: "%s | Deshi Fresh Bazar",
  },
  description: "Deshi Fresh Bazar (PF) is an Agritech Fruit chain initiative delivering safer, chemical-free fruits directly from registered gardens to your doorstep in Bangladesh.",
  keywords: ["fresh fruits", "chemical free fruits", "mango delivery bangladesh", "organic fruits bd", "deshi fresh bazar", "online fruit shop"],
  authors: [{ name: "Deshi Fresh Bazar" }],
  metadataBase: new URL("https://deshifreshbazar.com"),
  openGraph: {
    title: "Deshi Fresh Bazar | Chemical-Free Fresh Fruits",
    description: "Delivering safer, chemical-free fruits directly from registered gardens to your doorstep in Bangladesh.",
    url: "https://deshifreshbazar.com",
    siteName: "Deshi Fresh Bazar",
    images: [
      {
        url: "/images/banner.jpg", // Update with an actual banner if available
        width: 1200,
        height: 630,
        alt: "Deshi Fresh Bazar Banner",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  icons: {
    icon: favicon.src,
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metaPixelId = "1466676988255416";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <MetaPixelPageView />
        <Providers>
          <UserProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
