"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminContextType {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Senha do admin - em produção, isso deve vir de variáveis de ambiente
const ADMIN_PASSWORD = "gourp2024";

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar se já está logado ao carregar
    useEffect(() => {
        const adminSession = localStorage.getItem("gourp-admin-session");
        if (adminSession) {
            // Verifica se a sessão ainda é válida (24 horas)
            const sessionData = JSON.parse(adminSession);
            const now = Date.now();
            if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem("gourp-admin-session");
            }
        }
    }, []);

    const login = (password: string): boolean => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem(
                "gourp-admin-session",
                JSON.stringify({ timestamp: Date.now() })
            );
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("gourp-admin-session");
    };

    return (
        <AdminContext.Provider value={{ isAuthenticated, login, logout }}>
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
