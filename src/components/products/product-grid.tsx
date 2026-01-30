import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
    products: Product[];
    className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 2xl:grid-cols-7 gap-3",
                className
            )}
        >
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
