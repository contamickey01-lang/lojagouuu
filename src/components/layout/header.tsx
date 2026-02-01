"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, Settings, User, MessageCircle, Moon } from "lucide-react";
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
            <div className="w-full bg-black/95 backdrop-blur-md border-b border-white/5 z-50">
                <header className="max-w-[1400px] mx-auto h-16 flex items-center justify-between px-4 lg:px-6">
                    {/* Left: Search & Social */}
                    <div className="flex items-center gap-2">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-muted-foreground hover:text-white"
                            onClick={() => {
                                if (pathname !== "/loja") router.push("/loja");
                            }}
                        >
                            <Search className="w-5 h-5" />
                        </div>

                        {/* Social/Community Link */}
                        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-muted-foreground hover:text-white">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Center: Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-bold transition-all hover:text-primary tracking-wide uppercase",
                                    pathname === link.href ? "text-white" : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Cart */}
                        <Link
                            href="/carrinho"
                            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5 text-muted-foreground hover:text-white transition-colors" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg shadow-primary/20">
                                    {totalItems > 99 ? "99+" : totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Auth / Profile */}
                        <div className="flex items-center gap-4 ml-2 pl-4 border-l border-white/10">
                            {isLoading ? (
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : user ? (
                                <UserMenu />
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-sm font-medium transition-all shadow-inner"
                                >
                                    Fazer login
                                </button>
                            )}
                        </div>


                        {/* Mobile Menu */}
                        <button
                            className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </header>

                {/* Mobile Menu Content */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-white/5 p-4 bg-black/95 animate-in slide-in-from-top duration-300">
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="py-3 px-4 rounded-xl hover:bg-white/5 text-sm transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
}
