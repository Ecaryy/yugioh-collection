"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function StatsPage() {
    const [totalOwned, setTotalOwned] = useState(0);
    const [totalMissing, setTotalMissing] = useState(0);
    const [completion, setCompletion] = useState(0);

    const [typeStats, setTypeStats] = useState([]);
    const [classeStats, setClasseStats] = useState([]);
    const [view, setView] = useState(null); // "type" ou "classe"

    useEffect(() => {
        fetchGlobalStats();
        fetchPrecomputedStats();
    }, []);

    // 🔹 Stats globales calculées directement sur Cards
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

    // 🔹 Stats pré-calculées via ta table CardsStats
    async function fetchPrecomputedStats() {
        const { data, error } = await supabase.from("cardsstats").select("*");
        if (error) {
            console.error("Erreur récupération CardsStats :", error);
            return;
        }

        const types = data.filter((s) => s.type !== null);
        const classes = data.filter((s) => s.classe !== null);

        // Calcul du % de complétion + tri
        const withCompletion = (arr) =>
            arr
                .map((s) => ({
                    ...s,
                    completion: s.total > 0 ? Math.round((s.owned / s.total) * 100) : 0,
                }))
                .sort((a, b) => b.completion - a.completion); // ✅ tri du + au -

        setTypeStats(withCompletion(types));
        setClasseStats(withCompletion(classes));
    }

    return (
        <main className="p-6 max-w-6xl mx-auto">
            {/* 🔙 Bouton retour */}
            <div className="mb-4">
                <Link
                    href="/"
                    className="px-4 py-2 bg-[#241530] rounded-lg border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                >
                    ← Retour
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-6 text-center">
                Stats de ma Collection
            </h1>

            {/* Barre globale */}
            <div className="mb-6">
                <p className="text-center mb-2 font-semibold">
                    Évolution globale : {completion}% ({totalOwned}/{totalOwned + totalMissing})
                </p>
                <div className="w-full h-4 bg-gray-200 rounded-full">
                    <div
                        className="h-4 bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${completion}%` }}
                    ></div>
                </div>
            </div>

            {/* Boutons de vue */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setView("type")}
                    className={`px-4 py-2 rounded-lg font-semibold ${view === "type"
                        ? "bg-[#502275] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                        : "bg-[#241530] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                        }`}
                >
                    Stats par Type
                </button>
                <button
                    onClick={() => setView("classe")}
                    className={`px-4 py-2 rounded-lg font-semibold ${view === "classe"
                        ? "bg-[#502275] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                        : "bg-[#241530] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                        }`}
                >
                    Stats par Classe
                </button>
            </div>

            {/* Grille dynamique */}
            {view === "type" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {typeStats.map((stat) => (
                        <div
                            key={stat.type}
                            className="p-4 border rounded-lg shadow bg-[#241530]"
                        >
                            <p className="font-semibold mb-2 text-center">{stat.type}</p>
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

            {view === "classe" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {classeStats.map((stat) => (
                        <div
                            key={stat.classe}
                            className="p-4 border rounded-lg shadow bg-gray-50"
                        >
                            <p className="font-semibold mb-2 text-center">{stat.classe}</p>
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
