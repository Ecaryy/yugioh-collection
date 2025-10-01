const CARD_BACK_URL =
    "https://lmnbqvdsxtxtwaailzeh.supabase.co/storage/v1/object/sign/assets/back-card.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xYmE0ZDNmOC1jODVmLTRkOGQtOGIwMi05Yzg4OTdmM2YzZjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmFjay1jYXJkLnBuZyIsImlhdCI6MTc1ODU3NjgzMywiZXhwIjoxNzYyODk2ODMzfQ.PGaG8bcm69E2dfD5OuCrM0DHK0754jbNMtC6FRm_gBo";
import { Link as LinkIcon, Trash2 } from "lucide-react";

export default function CardGrid({
    cards,
    loading,
    page,
    totalPages,
    nextPage,
    prevPage,
    toggleCardPossession,
    onAddClick,
    updateCardEtat,
    pageInput,
    setPageInput,
    goToPage,
    editingCardId,
    setEditingCardId,
    newImageUrl,
    setNewImageUrl,
    updateCardImage,
    cardToDelete,
    setCardToDelete,     
    setShowDeleteModal,
    showDeleteModal,
    updateCardField,
}) {
    function getTypeColor(type) {
        switch (type) {
            case "Monstre Normal":
                return "#FFE9B5";   // jaune clair orangé
            case "Monstre à Effet":
                return "#BD7B24";   // orangé
            case "Piège Normal":
                return "#94537A";   // rose foncé
            case "Piège Continu":
                return "#94537A";   // rose foncé
            case "Piège Contre":
                return "#94537A";   // rose foncé
            case "Magie Normale":
                return "#30593F";   // vert bleuté
            case "Magie Continue":
                return "#30593F";   // vert bleuté
            case "Magie Terrain":
                return "#30593F";   // vert bleuté
            case "Magie Rapide":
                return "#30593F";   // vert bleuté
            case "Magie Rituelle":
                return "#30593F";
            case "Magie Équipement":
                return "#30593F";
            case "Monstre XYZ":
                return "#000000";   // noir
            case "Monstre Fusion":
                return "#4D3A6E";   // violet foncé
            case "Monstre Synchro":
                return "#D9D9D9";   // blanc / gris clair
            case "Monstre Lien":
                return "#547FFF";   // blanc / gris clair
            case "Monstre Rituelle":
                return "#9CCEFF";
            case "Monstre P. Effet":
                return "#A3FFBD";
            case "Monstre P. XYZ":
                return "#A3FFBD";
            case "Monstre P. Synchro":
                return "#A3FFBD";
            case "Monstre P. Normal":
                return "#A3FFBD";
            case "Monstre P. Fusion":
                return "#A3FFBD";
            case "Monstre P. Rituel":
                return "#A3FFBD";
            default:
                return "#4D4D4D";   // fallback gris clair
        }
    }
    return (
        <div>
            {loading && (
                <p className="text-center text-gray-500 mb-4">Chargement...</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="relative border border-gray-400 rounded-3xl shadow transition-shadow duration-300 hover:shadow-xl overflow-visible"
                        style={{ backgroundColor: getTypeColor(card.type) }}
                    >
                       
                        {/* Container image avec group */}
                        <div className="h-48 overflow-visible rounded-t-3xl relative group ">
                            {card.image ? (
                                <img
                                    src={card.image}
                                    alt={card.nom}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <img
                                    src={CARD_BACK_URL}
                                    alt="Dos de carte"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            )}
                            {/* 🔹 Badge "possédé" */}
                            {card.possede && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-30 shadow-md">
                                    ✅
                                </div>
                            )}
                            {/* Overlay zoomée au hover */}
                            {card.image && (
                                <div className="transition-transform duration-400 absolute top-0 left-1/2 transform -translate-x-1/2 group-hover:translate-y-0 z-50 pointer-events-none w-auto group-hover:rotate-y-360">
                                    <img
                                        src={card.image}
                                        alt={card.nom}
                                        className="max-h-[500px] object-contain transition-transform duration-300 transform scale-0 group-hover:scale-300 shadow-2xl "
                                    />
                                </div>
                            )}
                        </div>
                        
                        
                        {/* Infos de la carte */}
                        <div className="p-4 relative z-20">
                            <h3 className="font-semibold text-lg text-white">{card.nom}</h3>
                            {/* Select pour le type */}
                            <div className="flex gap-1 items-center mt-1">
                            <select
                                value={card.type || ""}
                                onChange={(e) => updateCardField(card.id, "type", e.target.value)}
                                    className="text-[10px] px-0.5 py-0.5 rounded border border-gray-300/20 bg-gray-100/10 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 max-w-[100px] truncate"
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
                                {/* ...ajoute tous les types que tu as dans ta base */}
                            </select>

                            {/* Select pour la classe */}
                            <select
                                value={card.classe || ""}
                                onChange={(e) => updateCardField(card.id, "classe", e.target.value)}
                                    className="text-[10px] px-0.5 py-0.5 rounded border border-gray-300/20 bg-gray-100/10 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 max-w-[100px] truncate"
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
                                {/* ...ajoute toutes tes classes */}
                                </select>
                            </div>
                            {/* 🔹 Select état */}
                            <select
                                value={card.etat || ""}
                                onChange={(e) => updateCardEtat(card.id, e.target.value)}
                                disabled={!card.possede} // ⬅️ Désactivé si non possédée
                                className={`w-full mt-2 px-2 py-1 text-sm rounded-md border 
    ${card.possede
                                        ? "bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                <option value="">Sélectionner un état...</option>
                                <option value="Neuf">Neuf</option>
                                <option value="Très bon état">Très bon état</option>
                                <option value="Bon état">Bon état</option>
                                <option value="Abîmé">Abîmé</option>
                            </select>
                            {/* Bouton suppression */}
                            <button
                                className="absolute top-1.5 right-8 bg-red-100 p-0.5 rounded-full shadow hover:bg-red-200 transition"
                                onClick={() => {
                                    setCardToDelete(card.id);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <Trash2 size={12} className="text-red-600" />
                            </button>

                            {/* Bouton lien en haut à droite */}
                            <button
                                className="absolute top-2 right-2 bg-white p-0.5 rounded-full shadow hover:bg-gray-200 transition"
                                onClick={() => setEditingCardId(card.id)}
                            >
                                <LinkIcon size={10} className="text-blue-600" />
                            </button>

                            <div className="mt-2">
                                {card.possede ? (
                                    <button
                                        onClick={() => toggleCardPossession(card.id, card.possede)}
                                        className="w-full px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-sm transition"
                                    >
                                        Retirer de ma collection
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onAddClick(card)} // ⬅️ ouvre modal
                                        className="w-full px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 shadow-sm transition"
                                    >
                                        Ajouter à ma collection
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* 🔹 Overlay édition (➡️ replacé à l’intérieur du map) */}
                        {editingCardId === card.id && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 z-50">
                                <input
                                    type="text"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    placeholder="Nouveau lien d'image"
                                    className="w-full px-2 py-1 rounded text-white mb-2"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateCardImage(card.id, newImageUrl)}
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Sauver
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingCardId(null);
                                            setNewImageUrl("");
                                        }}
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                ))}
            </div>
           
            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-6">
                <button
                    onClick={prevPage}
                    disabled={page === 0}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    ◀ Page précédente
                </button>

                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            goToPage(parseInt(pageInput));
                        }
                    }}
                    className="w-16 text-center border rounded px-2 py-1"
                />

                <span className="font-medium">/ {totalPages}</span>

                <button
                    onClick={nextPage}
                    disabled={page + 1 >= totalPages}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    Page suivante ▶
                </button>
            </div>

            {cards.length === 0 && !loading && (
                <p className="text-center mt-6 text-gray-500">Aucune carte trouvée.</p>
            )}
        </div>
    );
}
