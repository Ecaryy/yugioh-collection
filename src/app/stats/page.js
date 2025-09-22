"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StatsPage() {
    const [totalOwned, setTotalOwned] = useState(0);
    const [totalMissing, setTotalMissing] = useState(0);
    const [completion, setCompletion] = useState(0);

    const [typeStats, setTypeStats] = useState([]);
    const [classStats, setClassStats] = useState([]);

    const [view, setView] = useState(null); // null | "type" | "classe"

    useEffect(() => {
        fetchGlobalStats();
    }, []);

    async function fetchGlobalStats() {
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
    }

    async function fetchTypeStats() {
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
                name: type,
                owned: owned || 0,
                total: totalType || 0,
                missing: (totalType || 0) - (owned || 0),
                completion: totalType > 0 ? Math.round((owned / totalType) * 100) : 0
            });
        }

        setTypeStats(statsArray);
    }

    async function fetchClassStats() {
        const classes = [
            "No",
            "Dragon",
            "Aqua",
            "Bête",
            "Elfe",
            "Démon",
            "Dinosaure",
            "Cyberse",
            "Guerrier",
            "Insecte",
            "Plante",
            "Poisson",
            "Psychique",
            "Rocher",
            "Serpent de mer",
            "Tonnerre",
            "Bête-Divine",
            "Magicien",
            "Zombie",
            "Bête-Guerrier",
            "Bête Ailée",
            "Reptile",
            "Pyro",
            "Machine",
            "Wyrm",
            "Illusion"
        ];

        const statsArray = [];
        for (const cls of classes) {
            const { count: owned } = await supabase
                .from("Cards")
                .select("*", { count: "exact", head: true })
                .eq("possede", true)
                .eq("classe", cls);

            const { count: totalClass } = await supabase
                .from("Cards")
                .select("*", { count: "exact", head: true })
                .eq("classe", cls);

            statsArray.push({
                name: cls,
                owned: owned || 0,
                total: totalClass || 0,
                missing: (totalClass || 0) - (owned || 0),
                completion: totalClass > 0 ? Math.round((owned / totalClass) * 100) : 0
            });
        }

        setClassStats(statsArray);
    }

    const handleView = async (type) => {
        setView(type);
        if (type === "type") await fetchTypeStats();
        if (type === "classe") await fetchClassStats();
    };

    const statsToShow = view === "type" ? typeStats : view === "classe" ? classStats : [];

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

            {/* Boutons pour choisir stats */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => handleView("type")}
                    className={`px-4 py-2 rounded-lg font-semibold ${view === "type" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
                >
                    Stats par Type
                </button>
                <button
                    onClick={() => handleView("classe")}
                    className={`px-4 py-2 rounded-lg font-semibold ${view === "classe" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
                >
                    Stats par Classe
                </button>
            </div>

            {/* Grille de stats */}
            {view && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {statsToShow.map((stat) => (
                        <div key={stat.name} className="p-4 border rounded-lg shadow bg-gray-50">
                            <p className="font-semibold mb-2 text-center">{stat.name}</p>
                            <div className="flex justify-around mb-2 text-sm">
                                <div className="text-center">
                                    <p className="font-bold text-green-600">{stat.owned}</p>
                                    <p>Possédées</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-red-600">{stat.missing}</p>
                                    <p>Manquantes</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold">{stat.total}</p>
                                    <p>Total</p>
                                </div>
                            </div>
                            <div className="w-full h-4 bg-gray-200 rounded-full">
                                <div
                                    className="h-4 bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${stat.completion}%` }}
                                ></div>
                            </div>
                            <p className="text-center mt-1 text-sm font-medium">
                                {stat.completion}% complété
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
