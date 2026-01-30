import { ProductGrid } from "@/components/products/product-grid";
import { products } from "@/lib/mock-data";

export default function LojaPage() {
    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Nossa Loja
                    </h1>
                    <p className="text-muted-foreground">
                        Explore todos os nossos jogos e keys disponíveis
                    </p>
                </div>

                {/* Products Grid */}
                <ProductGrid products={products} />
            </div>
        </div>
    );
}
