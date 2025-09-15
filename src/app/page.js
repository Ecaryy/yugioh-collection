"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CardGrid from "./CardGrid";

export default function HomePage() {
    const [cards, setCards] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [totalOwned, setTotalOwned] = useState(0);
    const [totalMissing, setTotalMissing] = useState(0);
    const [completion, setCompletion] = useState(0);
    const CARDS_PER_PAGE = 20;

    async function loadCards(page = 0, searchTerm = "") {
        setLoading(true);

        const from = page * CARDS_PER_PAGE;
        const to = from + CARDS_PER_PAGE - 1;

        let query = supabase
            .from("Cards")
            .select("*", { count: "exact" })
            .range(from, to);

        if (searchTerm) {
            query = query.ilike("nom", `%${searchTerm}%`);
        }

        const { data, count, error } = await query;

        if (error) {
            console.error("Supabase error:", error);
            setCards([]);
            setTotalPages(0);
        } else {
            setCards(data || []);
            setTotalPages(Math.ceil((count || 0) / CARDS_PER_PAGE));
        }

        setLoading(false);
    }

    async function fetchCollectionStats() {
        // Compter les cartes possédées
        const { count: ownedCount, error: errorOwned } = await supabase
            .from("Cards")
            .select("*", { count: "exact" })
            .eq("possede", true);

        if (errorOwned) console.error("Erreur possédées :", errorOwned);

        // Compter les cartes non possédées
        const { count: missingCount, error: errorMissing } = await supabase
            .from("Cards")
            .select("*", { count: "exact" })
            .eq("possede", false);

        if (errorMissing) console.error("Erreur manquantes :", errorMissing);

        const total = (ownedCount || 0) + (missingCount || 0);
        const completionPercentage = total > 0 ? Math.round((ownedCount / total) * 100) : 0;

        setTotalOwned(ownedCount || 0);
        setTotalMissing(missingCount || 0);
        setCompletion(completionPercentage);
    }

    async function toggleCardPossession(cardId, currentlyOwned) {
        const { data, error } = await supabase
            .from("Cards")
            .update({ possede: !currentlyOwned })
            .eq("id", cardId);

        if (error) console.error("Erreur mise à jour carte:", error);
        else {
            // Met à jour localement le state pour re-render
            setCards((prev) =>
                prev.map((c) =>
                    c.id === cardId ? { ...c, possede: !currentlyOwned } : c
                )
            );
        }
    }
    useEffect(() => {
        fetchCollectionStats();
    }, []);
    // Reload cards chaque fois que la recherche change
    useEffect(() => {
        setPage(0);
        loadCards(0, search);
    }, [search]);

    // Fonction pour page suivante
    const nextPage = () => {
        if (page + 1 < totalPages) {
            loadCards(page + 1, search);
            setPage(page + 1);
        }
    };

    // Fonction pour page précédente
    const prevPage = () => {
        if (page > 0) {
            loadCards(page - 1, search);
            setPage(page - 1);
        }
    };

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-end mb-4">
                <div className="bg-gray-800 p-3 rounded shadow text-right">
                    <p className="text-sm">
                        Possédées : <span className="font-semibold text-green-600">{totalOwned}</span>
                    </p>
                    <p className="text-sm">
                        Manquantes : <span className="font-semibold text-red-600">{totalMissing}</span>
                    </p>
                    <p className="text-sm mt-1">
                        Completion : <span className="font-bold">{completion}%</span>
                    </p>
                </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center">
                Ma Collection Yu-Gi-Oh
            </h1>

            <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 mb-6 border border-gray-300 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <CardGrid
                cards={cards}
                loading={loading}
                page={page}
                totalPages={totalPages}
                nextPage={nextPage}
                prevPage={prevPage}
                toggleCardPossession={toggleCardPossession} // ← bien passé ici
            />
        </main>
    );
}
