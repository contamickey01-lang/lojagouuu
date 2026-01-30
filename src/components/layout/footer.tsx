import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card/50">
            <div className="container mx-auto px-4 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold text-gradient">GouRp</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Sua loja de keys Steam com os melhores preços. Licenças autênticas
                            e entrega instantânea.
                        </p>
                    </div>

                    {/* Links Rápidos */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Links Rápidos</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/loja"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Loja
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categorias/steam-offline"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Steam Offline
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categorias/steam-keys"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Steam Keys
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Suporte */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/como-funciona"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Como Funciona
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Perguntas Frequentes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contato"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Contato
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contato */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Contato</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>suporte@gourp.com</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MessageCircle className="w-4 h-4" />
                                <span>Chat ao vivo</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {currentYear} GouRp. Todos os direitos reservados.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/termos"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                Termos de Uso
                            </Link>
                            <Link
                                href="/privacidade"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                Privacidade
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
