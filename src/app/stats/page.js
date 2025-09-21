"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StatsPage() {
    const [totalOwned, setTotalOwned] = useState(0);
    const [totalMissing, setTotalMissing] = useState(0);
    const [completion, setCompletion] = useState(0);

    const [typeStats, setTypeStats] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        // Global totals
        const { count: ownedCount } = await supabase
            .from("Cards")
            .select("*", { count: "exact", head: true })
            .eq("possede", true);

        const { count: missingCount } = await supabase
            .from("Cards")
            .select("*", { count: "exact", head: true })
            .eq("possede", false);

        setTotalOwned(ownedCount || 0);
        setTotalMissing(missingCount || 0);
        const total = (ownedCount || 0) + (missingCount || 0);
        setCompletion(total > 0 ? Math.round((ownedCount / total) * 100) : 0);

        // Types sélectionnés
        const types = [
            "Monstre à Effet",
            "Monstre Normal",
            "Magie Équipement",
            "Magie Normale",
            "Magie Continue",
            "Magie Rapide",
            "Piège Normal",
            "Piège Continu",
            "Piège Contre",
            "Monstre Synchro",
            "Monstre Rituel",
            "Magie Terrain",
            "Magie Rituelle",
            "Monstre Fusion",
            "Monstre XYZ",
            "Monstre Lien",
            "Monstre P. Effet",
            "Monstre P. Normal",
            "Monstre P. XYZ",
            "Monstre P. Fusion",
            "Monstre P. Synchro",
            "Monstre P. Rituel",
            "Compétence",
            "Token",
            "Stratégie",
            "Tactique"


            // ajoute d'autres types si besoin
        ];

        const statsArray = [];
        for (const type of types) {
            const { count: owned } = await supabase
                .from("Cards")
                .select("*", { count: "exact", head: true })
                .eq("possede", true)
                .eq("type", type);

            const { count: totalType } = await supabase
                .from("Cards")
                .select("*", { count: "exact", head: true })
                .eq("type", type);

            statsArray.push({
                type,
                owned: owned || 0,
                total: totalType || 0,
                missing: (totalType || 0) - (owned || 0),
                completion: totalType > 0 ? Math.round((owned / totalType) * 100) : 0
            });
        }

        setTypeStats(statsArray);
    }

    return (
        <main className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Stats de ma Collection</h1>

            {/* Barre globale */}
            <div className="mb-6">
                <p className="text-center mb-2 font-semibold">Évolution globale : {completion}%</p>
                <div className="w-full h-4 bg-gray-200 rounded-full">
                    <div
                        className="h-4 bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${completion}%` }}
                    ></div>
                </div>
            </div>

            {/* Grille des types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {typeStats.map((typeStat) => (
                    <div
                        key={typeStat.type}
                        className="p-4 border rounded-lg shadow bg-gray-50"
                    >
                        <p className="font-semibold mb-2 text-center">{typeStat.type}</p>
                        <div className="flex justify-around mb-2 text-sm">
                            <div className="text-center">
                                <p className="font-bold text-green-600">{typeStat.owned}</p>
                                <p>Possédées</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-red-600">{typeStat.missing}</p>
                                <p>Manquantes</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">{typeStat.total}</p>
                                <p>Total</p>
                            </div>
                        </div>
                        <div className="w-full h-4 bg-gray-200 rounded-full">
                            <div
                                className="h-4 bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${typeStat.completion}%` }}
                            ></div>
                        </div>
                        <p className="text-center mt-1 text-sm font-medium">
                            {typeStat.completion}% complété
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}
