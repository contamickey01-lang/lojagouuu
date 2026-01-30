"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AdminContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Email do admin autorizado (você pode adicionar mais)
const ADMIN_EMAILS = ["admin@gourp.com", "gou@gourp.com"];

// Senha fixa para fallback quando não usar Supabase
const FALLBACK_PASSWORD = "gourp2024";

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // Verificar sessão ao carregar
    useEffect(() => {
        const checkSession = async () => {
            // Se Supabase está configurado
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && ADMIN_EMAILS.includes(session.user.email || "")) {
                    setUser(session.user);
                    setIsAuthenticated(true);
                }

                // Escutar mudanças de auth
                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    if (session?.user && ADMIN_EMAILS.includes(session.user.email || "")) {
                        setUser(session.user);
                        setIsAuthenticated(true);
                    } else {
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                });

                setIsLoading(false);
                return () => subscription.unsubscribe();
            } else {
                // Fallback: verificar localStorage
                const adminSession = localStorage.getItem("gourp-admin-session");
                if (adminSession) {
                    const sessionData = JSON.parse(adminSession);
                    const now = Date.now();
                    if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem("gourp-admin-session");
                    }
                }
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        // Se Supabase está configurado
        if (supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (!ADMIN_EMAILS.includes(data.user?.email || "")) {
                await supabase.auth.signOut();
                return { success: false, error: "Este email não tem permissão de admin." };
            }

            setUser(data.user);
            setIsAuthenticated(true);
            return { success: true };
        } else {
            // Fallback: senha fixa
            if (password === FALLBACK_PASSWORD) {
                setIsAuthenticated(true);
                localStorage.setItem(
                    "gourp-admin-session",
                    JSON.stringify({ timestamp: Date.now() })
                );
                return { success: true };
            }
            return { success: false, error: "Senha incorreta." };
        }
    };

    const logout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("gourp-admin-session");
    };

    return (
        <AdminContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
