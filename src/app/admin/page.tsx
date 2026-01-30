"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, Mail, Database } from "lucide-react";
import { useAdmin } from "@/components/admin/admin-provider";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, isLoading: authLoading } = useAdmin();
    const router = useRouter();

    const isUsingSupabase = !!supabase;

    // Se já está autenticado, redirecionar para o dashboard
    if (isAuthenticated && !authLoading) {
        router.push("/admin/dashboard");
        return null;
    }

    // Mostrar loading enquanto verifica sessão
    if (authLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(email || "admin", password);

        if (result.success) {
            router.push("/admin/dashboard");
        } else {
            setError(result.error || "Erro ao fazer login.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
                    <p className="text-muted-foreground mt-2">
                        {isUsingSupabase
                            ? "Faça login com sua conta de administrador"
                            : "Digite a senha para acessar o painel"
                        }
                    </p>
                    <div className={`inline-flex items-center gap-1.5 mt-3 px-2 py-1 rounded-md text-xs font-medium ${isUsingSupabase
                            ? "bg-success/10 text-success"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                        <Database className="w-3 h-3" />
                        {isUsingSupabase ? "Autenticação Supabase" : "Modo local"}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 rounded-2xl border border-border bg-card space-y-4"
                >
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Email - só mostra se usar Supabase */}
                    {isUsingSupabase && (
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@gourp.com"
                                    className="w-full px-4 py-3 pl-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-foreground"
                        >
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={isUsingSupabase ? "Sua senha" : "Senha do admin"}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Acesso restrito a administradores autorizados.
                </p>
            </div>
        </div>
    );
}
