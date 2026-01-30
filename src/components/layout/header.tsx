"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

export function Header() {
    const { totalItems } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Início" },
        { href: "/loja", label: "Loja" },
        { href: "/categorias/steam-offline", label: "Steam Offline" },
        { href: "/categorias/steam-keys", label: "Steam Keys" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative">
                        <span className="text-2xl font-bold text-gradient">GouRp</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <button
                        className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors"
                        aria-label="Buscar"
                    >
                        <Search className="w-5 h-5 text-muted-foreground" />
                    </button>

                    {/* Cart */}
                    <Link
                        href="/carrinho"
                        className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors"
                        aria-label="Carrinho"
                    >
                        <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                {totalItems > 99 ? "99+" : totalItems}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-5 h-5 text-muted-foreground" />
                        ) : (
                            <Menu className="w-5 h-5 text-muted-foreground" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div
                className={cn(
                    "md:hidden overflow-hidden transition-all duration-300 border-t border-border/40",
                    isMenuOpen ? "max-h-64" : "max-h-0"
                )}
            >
                <nav className="flex flex-col p-4 gap-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="py-2 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
