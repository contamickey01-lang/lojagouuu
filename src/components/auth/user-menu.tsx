"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, Settings } from "lucide-react";
import { useAuth } from "./auth-provider";
import Link from "next/link";

// Emails autorizados como admin (mesma lógica do Header)
const ADMIN_EMAILS = ["admin@goupay.me", "gou@goupay.me"];

export function UserMenu() {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
    const avatarUrl = user.user_metadata?.avatar_url;
    const initials = displayName.substring(0, 2).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                        {initials}
                    </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                    {displayName}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <div className="p-2 space-y-1">
                        {user && ADMIN_EMAILS.includes(user.email || "") && (
                            <Link
                                href="/admin/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors font-medium"
                            >
                                <Settings className="w-4 h-4" />
                                Ir para o Painel
                            </Link>
                        )}

                        <button
                            onClick={() => {
                                signOut();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair da conta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
