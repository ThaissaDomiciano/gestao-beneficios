import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { LucideIcon } from "lucide-react";
import { ReactNode } from 'react';

interface CardEstatisticaProps {
    titulo: string;
    valor: string | ReactNode;
    Icone: LucideIcon;  
    loading?: boolean;
}

export default function CardEstatistica({ titulo, valor, Icone, loading }: CardEstatisticaProps) {
    return (
        <Card
            className="
                w-full
                h-24 md:h-28
                border border-[var(--verde-900)]
                bg-[var(--branco)]
                rounded-xl shadow-sm
                flex
                px-4
            "
        >
            <CardContent
                className="
                    flex
                    w-full
                    p-0
                    h-full
                    items-stretch      
                    justify-between
                "
            >
                <div className="flex h-full items-start gap-3">
                    <div className="w-[6px] bg-[var(--verde-900)] rounded-full self-stretch" />

                    <div className="flex flex-col justify-start">
                        <h2 className="font-semibold text-[var(--preto)]">
                            {titulo}
                        </h2>

                        {loading ? (
                            <div className="mt-2">
                                <Spinner className="h-5 w-5" />
                            </div>
                        ) : (
                            <p className="text-xl font-medium text-[var(--preto)] mt-2">
                                {valor}
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className="
                        bg-gradient-to-br from-[#07657F] to-[#05323F]
                        rounded-lg p-2.5 ml-4
                        h-fit           
                        self-start      
                    "
                >
                    <Icone className="h-5 w-5 text-white" />
                </div>
            </CardContent>
        </Card>
    );
}