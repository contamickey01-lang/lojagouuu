"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, Settings, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { useAdmin } from "@/components/admin/admin-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserMenu } from "@/components/auth/user-menu";
import { useProducts } from "@/components/admin/products-provider";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

// Emails autorizados como admin
const ADMIN_EMAILS = ["admin@goupay.me", "gou@goupay.me"];

export function Header() {
    const { totalItems } = useCart();
    const { isAuthenticated: isAdminAuthenticated } = useAdmin();
    const { user, isLoading } = useAuth();
    const { searchQuery, setSearchQuery } = useProducts();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

    const navLinks = [
        { href: "/", label: "Início" },
        { href: "/loja", label: "Loja" },
    ];

    return (
        <>
            <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-2xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative">
                            <span className="text-2xl font-bold text-gradient">GouPay</span>
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
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative flex items-center">
                            {isSearchOpen ? (
                                <div className="absolute right-0 flex items-center animate-in slide-in-from-right-2 duration-200">
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (pathname !== "/loja" && e.target.value.length > 0) {
                                                router.push("/loja");
                                            }
                                        }}
                                        onBlur={() => {
                                            if (searchQuery === "") setIsSearchOpen(false);
                                        }}
                                        className="w-40 sm:w-64 px-4 py-2 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                    />
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setIsSearchOpen(false);
                                        }}
                                        className="absolute right-3 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors"
                                    aria-label="Buscar"
                                >
                                    <Search className="w-5 h-5 text-muted-foreground" />
                                </button>
                            )}
                        </div>

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

                        {/* Admin Button - só mostra para admins */}
                        {(isAdmin || isAdminAuthenticated) && (
                            <Link
                                href="/admin"
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                                    isAdminAuthenticated
                                        ? "bg-primary/20 hover:bg-primary/30 text-primary"
                                        : "hover:bg-secondary text-muted-foreground"
                                )}
                                aria-label="Painel Admin"
                                title="Painel Admin"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>
                        )}

                        {/* User Auth */}
                        {isLoading ? (
                            <div className="w-10 h-10 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : user ? (
                            <UserMenu />
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Entrar</span>
                            </button>
                        )}

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
                        isMenuOpen ? "max-h-[400px]" : "max-h-0"
                    )}
                >
                    <nav className="flex flex-col p-4 gap-4">
                        {/* Mobile Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (pathname !== "/loja" && e.target.value.length > 0) {
                                        router.push("/loja");
                                    }
                                }}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
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
                        </div>
                    </nav>
                </div>
            </header>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
}
