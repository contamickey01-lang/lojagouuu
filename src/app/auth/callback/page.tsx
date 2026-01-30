"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const supabase = getSupabase();

        if (supabase) {
            // O Supabase já processa o callback automaticamente
            // Apenas redirecionamos para a home após um curto delay
            const checkSession = async () => {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    router.push("/");
                } else {
                    // Se não conseguiu criar sessão, tenta novamente em 1 segundo
                    setTimeout(() => {
                        router.push("/");
                    }, 1000);
                }
            };

            checkSession();
        } else {
            router.push("/");
        }
    }, [router]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Finalizando login...</p>
            </div>
        </div>
    );
}
