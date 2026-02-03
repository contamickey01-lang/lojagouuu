"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Order } from "@/types";
import { getSupabase } from "@/lib/supabase";

interface SalesContextType {
    orders: Order[];
    isLoading: boolean;
    refreshSales: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSales = async () => {
        setIsLoading(true);
        const supabase = getSupabase();

        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from("orders")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("[Sales] Erro ao carregar vendas:", error);
                } else {
                    setOrders(data as Order[]);
                }
            } catch (error) {
                console.error("[Sales] Erro inesperado:", error);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadSales();
    }, []);

    const refreshSales = async () => {
        await loadSales();
    };

    return (
        <SalesContext.Provider value={{ orders, isLoading, refreshSales }}>
            {children}
        </SalesContext.Provider>
    );
}

export function useSales() {
    const context = useContext(SalesContext);
    if (context === undefined) {
        throw new Error("useSales must be used within a SalesProvider");
    }
    return context;
}
