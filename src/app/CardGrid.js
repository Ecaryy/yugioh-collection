const CARD_BACK_URL =
    "https://lmnbqvdsxtxtwaailzeh.supabase.co/storage/v1/object/sign/assets/back-card.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xYmE0ZDNmOC1jODVmLTRkOGQtOGIwMi05Yzg4OTdmM2YzZjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmFjay1jYXJkLnBuZyIsImlhdCI6MTc1ODU3NjgzMywiZXhwIjoxNzYyODk2ODMzfQ.PGaG8bcm69E2dfD5OuCrM0DHK0754jbNMtC6FRm_gBo";

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
    goToPage
}) {
    return (
        <div>
            {loading && (
                <p className="text-center text-gray-500 mb-4">Chargement...</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="relative border border-gray-400 rounded shadow bg-gray-700 transition-shadow duration-300 hover:shadow-xl overflow-visible"
                    >
                        {/* Container image avec group */}
                        <div className="h-48 overflow-visible rounded-t-2xl relative group">
                            {card.image ? (
                                <img
                                    src={card.image}
                                    alt={card.nom}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={CARD_BACK_URL}
                                    alt="Dos de carte"
                                    className="w-full h-full object-cover"
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
                                        className="max-h-[500px] object-contain transition-transform duration-300 transform scale-0 group-hover:scale-300 shadow-2xl"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Infos de la carte */}
                        <div className="p-4 relative z-20">
                            <h3 className="font-semibold text-lg text-white">{card.nom}</h3>
                            <p className="text-sm text-gray-500">
                                {card.type} - {card.classe}
                            </p>
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
