"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAdmin } from "@/components/admin/admin-provider";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAdmin();
    const router = useRouter();

    // Se já está autenticado, redirecionar para o dashboard
    if (isAuthenticated) {
        router.push("/admin/dashboard");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simular delay de verificação
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (login(password)) {
            router.push("/admin/dashboard");
        } else {
            setError("Senha incorreta. Tente novamente.");
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
                        Digite a senha para acessar o painel de administração
                    </p>
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
                                placeholder="Digite a senha do admin"
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
                        {isLoading ? "Verificando..." : "Entrar"}
                    </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Acesso restrito. Entre em contato se esqueceu a senha.
                </p>
            </div>
        </div>
    );
}
