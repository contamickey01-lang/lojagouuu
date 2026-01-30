"use client";

import { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signIn, signUp, signInWithGoogle, signInWithDiscord, isUsingSupabase } = useAuth();

    if (!isOpen) return null;

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setError("");
        setSuccess("");
    };

    const handleTabChange = (tab: "login" | "register") => {
        setActiveTab(tab);
        resetForm();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const result = await signIn(email, password);

        if (result.success) {
            onClose();
            resetForm();
        } else {
            setError(result.error || "Erro ao fazer login");
        }

        setIsSubmitting(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        setIsSubmitting(true);

        const result = await signUp(email, password, name);

        if (result.success) {
            setSuccess("Conta criada! Verifique seu email para confirmar.");
            setActiveTab("login");
        } else {
            setError(result.error || "Erro ao criar conta");
        }

        setIsSubmitting(false);
    };

    const handleGoogleLogin = async () => {
        setError("");
        const result = await signInWithGoogle();
        if (!result.success) {
            setError(result.error || "Erro ao conectar com Google");
        }
    };

    const handleDiscordLogin = async () => {
        setError("");
        const result = await signInWithDiscord();
        if (!result.success) {
            setError(result.error || "Erro ao conectar com Discord");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        {activeTab === "login" ? "Entrar" : "Criar Conta"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {activeTab === "login"
                            ? "Entre para continuar suas compras"
                            : "Crie sua conta para começar"
                        }
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-xl">
                    <button
                        onClick={() => handleTabChange("login")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "login"
                                ? "bg-primary text-white"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => handleTabChange("register")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "register"
                                ? "bg-primary text-white"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Criar Conta
                    </button>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                        {success}
                    </div>
                )}

                {/* Social Login Buttons */}
                {isUsingSupabase && (
                    <>
                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={handleGoogleLogin}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button
                                onClick={handleDiscordLogin}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                                Discord
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-card text-muted-foreground">ou continue com email</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Form */}
                <form onSubmit={activeTab === "login" ? handleLogin : handleRegister} className="space-y-4">
                    {activeTab === "register" && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Nome
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {activeTab === "register" && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {activeTab === "login" ? "Entrar" : "Criar Conta"}
                    </button>
                </form>

                {!isUsingSupabase && (
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Sistema em modo local. Configure o Supabase para habilitar login social.
                    </p>
                )}
            </div>
        </div>
    );
}
