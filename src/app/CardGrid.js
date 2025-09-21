export default function CardGrid({ cards, loading, page, totalPages, nextPage, prevPage, toggleCardPossession, onAddClick }) {
    return (
        <div>
            {loading && <p className="text-center text-gray-500 mb-4">Chargement...</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="relative group border border-gray-400 rounded shadow bg-gray-700 transition-shadow duration-300 hover:shadow-xl overflow-visible"
                    >
                        {/* Container image cropée */}
                        <div className="h-48 overflow-hidden rounded-t-2xl">
                            {card.image && (
                                <img
                                    src={card.image}
                                    alt={card.nom}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            )}
                        </div>

                        {/* Overlay zoomée au hover */}
                        {card.image && (
                            <div className="transition-transform duration-500 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-0 group-hover:translate-y-0 z-50 pointer-events-none w-auto group-hover:rotate-y-360">
                                <img
                                    src={card.image}
                                    alt={card.nom}
                                    className="max-h-[500px] object-contain transition-transform duration-300 transform scale-0 group-hover:scale-300 shadow-2xl"
                                />
                            </div>
                        )}

                        {/* Infos de la carte */}
                        <div className="p-4 relative z-20">
                            <h3 className="font-semibold text-lg text-white">{card.nom}</h3>
                            <p className="text-sm text-gray-500">{card.type} — {card.etat}</p>
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

                <span className="font-medium">
                    Page {page + 1} / {totalPages}
                </span>

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
