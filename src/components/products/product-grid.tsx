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
                "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4",
                className
            )}
        >
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
