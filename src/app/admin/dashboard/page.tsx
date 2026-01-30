"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Package,
    Plus,
    Pencil,
    Trash2,
    LogOut,
    Search,
    X,
    Save,
    AlertCircle,
    Database,
} from "lucide-react";
import { useAdmin } from "@/components/admin/admin-provider";
import { useProducts } from "@/components/admin/products-provider";
import { Product, Category, ProductVariant } from "@/types";
import { formatCurrency, slugify } from "@/lib/utils";

export default function AdminDashboardPage() {
    const { isAuthenticated, logout } = useAdmin();
    const { products, categories, isLoading, isUsingSupabase, addProduct, updateProduct, deleteProduct } = useProducts();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    // Redirecionar se não autenticado
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/admin");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (deleteConfirm === id) {
            deleteProduct(id);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
            // Auto-cancelar após 3 segundos
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-10 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Painel Admin
                        </h1>
                        <p className="text-muted-foreground">
                            Gerencie seus produtos e estoque
                        </p>
                        <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md text-xs font-medium ${isUsingSupabase
                            ? "bg-success/10 text-success"
                            : "bg-yellow-500/10 text-yellow-500"
                            }`}>
                            <Database className="w-3 h-3" />
                            {isUsingSupabase ? "Conectado ao Supabase" : "Usando localStorage"}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Novo Produto
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sair
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Produtos</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {products.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                                <Package className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Em Estoque</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {products.filter((p) => p.stock > 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-destructive" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Sem Estoque</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {products.filter((p) => p.stock === 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Products Table */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Produto
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Categoria
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Preço
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Estoque
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Vendas
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-secondary/30 transition-colors"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground truncate max-w-[200px]">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ID: {product.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {product.category?.name || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-primary">
                                                    {formatCurrency(product.price)}
                                                </span>
                                                {product.discount > 0 && (
                                                    <span className="text-xs text-success">
                                                        -{product.discount}%
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${product.stock > 10
                                                    ? "bg-success/10 text-success"
                                                    : product.stock > 0
                                                        ? "bg-yellow-500/10 text-yellow-500"
                                                        : "bg-destructive/10 text-destructive"
                                                    }`}
                                            >
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {product.salesCount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className={`p-2 rounded-lg transition-colors ${deleteConfirm === product.id
                                                        ? "bg-destructive text-white"
                                                        : "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                                        }`}
                                                    title={
                                                        deleteConfirm === product.id
                                                            ? "Clique novamente para confirmar"
                                                            : "Deletar"
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            Nenhum produto encontrado.
                        </div>
                    )}
                </div>
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    onSave={(data) => {
                        if (editingProduct) {
                            updateProduct(editingProduct.id, data);
                        } else {
                            addProduct(data as Omit<Product, "id">);
                        }
                        setIsModalOpen(false);
                    }}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

// Product Modal Component
interface ProductModalProps {
    product: Product | null;
    categories: Category[];
    onSave: (data: Partial<Product>) => void;
    onClose: () => void;
}

function ProductModal({
    product,
    categories,
    onSave,
    onClose,
}: ProductModalProps) {
    const [formData, setFormData] = useState({
        name: product?.name || "",
        slug: product?.slug || "",
        description: product?.description || "",
        imageUrl: product?.imageUrl || "",
        price: product?.price || 0,
        comparePrice: product?.comparePrice || 0,
        discount: product?.discount || 0,
        stock: product?.stock || 0,
        categoryId: product?.categoryId || categories[0]?.id || 1,
        salesCount: product?.salesCount || 0,
        isFeatured: product?.isFeatured || false,
        featuredImageUrl: product?.featuredImageUrl || "",
        featuredVideoUrl: product?.featuredVideoUrl || "",
    });

    const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);

    const addVariant = () => {
        setVariants([...variants, { name: "", price: 0 }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        let newValue: string | number | boolean = value;

        if (type === "number") {
            newValue = parseFloat(value) || 0;
        } else if (type === "checkbox") {
            newValue = (e.target as HTMLInputElement).checked;
        }

        setFormData((prev) => {
            const updated = { ...prev, [name]: newValue };
            // Auto-gerar slug quando o nome mudar
            if (name === "name" && typeof newValue === "string") {
                updated.slug = slugify(newValue);
            }
            // Auto-calcular desconto
            if (
                (name === "price" || name === "comparePrice") &&
                updated.comparePrice > 0
            ) {
                updated.discount = Math.round(
                    ((updated.comparePrice - updated.price) / updated.comparePrice) * 100
                );
            }
            return updated;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const category = categories.find((c) => c.id === formData.categoryId);
        onSave({
            ...formData,
            category,
            variants: variants.length > 0 ? variants : undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                        {product ? "Editar Produto" : "Novo Produto"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Nome do Produto *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Slug (URL)
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Descrição
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    {/* URL da Imagem */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            URL da Imagem Principal *
                        </label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            required
                            placeholder="https://..."
                            className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* URL da Imagem em Destaque */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            URL da Imagem em Destaque (Carousel)
                        </label>
                        <input
                            type="url"
                            name="featuredImageUrl"
                            value={formData.featuredImageUrl}
                            onChange={handleChange}
                            placeholder="https://... (PNG/JPG)"
                            className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* URL do Vídeo em Destaque */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            URL do Vídeo em Destaque (Carousel)
                        </label>
                        <input
                            type="url"
                            name="featuredVideoUrl"
                            value={formData.featuredVideoUrl}
                            onChange={handleChange}
                            placeholder="https://... (MP4 ou link direto)"
                            className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Categoria */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Categoria
                        </label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Preços */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Preço (R$) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Preço Original
                            </label>
                            <input
                                type="number"
                                name="comparePrice"
                                value={formData.comparePrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Desconto (%)
                            </label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Estoque e Vendas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Estoque *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Vendas
                            </label>
                            <input
                                type="number"
                                name="salesCount"
                                value={formData.salesCount}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Destaque */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                            className="w-5 h-5 rounded bg-secondary border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="isFeatured" className="text-sm text-foreground">
                            Produto em destaque (aparece no carousel)
                        </label>
                    </div>

                    {/* Variantes de Preço */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                Variantes de Preço (ex: Diário, Semanal)
                            </h3>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Adicionar Variante
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic bg-secondary/30 p-3 rounded-xl border border-dashed border-border text-center">
                                Nenhuma variante configurada. O preço principal será usado.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {variants.map((v, index) => (
                                    <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Nome (ex: Diário)"
                                                value={v.name}
                                                onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground text-primary">R$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Preço"
                                                    value={v.price}
                                                    onChange={(e) => handleVariantChange(index, "price", parseFloat(e.target.value) || 0)}
                                                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="p-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                            * Se houver variantes, o cliente terá que escolher uma. O preço principal (R$ {formData.price}) será usado apenas como "Preço Inicial".
                        </p>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-muted-foreground transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
