import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
    title: "GouRp - Sua Loja de Keys Steam",
    description: "Licenças autênticas, preços imbatíveis e qualidade extraordinária. Compre suas keys Steam com segurança.",
    keywords: ["steam keys", "jogos", "games", "keys baratas", "steam"],
    openGraph: {
        title: "GouRp - Sua Loja de Keys Steam",
        description: "Licenças autênticas, preços imbatíveis e qualidade extraordinária",
        url: "https://gourp.vercel.app",
        siteName: "GouRp",
        locale: "pt_BR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "GouRp - Sua Loja de Keys Steam",
        description: "Licenças autênticas, preços imbatíveis e qualidade extraordinária",
    },
    icons: {
        icon: "/favicon.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="dark">
            <body className="min-h-screen bg-background text-foreground antialiased">
                <CartProvider>
                    <div className="flex min-h-screen flex-col">
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                </CartProvider>
            </body>
        </html>
    );
}
