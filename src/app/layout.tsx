import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { AdminProvider } from "@/components/admin/admin-provider";
import { ProductsProvider } from "@/components/admin/products-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
    title: "GouPay - Sua Loja de Keys Steam",
    description: "Licenças autênticas, preços imbatíveis e qualidade extraordinária. Compre suas keys Steam com segurança.",
    keywords: ["steam keys", "jogos", "games", "keys baratas", "steam"],
    openGraph: {
        title: "GouPay - Sua Loja de Keys Steam",
        description: "Licenças autênticas, preços imbatíveis e qualidade extraordinária",
        url: "https://www.goupay.me",
        siteName: "GouPay",
        locale: "pt_BR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "GouPay - Sua Loja de Keys Steam",
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
                <AuthProvider>
                    <AdminProvider>
                        <ProductsProvider>
                            <CartProvider>
                                <div className="flex min-h-screen flex-col">
                                    <Header />
                                    <main className="flex-1">{children}</main>
                                    <Footer />
                                </div>
                            </CartProvider>
                        </ProductsProvider>
                    </AdminProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
