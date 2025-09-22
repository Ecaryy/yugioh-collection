"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CardGrid from "./CardGrid";

export default function HomePage() {
    const [cards, setCards] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageInput, setPageInput] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalOwned, setTotalOwned] = useState(0);
    const [totalMissing, setTotalMissing] = useState(0);
    const [completion, setCompletion] = useState(0);
    const CARDS_PER_PAGE = 20;


    const [filterPossede, setFilterPossede] = useState("all"); // all | possede | manquant
    const [filterType, setFilterType] = useState("all");       // all | Monstre | Magie | Piège
    const [filterClasse, setFilterClasse] = useState("all");

    const [selectedCard, setSelectedCard] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [etat, setEtat] = useState("");
    const [imageUrl, setImageUrl] = useState(""); 


    function handleAddClick(card) {
        setSelectedCard(card);
        setEtat(""); // reset champ
        setShowModal(true);
    }

    async function confirmAdd() {
        if (!selectedCard) return;

        const { error } = await supabase
            .from("Cards")
            .update({ possede: true, etat, image: imageUrl || selectedCard.image })
            .eq("id", selectedCard.id);

        if (error) {
            console.error("Erreur ajout carte :", error);
        } else {
            // Mets à jour le state local
            setCards((prev) =>
                prev.map((c) =>
                    c.id === selectedCard.id
                        ? { ...c, possede: true, etat, image: imageUrl || c.image }
                        : c
                )
            );
            // Reset
            setEtat("");
            setImageUrl("");
            setSelectedCard(null);
            setShowModal(false);
        }
    }

    async function loadCards(page = 0, searchTerm = "", possedeFilter = "all", typeFilter = "all") {
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

        //  filtre possession
        if (possedeFilter === "possede") {
            query = query.eq("possede", true);
        } else if (possedeFilter === "manquant") {
            query = query.eq("possede", false);
        }

        //  filtre type
        if (typeFilter !== "all") {
            query = query.eq("type", typeFilter);
        }

        if (filterClasse !== "all") {
            query = query.eq("classe", filterClasse);
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

    async function toggleCardPossession(cardId, currentlyOwned)
    {
        if (currentlyOwned) {
            // Si on retire la carte → mettre possede = false et vider etat
            const { error } = await supabase
                .from("Cards")
                .update({ possede: false, etat: null, image: null })
                .eq("id", cardId);

            if (error) console.error("Erreur mise à jour carte:", error);
            else {
                setCards((prev) =>
                    prev.map((c) =>
                        c.id === cardId ? { ...c, possede: false, etat: null, image: null } : c
                    )
                );
            }
        } else {
            // Si on ajoute, on ne fait rien ici → c’est la modal qui gère ça
            // (car elle envoie possede=true + etat choisi)
        }
    }

    async function updateCardEtat(cardId, newEtat) {
        const { error } = await supabase
            .from("Cards")
            .update({ etat: newEtat })
            .eq("id", cardId);

        if (error) {
            console.error("Erreur mise à jour état:", error);
        } else {
            // 🔹 Met à jour le state local pour un affichage instantané
            setCards((prev) =>
                prev.map((c) =>
                    c.id === cardId ? { ...c, etat: newEtat } : c
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
        loadCards(0, search, filterPossede, filterType, filterClasse);
    }, [search, filterPossede, filterType, filterClasse]);

    // Fonction pour page suivante
    const nextPage = () => {
        if (page + 1 < totalPages) {
            loadCards(page + 1, search, filterPossede, filterType, filterClasse);
            setPage(page + 1);
            setPageInput(page + 2);
        }
    };

    const prevPage = () => {
        if (page > 0) {
            loadCards(page - 1, search, filterPossede, filterType, filterClasse);
            setPage(page - 1);
            setPageInput(page);
        }
    };
    const goToPage = (newPage) => {
        const pageNumber = Math.min(Math.max(1, newPage), totalPages);
        setPage(pageNumber - 1);
        loadCards(pageNumber - 1, search, filterPossede, filterType, filterClasse);
        setPageInput(pageNumber); // met à jour le champ de saisie
    };


    return (
        <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-end mb-6">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-md text-right">
                    <p className="text-sm">
                        Possédées : <span className="font-semibold text-green-600">{totalOwned}</span>
                    </p>
                    <p className="text-sm">
                        Manquantes : <span className="font-semibold text-red-600">{totalMissing}</span>
                    </p>
                    <p className="text-sm mt-1">
                        Completion : <span className="font-bold text-blue-600">{completion}%</span>
                    </p>
                </div>
            </div>
            <div className="flex justify-between items-center mb-6 p-4 bg-gray-800 rounded-xl shadow-md">
                {/* Titre du site */}
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Ma Collection Yu-Gi-Oh</h1>

                {/* Bouton pour stats */}
                <a
                    href="/stats"
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition-colors"
                >
                    📊 Stats
                </a>
            </div>
            <input
                type="text"
                placeholder="🔍 Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 mb-6 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {/* Filtres */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Filtre possession */}
                <select
                    value={filterPossede}
                    onChange={(e) => setFilterPossede(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                >
                    <option value="all">Toutes les cartes</option>
                    <option value="possede">✅ Possédées</option>
                    <option value="manquant">❌ Manquantes</option>
                </select>

                {/* Filtre type */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                >
                    <option value="all">Tous les types</option>
                    <option value="Monstre à Effet">Monstre à Effet</option>
                    <option value="Monstre Normal">Monstre Normal</option>
                    <option value="Magie Équipement">Magie Équipement</option>
                    <option value="Magie Normale">Magie Normale</option>
                    <option value="Magie Continue">Magie Continue</option>
                    <option value="Magie Rapide">Magie Rapide</option>
                    <option value="Piège Normal">Piège Normal</option>
                    <option value="Piège Continu">Piège Continu</option>
                    <option value="Piège Contre">Piège Contre</option>
                    <option value="Monstre Synchro">Monstre Synchro</option>
                    <option value="Token">Token</option>
                    <option value="Monstre Rituel">Monstre Rituel</option>
                    <option value="Magie Terrain">Magie Terrain</option>
                    <option value="Magie Rituelle">Magie Rituelle</option>
                    <option value="Monstre Fusion">Monstre Fusion</option>
                    <option value="Monstre XYZ">Monstre XYZ</option>
                    <option value="Monstre Lien">Monstre Lien</option>
                    <option value="Monstre P. Effet">Monstre P. Effet</option>
                    <option value="Monstre P. Normal">Monstre P. Normal</option>
                    <option value="Monstre P. XYZ">Monstre P. XYZ</option>
                    <option value="Monstre P. Fusion">Monstre P. Fusion</option>
                    <option value="Monstre P. Synchro">Monstre P. Synchro</option>
                    <option value="Compétence">Compétence</option>
                    <option value="Monstre P. Rituel">Monstre P. Rituel</option>
                    <option value="Spécial">Spécial</option>
                    <option value="Stratégie">Stratégie</option>
                    <option value="Tactique">Tactique</option>
                </select>

                {/* Filtre classe */}
                <select
                    value={filterClasse}
                    onChange={(e) => setFilterClasse(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                >
                    <option value="all">Toutes les classes</option>
                    <option value="No">No</option>
                    <option value="Dragon">Dragon</option>
                    <option value="Aqua">Aqua</option>
                    <option value="Bête">Bête</option>
                    <option value="Elfe">Elfe</option>
                    <option value="Démon">Démon</option>
                    <option value="Dinosaure">Dinosaure</option>
                    <option value="Cyberse">Cyberse</option>
                    <option value="Guerrier">Guerrier</option>
                    <option value="Insecte">Insecte</option>
                    <option value="Plante">Plante</option>
                    <option value="Poisson">Poisson</option>
                    <option value="Psychique">Psychique</option>
                    <option value="Rocher">Rocher</option>
                    <option value="Serpent de mer">Serpent de mer</option>
                    <option value="Tonnerre">Tonnerre</option>
                    <option value="Bête-Divine">Bête-Divine</option>
                    <option value="Magicien">Magicien</option>
                    <option value="Zombie">Zombie</option>
                    <option value="Bête-Guerrier">Bête-Guerrier</option>
                    <option value="Bête Ailée">Bête Ailée</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Pyro">Pyro</option>
                    <option value="Machine">Machine</option>
                    <option value="Wyrm">Wyrm</option>
                    <option value="Illusion">Illusion</option>
                </select>
            </div>

            <CardGrid
                cards={cards}
                loading={loading}
                page={page}
                totalPages={totalPages}
                nextPage={nextPage}
                prevPage={prevPage}
                toggleCardPossession={toggleCardPossession} // ← bien passé ici
                onAddClick={handleAddClick}
                updateCardEtat={updateCardEtat}
                pageInput={pageInput}
                setPageInput={setPageInput}
                goToPage={goToPage}
            />
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Ajouter {selectedCard.nom}</h2>

                        <label className="block mb-2 font-medium">État de la carte :</label>
                        <select
                            value={etat}
                            onChange={(e) => setEtat(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                        >
                            <option value="">Sélectionner...</option>
                            <option value="Neuf">Neuf</option>
                            <option value="Très bon état">Très bon état</option>
                            <option value="Bon état">Bon état</option>
                            <option value="Abîmé">Abîmé</option>
                        </select>

                        {/* Champ URL image */}
                        <label className="block mb-2 font-medium">Lien image :</label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://exemple.com/mon-image.jpg"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmAdd}
                                disabled={!etat}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>

    );

}
