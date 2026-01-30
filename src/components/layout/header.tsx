"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, Settings, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { useAdmin } from "@/components/admin/admin-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

// Emails autorizados como admin
const ADMIN_EMAILS = ["admin@gourp.com", "gou@gourp.com"];

export function Header() {
    const { totalItems } = useCart();
    const { isAuthenticated: isAdminAuthenticated } = useAdmin();
    const { user, isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

    const navLinks = [
        { href: "/", label: "Início" },
        { href: "/loja", label: "Loja" },
        { href: "/categorias/steam-offline", label: "Steam Offline" },
        { href: "/categorias/steam-keys", label: "Steam Keys" },
    ];

    return (
        <>
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
                    <div className="flex items-center gap-2">
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

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
}
