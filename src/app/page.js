"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CardGrid from "./CardGrid";
import Carousel from "@/components/Carousel";
import { Pirata_One } from "next/font/google";
const pirata = Pirata_One({ subsets: ["latin"], weight: ["400"] });

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
    const [editingCardId, setEditingCardId] = useState(null);
    const [newImageUrl, setNewImageUrl] = useState("");

    const [cardToDelete, setCardToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCard, setNewCard] = useState({
        nom: "",
        type: "",
        classe: "",
        etat: "",
        image: "",
        possede: false,
    });


    function handleAddClick(card) {
        setSelectedCard(card);
        setEtat(""); // reset champ
        setShowModal(true);
    }

    async function updateCardImage(cardId, imageUrl) {
        const { error } = await supabase
            .from("Cards")
            .update({ image: imageUrl })
            .eq("id", cardId);

        if (!error) {
            setCards((prevCards) =>
                prevCards.map((card) =>
                    card.id === cardId ? { ...card, image: imageUrl } : card
                )
            );
            setEditingCardId(null);
            setNewImageUrl("");
        }
    }

    async function updateCardField(cardId, field, value) {
        const { data, error } = await supabase
            .from("Cards")
            .update({ [field]: value })
            .eq("id", cardId);

        if (error) {
            console.error("Erreur mise à jour", error);
            return;
        }

        // Met à jour localement
        setCards(prev =>
            prev.map(card =>
                card.id === cardId ? { ...card, [field]: value } : card
            )
        );
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

    async function deleteCard(cardId) {
        const { error } = await supabase.from("Cards").delete().eq("id", cardId);

        if (error) {
            console.error("Erreur suppression:", error);
            alert("❌ Impossible de supprimer la carte.");
        } else {
            setCards((prev) => prev.filter((c) => c.id !== cardId));
        }

        // Fermer le modal après suppression
        setShowDeleteModal(false);
        setCardToDelete(null);
    }

    async function fetchCards() {
        const { data, error } = await supabase.from("Cards").select("*").order("id", { ascending: true });
        if (!error) setCards(data);
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
            
            
            <div className="rounded-xl gap-4 mb-6 p-4 w-full flex justify-between items-center p-4 bg-gradient-to-r from-[#2a1b4a] to-[#320b52] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                {/* Logo + titre */}
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png" // remplace par ton chemin Cloudinary ou public/logo.png
                        alt="CollectiCards logo"
                        className="w-15 h-15 object-contain drop-shadow-[0_0_5px_#f9b44c]"
                    />
                    <h1 className={`${pirata.className} text-3xl font-bold text-[#f9b44c] drop-shadow-[0_0_10px_#f9b44c]`}>
                        CollectiCards
                    </h1>
                </div>

                {/* Boutons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 font-semibold rounded-lg border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                    >
                        + Créer une carte
                    </button>

                    <a
                        href="/stats"
                        className="px-4 py-2 font-semibold rounded-lg border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                    >
                        📊 Stats
                    </a>
                </div>
            </div>
            
                <div className=" p-4 rounded-2xl shadow-md text-right">
                    <p className="text-sm">
                        Possédées : <span className="font-semibold text-green-600">{totalOwned}</span>
                    </p>
                    <p className="text-sm">
                        Manquantes : <span className="font-semibold text-red-600">{totalMissing}</span>
                    </p>
                    <p className="text-sm mt-1">
                        Completion : <span className="font-bold text-blue-600">{completion}%</span>
                    </p>
               
            
                <Carousel interval={4000} limit={8} />
            </div>
            <div className="flex flex-wrap gap-4 mb-6 p-4">
            <input
                type="text"
                placeholder="🔍 Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                    className="w-96 p-3 mb-6 bg-[#241530] rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-[#f9b44c] border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
            />
            {/* Filtres */}
            
                {/* Filtre possession */}
                <select
                    value={filterPossede}
                    onChange={(e) => setFilterPossede(e.target.value)}
                    className="p-3 mb-6 rounded-xl bg-[#241530] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f9b44c] focus:border-[#0b0620] border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                >
                    <option value="all">Toutes les cartes</option>
                    <option value="possede">✅ Possédées</option>
                    <option value="manquant">❌ Manquantes</option>
                </select>

                {/* Filtre type */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="p-3 mb-6 rounded-xl bg-[#241530] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f9b44c] focus:border-[#0b0620] border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
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
                    className="p-3 mb-6 rounded-xl bg-[#241530] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f9b44c] focus:border-[#0b0620] border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
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
                toggleCardPossession={toggleCardPossession}
                onAddClick={handleAddClick}
                updateCardEtat={updateCardEtat}
                pageInput={pageInput}
                setPageInput={setPageInput}
                goToPage={goToPage}
                editingCardId={editingCardId}
                setEditingCardId={setEditingCardId}
                newImageUrl={newImageUrl}
                setNewImageUrl={setNewImageUrl}
                updateCardImage={updateCardImage}
                cardToDelete={cardToDelete}             // ← nouvel état
                setCardToDelete={setCardToDelete}       // ← fonction setter
                showDeleteModal={showDeleteModal}       // ← nouvel état
                setShowDeleteModal={setShowDeleteModal} // ← fonction setter
                updateCardField={updateCardField} 
            />
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#241530] rounded-lg p-6 w-full max-w-md relative">
                        <h2 className="text-xl font-bold mb-4">Créer une nouvelle carte</h2>

                        {/* Nom */}
                        <input
                            type="text"
                            placeholder="Nom de la carte"
                            value={newCard.nom}
                            onChange={(e) => setNewCard({ ...newCard, nom: e.target.value })}
                            className="w-full px-2 py-1 mb-2 border rounded"
                        />

                        {/* Type */}
                        <select
                            value={newCard.type}
                            onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                            className="w-full px-2 py-1 mb-2 border rounded bg-[#241530] hover:shadow-[0_0_15px_#f9b44c] transition"
                        >
                            <option value="">Sélectionner un type...</option>
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
                            {/* ...tous tes types */}
                        </select>

                        {/* Classe */}
                        <select
                            value={newCard.classe}
                            onChange={(e) => setNewCard({ ...newCard, classe: e.target.value })}
                            className="w-full px-2 py-1 mb-2 border rounded bg-[#241530] hover:shadow-[0_0_15px_#f9b44c] transition"
                        >
                            <option value="">Sélectionner une classe...</option>
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
                            {/* ...toutes tes classes */}
                        </select>

                        {/* État */}
                        <select
                            value={newCard.etat}
                            onChange={(e) => setNewCard({ ...newCard, etat: e.target.value })}
                            className="w-full px-2 py-1 mb-2 border rounded bg-[#241530] hover:shadow-[0_0_15px_#f9b44c] transition"
                        >
                            <option value="">Sélectionner un état...</option>
                            <option value="Neuf">Neuf</option>
                            <option value="Très bon état">Très bon état</option>
                            <option value="Bon état">Bon état</option>
                            <option value="Abîmé">Abîmé</option>
                        </select>

                        {/* Image */}
                        <input
                            type="text"
                            placeholder="Lien de l'image"
                            value={newCard.image}
                            onChange={(e) => setNewCard({ ...newCard, image: e.target.value })}
                            className="w-full px-2 py-1 mb-4 border rounded"
                        />

                        {/* Possédé ? */}
                        <label className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                checked={newCard.possede}
                                onChange={(e) => setNewCard({ ...newCard, possede: e.target.checked })}
                                className="mr-2"
                            />
                            Possédé
                        </label>

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-3 py-1 bg-[#241530] rounded hover:bg-gray-400 border border-[#f9b44c] text-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={async () => {
                                    const { nom, type, classe, etat, image, possede } = newCard;

                                    const { data, error } = await supabase
                                        .from("Cards")
                                        .insert([newCard]) // objet sans id
                                        .select(); // récupère la carte créée avec l'id généré
                                    if (!error) {
                                        setCards((prev) => [...prev, ...data]); // ajoute la nouvelle carte
                                        setShowCreateModal(false);              // ferme le modal
                                        setNewCard({                             // reset du formulaire
                                            nom: "",
                                            type: "",
                                            classe: "",
                                            etat: "",
                                            image: "",
                                            possede: false,
                                        });
                                    } else {
                                        console.error("Erreur lors de l'ajout :", error);
                                    }
                                }}
                                className="px-3 py-1 border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-[#241530] rounded-xl shadow-xl p-6 w-80">
                        <h2 className="text-lg font-semibold text-[#f9b44c] mb-4">
                            Supprimer cette carte ?
                        </h2>
                        <p className="text-sm text-[#f9b44c] mb-6">
                            Cette action est <span className="font-bold text-red-600">définitive</span>.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setCardToDelete(null);
                                }}
                                className="px-4 py-2 rounded-lg text-[#f9b44c] hover:text-[#0b0620] hover:bg-gray-300 hover:shadow-[0_0_15px_#f9b44c] transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => deleteCard(cardToDelete)}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold hover:shadow-[0_0_15px_#f9b44c] transition"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#241530] backdrop-blur-lg p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4 text-[#f9b44c]">Ajouter {selectedCard.nom}</h2>

                        <label className="block mb-2 font-medium">État de la carte :</label>
                        <select
                            value={etat}
                            onChange={(e) => setEtat(e.target.value)}
                            className="w-full p-3  rounded-lg mb-4 bg-[#241530] border border-[#f9b44c] text-[#f9b44c] hover:shadow-[0_0_15px_#f9b44c] transition"
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
                            className="w-full p-3 border border border-[#f9b44c] rounded-lg mb-4"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg hover:bg-gray-400 transition border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmAdd}
                                disabled={!etat}
                                className="px-4 py-2 rounded-lg transition border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
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
