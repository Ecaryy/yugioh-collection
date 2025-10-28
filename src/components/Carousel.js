"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const CARD_BACK_URL = "https://lmnbqvdsxtxtwaailzeh.supabase.co/storage/v1/object/sign/assets/back-card.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xYmE0ZDNmOC1jODVmLTRkOGQtOGIwMi05Yzg4OTdmM2YzZjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmFjay1jYXJkLnBuZyIsImlhdCI6MTc1ODU3NjgzMywiZXhwIjoxNzYyODk2ODMzfQ.PGaG8bcm69E2dfD5OuCrM0DHK0754jbNMtC6FRm_gBo"; // adapte si tu utilises une URL de back-card

export default function Carousel({ interval = 4000, limit = 10 }) {
    const [cards, setCards] = useState([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);
    const containerRef = useRef(null);

    // Récupère uniquement les cartes possédées
    useEffect(() => {
        let mounted = true;
        async function fetchOwned() {
            setLoading(true);
            const { data, error } = await supabase
                .from("Cards")
                .select("id, nom, image, type, etat")
                .eq("possede", true)
                .not("image", "is", null)
                .not("image", "eq", "");

            if (error) {
                console.error("Supabase carousel error:", error);
                setCards([]);
            } else {
                // Mélange aléatoire en JS
                const shuffled = (data || []).sort(() => Math.random() - 0.5);
                setCards(shuffled.slice(0, limit)); // on garde seulement 'limit' cartes
                setIndex(0);
            }
            if (mounted) setLoading(false);
        }
        fetchOwned();
        return () => { mounted = false; };
    }, [limit]);

    // démarre le timer automatique
    useEffect(() => {
        startTimer();
        return () => stopTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cards, interval]);
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
                return "#303030";   // noir
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
                return "#E0E0E0";   // fallback gris clair
        }
    }
    function startTimer() {
        stopTimer();
        if (cards.length <= 1) return;
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % cards.length);
        }, interval);
    }
    function stopTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }

    // controls
    function prev() {
        stopTimer();
        setIndex((i) => (i - 1 + cards.length) % cards.length);
        startTimer();
    }
    function next() {
        stopTimer();
        setIndex((i) => (i + 1) % cards.length);
        startTimer();
    }

    // pause au hover
    function handleMouseEnter() {
        stopTimer();
    }
    function handleMouseLeave() {
        startTimer();
    }

    // keyboard navigation (gauche/droite)
    useEffect(() => {
        function onKey(e) {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cards]);

    if (loading) {
        return <div className="mb-6 text-center text-sm text-gray-500">Chargement carrousel...</div>;
    }
    if (!cards.length) {
        return null; // ou affiche un message si tu veux
    }

    const current = cards[index];

    return (
        <div
            ref={containerRef}
            className="mb-6 relative w-full max-w-4xl mx-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-roledescription="carousel"
        >
            {/* Vue principale */}
            <div className="relative h-56 md:h-72 lg:h-96 flex items-center justify-center overflow-visible rounded-3xl">
                {/* Previous Button */}
                <button
                    onClick={prev}
                    aria-label="Précédent"
                    className="absolute left-2 z-30 p-2 rounded-full border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                >
                    ◀
                </button>

                {/* Card display with fade/scale animation */}
                <div className="relative w-32 sm:w-40 md:w-48 lg:w-60 h-full flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-80 before:h-32 before:rounded-full before:bg-[#f9b44c]/80 before:blur-3xl before:pointer-events-none"
                    >
                        <div
                            key={current.id}
                            className="relative transform transition-all duration-500 ease-out"
                            style={{perspective: 800 }}
                        >
                            <img
                                src={current.image || CARD_BACK_URL}
                                alt={current.nom}
                                className="block w-full h-full max-h-[520px] object-cover rounded-2xl shadow-2xl"
                                loading="lazy"
                                style={{ maxWidth: "100%", maxHeight: "100%" }}
                            />
                            {/* Petite étiquette */}
                            <div className="absolute left-3 bottom-3 text-white px-2 py-1 rounded-md text-xs font-medium shadow"
                                style={{ backgroundColor: getTypeColor(current.type)}}
                            >
                                {current.nom}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={next}
                    aria-label="Suivant"
                    className="absolute right-2 z-30 p-2 rounded-full shadow hover:scale-105 transition border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"
                >
                    ▶
                </button>
            </div>

            {/* Dots indicators */}
            <div className="flex justify-center gap-2 mt-3">
                {cards.map((c, idx) => (
                    <button
                        key={c.id}
                        onClick={() => { stopTimer(); setIndex(idx); startTimer(); }}
                        aria-label={`Aller à ${c.nom}`}
                        className={`w-2.5 h-2.5 rounded-full ${idx === index ? "bg-[#f9b44c]" : "bg-gray-300 border border-[#f9b44c] text-[#f9b44c] hover:bg-[#f9b44c] hover:text-[#0b0620] hover:shadow-[0_0_15px_#f9b44c] transition"}`}
                    />
                ))}
            </div>

            {/* small info below (type / etat) */}
            <div className="mt-2 text-center text-sm text-[#f9b44c]">
                <span className="font-medium">{current.type}</span>
                {current.etat ? (<> — <span>{current.etat}</span></>) : null}
            </div>
        </div>
    );
}
