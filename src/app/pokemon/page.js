"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Pirata_One } from "next/font/google";

const pirata = Pirata_One({ subsets: ["latin"], weight: ["400"] });

export default function PokemonPage() {
    const router = useRouter();

    const defaultCardBack = "https://lmnbqvdsxtxtwaailzeh.supabase.co/storage/v1/object/sign/assets/IMG_6106.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xYmE0ZDNmOC1jODVmLTRkOGQtOGIwMi05Yzg4OTdmM2YzZjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvSU1HXzYxMDYuanBnIiwiaWF0IjoxNzYxNTA0OTM4LCJleHAiOjU1NDU4MjQ5Mzh9.bCimuXg_RbJ10KhYWE9Lq_dnKXGresKG1fapyJOHIPY"

    const [pokemons, setPokemons] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [generationFilter, setGenerationFilter] = useState("all");
    const [extensionFilter, setExtensionFilter] = useState("all");

    const [editingCard, setEditingCard] = useState(null);

    const [selectedPokemon, setSelectedPokemon] = useState(null); // pour la pop-up

    const [currentPage, setCurrentPage] = useState(1);
    const pokemonsPerPage = 20;

    const [addingCard, setAddingCard] = useState(false);
    const [newCard, setNewCard] = useState({
        name: "",
        generation: 1,
        description: "",
        icon_url: "",
        owned_card_1_url: "",
        owned_card_2_url: "",
        wanted_card_1_link: "",
        wanted_card_2_link: "",
        wanted_card_1_extension: "",
        wanted_card_2_extension: "",
        wanted_card_1_obtained: false,
        wanted_card_2_obtained: false,
    });

    useEffect(() => {
        const fetchPokemons = async () => {
            const { data, error } = await supabase
                .from("pokemons")
                .select("*")
                .order("id", { ascending: true }); // <-- tri par id croissant

            if (error) console.error("Erreur :", error);
            else setPokemons(data);
        };
        fetchPokemons();
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        if (value) router.push(value);
    };

    // --- FILTRAGE GLOBAL ---
    const filteredPokemons = pokemons.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "all"
                ? true
                : filter === "complete"
                    ? p.wanted_card_1_obtained && p.wanted_card_2_obtained
                    : !(p.wanted_card_1_obtained && p.wanted_card_2_obtained);

        const matchesGen =
            generationFilter === "all"
                ? true
                : p.generation === parseInt(generationFilter);

        const matchesExt =
            extensionFilter === "all"
                ? true
                : [p.wanted_card_1_extension, p.wanted_card_2_extension].includes(
                    extensionFilter
                );

        return matchesSearch && matchesFilter && matchesGen && matchesExt;
    });

    const startIndex = (currentPage - 1) * pokemonsPerPage;
    const endIndex = startIndex + pokemonsPerPage;
    const displayedPokemons = filteredPokemons.slice(startIndex, endIndex);
    const totalPages = Math.ceil(pokemons.length / pokemonsPerPage);


    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1b0f2e] to-[#2a1b4a]">
        <main className="p-8 text-white max-w-7xl mx-auto bg-gradient-to-b from-[#1b0f2e] to-[#2a1b4a]">
            {/* HEADER */}
            
            <div className="rounded-xl gap-4 mb-6 p-4 w-full flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-[#2a1b4a] to-[#320b52] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="CollectiCards logo"
                        className="w-14 h-14 object-contain drop-shadow-[0_0_5px_#f9b44c]"
                    />
                    <h1
                        className={`${pirata.className} text-3xl font-bold text-[#f9b44c] drop-shadow-[0_0_10px_#f9b44c]`}
                    >
                        CollectiCards
                    </h1>
                </div>
                    
                {/* RECHERCHE + FILTRES */}
                <div className="flex flex-wrap gap-3 items-center justify-center mt-4 md:mt-0">
                    <input
                        type="text"
                        placeholder="Rechercher un Pokémon..."
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#1b0f2e] text-white border border-[#f9b44c]/30 focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#1b0f2e] text-white border border-[#f9b44c]/30"
                    >
                        <option value="all">Tous</option>
                        <option value="complete">Complétés</option>
                        <option value="incomplete">Incomplets</option>
                    </select>

                    <select
                        value={generationFilter}
                        onChange={(e) => setGenerationFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#1b0f2e] text-white border border-[#f9b44c]/30"
                    >
                        <option value="all">Toutes générations</option>
                        <option value="1">Génération 1</option>
                        <option value="2">Génération 2</option>
                        <option value="3">Génération 3</option>
                        <option value="4">Génération 4</option>
                        <option value="5">Génération 5</option>
                        <option value="6">Génération 6</option>
                        <option value="7">Génération 7</option>
                        <option value="8">Génération 8</option>
                        <option value="9">Génération 9</option>
                        <option value="10">Génération 10</option>
                        <option value="11">Génération 11</option>
                    </select>

                    <select
                        value={extensionFilter}
                        onChange={(e) => setExtensionFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#1b0f2e] text-white border border-[#f9b44c]/30"
                    >
                        <option value="all">Toutes extensions</option>
                        <option value="151">151</option>
                        <option value="Légendes Brillantes">Légendes Brillantes</option>
                        <option value="Couronne Stellaire">Couronne Stellaire</option>
                        <option value="Méga-Évolution">Méga-Évolution</option>
                            <option value="Foudre Noire">Foudre Noire</option>
                            <option value="Flamme Blanche">Flamme Blanche</option>
                            <option value="Rivalités Destinées">Rivalités Destinées</option>
                            <option value="Aventures Ensemble">Aventures Ensemble</option>
                            <option value="Évolutions Prismatiques">Évolutions Prismatiques</option>
                            <option value="Évolutions Prismatiques">Évolutions Prismatiques</option>
                            <option value="Étincelles Déferlantes">Étincelles Déferlantes</option>
                            <option value="Couronne Stellaire">Couronne Stellaire</option>
                            <option value="Fable Nébuleuse">Fable Nébuleuse</option>

                    </select>
                        <button
                            onClick={() => setAddingCard(true)}
                            className="px-3 py-2 bg-[#f9b44c] text-black rounded-lg font-bold hover:bg-yellow-400 "
                        >
                            Ajouter un Pokemon
                        </button>
                    <select
                        onChange={handleChange}
                        defaultValue="/pokemon"
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        <option value="/">Yu-Gi-Oh!</option>
                        <option value="/pokemon">Pokémon</option>
                    </select>
                </div>
            </div>


            {/* GRID */}
            <section className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {displayedPokemons.map((p) => (
                    <div
                        key={p.id}
                        className="bg-[#24163a] rounded-2xl p-6 shadow-lg border border-[#f9b44c]/40 hover:shadow-[0_0_20px_#f9b44c80] transition transform hover:scale-[1.03]"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={p.icon_url}
                                alt={p.name}
                                className="w-16 h-16 rounded-full border border-[#f9b44c]"
                            />
                            <div className="text-left">
                                <h2 className="text-xl font-semibold text-[#f9b44c]">
                                    {p.name}
                                </h2>
                                <p className="text-sm text-gray-300">
                                    Génération {p.generation}
                                </p>
                            </div>
                        </div>

                        {/* Description (cliquable) */}
                        <p
                            className="text-gray-400 text-base mb-4 cursor-pointer hover:text-[#f9b44c]"
                            onClick={() => setSelectedPokemon(p)}
                        >
                            {p.description?.slice(0, 100)}...
                            <span className="text-[#f9b44c] ml-1">[Lire plus]</span>
                        </p>

                        {/* Cartes possédées */}
                        <div className="mb-4">
                            <h3 className="text-md text-gray-300 mb-2">Mes cartes</h3>
                            <div className="flex gap-4 justify-center">
                                {[p.owned_card_1_url, p.owned_card_2_url].map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url || defaultCardBack} // si pas de lien, afficher le dos de carte
                                        alt={`card${idx + 1}`}
                                        className="w-40 h-56 object-cover rounded-lg border border-[#f9b44c]/60 shadow-md"
                                        onClick={() => setEditingCard({ pokemonId: p.id, cardIndex: idx + 1, currentUrl: url || "" })}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Cartes voulues */}
                        <div>
                            <h3 className="text-md text-gray-300 mb-2">Cartes voulues</h3>
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-3 mb-1">
                                    <input
                                        type="checkbox"
                                        checked={p[`wanted_card_${i}_obtained`]}
                                        onChange={async () => {
                                            // 1️⃣ Mettre à jour dans Supabase
                                            const { error } = await supabase
                                                .from('pokemons')
                                                .update({ [`wanted_card_${i}_obtained`]: !p[`wanted_card_${i}_obtained`] })
                                                .eq('id', p.id);

                                            if (error) {
                                                console.error('Erreur mise à jour :', error);
                                            } else {
                                                // 2️⃣ Mettre à jour localement pour rafraîchir l'UI
                                                setPokemons((prev) =>
                                                    prev.map((poke) =>
                                                        poke.id === p.id
                                                            ? { ...poke, [`wanted_card_${i}_obtained`]: !poke[`wanted_card_${i}_obtained`] }
                                                            : poke
                                                    )
                                                );
                                            }
                                        }}
                                        className="accent-[#f9b44c] scale-125"
                                    />
                                    {p[`wanted_card_${i}_link`] ? (
                                        <a
                                            href={p[`wanted_card_${i}_link`]}
                                            target="_blank"
                                            className="text-blue-400 hover:underline"
                                        >
                                            {p[`wanted_card_${i}_extension`] || "Extension inconnue"}
                                        </a>
                                    ) : (
                                        <span className="text-gray-500 italic">Aucun lien</span>
                                    )}
                                </div>
                            ))}

                        </div>

                    </div>
                    
                ))}
            </section>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 text-white">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-bold transition ${currentPage === 1
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-[#f9b44c] text-black hover:bg-yellow-400"
                            }`}
                    >
                        ◀ Précédent
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-[#f9b44c] font-semibold">Page</span>
                        <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={currentPage}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 1 && value <= totalPages) setCurrentPage(value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const value = Number(e.currentTarget.value);
                                    if (value >= 1 && value <= totalPages) setCurrentPage(value);
                                }
                            }}
                            className="w-16 text-center text-black font-bold rounded-md border-2 border-[#f9b44c] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <span className="text-gray-300">/ {totalPages}</span>
                    </div>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-bold transition ${currentPage === totalPages
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-[#f9b44c] text-black hover:bg-yellow-400"
                            }`}
                    >
                        Suivant ▶
                    </button>
                </div>

            {/* POP-UP description */}
            {selectedPokemon && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#2a1b4a] border border-[#f9b44c]/50 rounded-2xl p-8 max-w-2xl text-center relative">
                        <button
                            onClick={() => setSelectedPokemon(null)}
                            className="absolute top-2 right-3 text-gray-300 hover:text-white text-2xl"
                        >
                            ✕
                        </button>
                        <img
                            src={selectedPokemon.icon_url}
                            alt={selectedPokemon.name}
                            className="w-24 h-24 mx-auto mb-4 border border-[#f9b44c] rounded-full"
                        />
                        <h2 className="text-2xl font-bold text-[#f9b44c] mb-3">
                            {selectedPokemon.name}
                        </h2>
                        <p className="text-gray-300 leading-relaxed text-xs whitespace-pre-line">
                            {selectedPokemon.description}
                        </p>
                    </div>
                </div>
                )}

            {editingCard && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-[#2a1b4a] border border-[#f9b44c]/50 rounded-2xl p-8 max-w-md text-center relative">
                            <button
                                onClick={() => setEditingCard(null)}
                                className="absolute top-2 right-3 text-gray-300 hover:text-white text-2xl"
                            >
                                ✕
                            </button>

                            <h2 className="text-2xl font-bold text-[#f9b44c] mb-4">
                                Modifier le lien de la carte
                            </h2>

                            <input
                                type="text"
                                value={editingCard.currentUrl}
                                onChange={(e) => setEditingCard({ ...editingCard, currentUrl: e.target.value })}
                                placeholder="Lien de l'image"
                                className="w-full px-3 py-2 rounded-lg text-gray-100"
                            />

                            <button
                                onClick={async () => {
                                    const { pokemonId, cardIndex, currentUrl } = editingCard;

                                    // Mettre à jour Supabase
                                    const { error } = await supabase
                                        .from("pokemons")
                                        .update({ [`owned_card_${cardIndex}_url`]: currentUrl })
                                        .eq("id", pokemonId);

                                    if (error) console.error("Erreur :", error);
                                    else {
                                        // Mettre à jour l'état local
                                        setPokemons((prev) =>
                                            prev.map((p) =>
                                                p.id === pokemonId
                                                    ? { ...p, [`owned_card_${cardIndex}_url`]: currentUrl }
                                                    : p
                                            )
                                        );
                                        setEditingCard(null); // fermer la pop-up
                                    }
                                }}
                                className="mt-4 px-4 py-2 bg-[#f9b44c] text-black rounded-lg font-bold hover:bg-yellow-400 transition"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                )}
                {addingCard && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#2a1b4a] border-2 border-[#f9b44c]/70 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(249,180,76,0.4)] relative">
                            {/* Bouton fermeture */}
                            <button
                                onClick={() => setAddingCard(false)}
                                className="absolute top-3 right-4 text-[#f9b44c] hover:text-white text-2xl"
                            >
                                ✕
                            </button>

                            {/* Titre */}
                            <h2 className="text-3xl font-bold text-[#f9b44c] mb-6 text-center">
                                Ajouter un Pokémon
                            </h2>

                            {/* Formulaire */}
                            <div className="flex flex-col gap-4">
                                {/* Nom */}
                                <input
                                    type="text"
                                    placeholder="Nom du Pokémon"
                                    value={newCard.name}
                                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                                    className="px-4 py-2 rounded-lg bg-[#1b0f2e] border border-[#f9b44c]/40 text-white focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none"
                                />

                                {/* Génération */}
                                <input
                                    type="number"
                                    placeholder="Génération"
                                    value={newCard.generation}
                                    onChange={(e) =>
                                        setNewCard({ ...newCard, generation: parseInt(e.target.value) })
                                    }
                                    className="px-4 py-2 rounded-lg bg-[#1b0f2e] border border-[#f9b44c]/40 text-white focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none"
                                />

                                {/* Description */}
                                <textarea
                                    placeholder="Description"
                                    value={newCard.description}
                                    onChange={(e) =>
                                        setNewCard({ ...newCard, description: e.target.value })
                                    }
                                    rows={4}
                                    className="px-4 py-2 rounded-lg bg-[#1b0f2e] border border-[#f9b44c]/40 text-white focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none resize-none"
                                />
                                {/* Lien icône (nouveau champ) */}
                                <input
                                    type="text"
                                    placeholder="Lien de l'icône (icon_url)"
                                    value={newCard.icon_url}
                                    onChange={(e) => setNewCard({ ...newCard, icon_url: e.target.value })}
                                    className="px-4 py-2 rounded-lg bg-[#1b0f2e] border border-[#f9b44c]/40 text-white focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none"
                                />
                                {/* Possédées */}
                                <h3 className="text-lg text-[#f9b44c] mt-2">Cartes possédées</h3>
                                <input
                                    type="text"
                                    placeholder="Lien carte possédée 1"
                                    value={newCard.owned_card_1_url}
                                    onChange={(e) =>
                                        setNewCard({ ...newCard, owned_card_1_url: e.target.value })
                                    }
                                    className="px-4 py-2 rounded-lg bg-[#1b0f2e] border border-[#f9b44c]/40 text-white focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none"
                                />

                                <input
                                    type="text"
                                    placeholder="Lien carte possédée 2"
                                    value={newCard.owned_card_2_url}
                                    onChange={(e) =>
                                        setNewCard({ ...newCard, owned_card_2_url: e.target.value })
                                    }
                                    className="px-4 py-2 rounded-lg bg-[#1b0f2e] border border-[#f9b44c]/40 text-white focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none"
                                />

                                {/* Voulues */}
                                <h3 className="text-lg text-[#f9b44c] mt-4">Cartes voulues</h3>

                                {[1, 2].map((i) => (
                                    <div key={i} className="flex flex-col gap-2 border border-[#f9b44c]/20 rounded-lg p-3">
                                        <h4 className="text-[#f9b44c]/80 font-semibold">Carte {i}</h4>
                                        <input
                                            type="text"
                                            placeholder={`Lien carte voulue ${i}`}
                                            value={newCard[`wanted_card_${i}_link`]}
                                            onChange={(e) =>
                                                setNewCard({
                                                    ...newCard,
                                                    [`wanted_card_${i}_link`]: e.target.value,
                                                })
                                            }
                                            className="px-4 py-2 rounded-lg bg-[#1b0f2e] border border-[#f9b44c]/40 text-white focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none"
                                        />

                                        <input
                                            type="text"
                                            placeholder={`Extension carte voulue ${i}`}
                                            value={newCard[`wanted_card_${i}_extension`]}
                                            onChange={(e) =>
                                                setNewCard({
                                                    ...newCard,
                                                    [`wanted_card_${i}_extension`]: e.target.value,
                                                })
                                            }
                                            className="px-4 py-2 rounded-lg bg-[#1b0f2e] border border-[#f9b44c]/40 text-white focus:border-[#f9b44c] focus:ring-2 focus:ring-[#f9b44c]/40 outline-none"
                                        />

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={newCard[`wanted_card_${i}_obtained`]}
                                                onChange={(e) =>
                                                    setNewCard({
                                                        ...newCard,
                                                        [`wanted_card_${i}_obtained`]: e.target.checked,
                                                    })
                                                }
                                                className="accent-[#f9b44c] scale-125"
                                            />
                                            <span className="text-gray-200 text-sm">Carte obtenue</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bouton d’envoi */}
                            <button
                                onClick={async () => {
                                    const { data, error } = await supabase
                                        .from("pokemons")
                                        .insert([newCard])
                                        .select(); // 🔥 important pour récupérer la nouvelle ligne

                                    if (error) {
                                        console.error("Erreur ajout :", error);
                                        alert("❌ Erreur lors de l'ajout : " + error.message);
                                    } else if (data && data.length > 0) {
                                        setPokemons((prev) => [...prev, data[0]]);
                                        setAddingCard(false);
                                        setNewCard({
                                            name: "",
                                            generation: 1,
                                            description: "",
                                            icon_url: "",
                                            owned_card_1_url: "",
                                            owned_card_2_url: "",
                                            wanted_card_1_link: "",
                                            wanted_card_2_link: "",
                                            wanted_card_1_extension: "",
                                            wanted_card_2_extension: "",
                                            wanted_card_1_obtained: false,
                                            wanted_card_2_obtained: false,
                                        });
                                    } else {
                                        console.warn("Aucune donnée renvoyée par Supabase après l'insertion.");
                                    }
                                }}

                                className="mt-6 w-full py-3 bg-[#f9b44c] text-black rounded-lg font-bold text-lg hover:bg-yellow-400 transition"
                            >
                                ✅ Ajouter le Pokémon
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
