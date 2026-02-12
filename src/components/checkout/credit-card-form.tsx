"use client";

import { useState } from "react";
import { CreditCard, Calendar, Lock, User } from "lucide-react";

interface CreditCardFormProps {
    onSubmit: (cardData: any) => void;
    isProcessing: boolean;
}

export function CreditCardForm({ onSubmit, isProcessing }: CreditCardFormProps) {
    const [cardData, setCardData] = useState({
        number: "",
        name: "",
        expiry: "",
        cvv: "",
        installments: "1"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(cardData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Número do Cartão
                </label>
                <input
                    type="text"
                    name="number"
                    value={cardData.number}
                    onChange={handleChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <User className="w-3 h-3" /> Nome no Cartão
                </label>
                <input
                    type="text"
                    name="name"
                    value={cardData.name}
                    onChange={handleChange}
                    placeholder="COMO IMPRESSO NO CARTÃO"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all uppercase"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Validade
                    </label>
                    <input
                        type="text"
                        name="expiry"
                        value={cardData.expiry}
                        onChange={handleChange}
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                        <Lock className="w-3 h-3" /> CVV
                    </label>
                    <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    Parcelamento
                </label>
                <select
                    name="installments"
                    value={cardData.installments}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                >
                    <option value="1">1x sem juros</option>
                    <option value="2">2x sem juros</option>
                    <option value="3">3x sem juros</option>
                    <option value="4">4x com juros</option>
                    <option value="5">5x com juros</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 mt-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {isProcessing ? "Processando..." : "Confirmar Pagamento"}
            </button>
        </form>
    );
}
