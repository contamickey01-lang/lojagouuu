"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isUsingSupabase: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
    signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    signInWithDiscord: () => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUsingSupabase, setIsUsingSupabase] = useState(false);

    useEffect(() => {
        const supabase = getSupabase();

        if (!supabase) {
            setIsLoading(false);
            return;
        }

        setIsUsingSupabase(true);

        // Verificar sessão existente
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Supabase não configurado" };
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    };

    const signUp = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Supabase não configurado" };
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    };

    const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Supabase não configurado" };
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    };

    const signInWithDiscord = async (): Promise<{ success: boolean; error?: string }> => {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Supabase não configurado" };
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    };

    const signOut = async () => {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                isUsingSupabase,
                signIn,
                signUp,
                signInWithGoogle,
                signInWithDiscord,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
