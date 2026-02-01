import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { MapPin, Trophy } from "lucide-react";
import { getMatches } from "@/app/api";

// Extended interface for the modal usage (includes optional extra fields for UI)
export interface Game {
    id: string;
    match: string;
    date: string;
    stadium: string;
    city: string;
    location: string;
    lat?: number;
    long?: number;
}

interface GameSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectGame: (game: Game) => void;
}

export function GameSelectionModal({ isOpen, onClose, onSelectGame }: GameSelectionModalProps) {
    const [matches, setMatches] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMatches();
        }
    }, [isOpen]);

    const fetchMatches = async () => {
        setIsLoading(true);
        try {
            const backendMatches = await getMatches();
            const mappedMatches: Game[] = backendMatches.map(m => ({
                id: String(m.id),
                match: m.match_name,
                date: m.date,
                stadium: m.stadium_name,
                city: m.city,
                location: `${m.city}, ${m.group}`, // Display Info
                lat: m.lat,
                long: m.long
            }));
            setMatches(mappedMatches);
        } catch (error) {
            console.error("Failed to load matches", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Select a Match
                    </DialogTitle>
                    <DialogDescription>
                        Choose a FIFA World Cup 2026 match to find properties nearby.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : matches.length === 0 ? (
                        <p className="text-center text-gray-500">No matches found.</p>
                    ) : (
                        matches.map((game) => (
                            <Button
                                key={game.id}
                                variant="outline"
                                className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all text-left group"
                                onClick={() => {
                                    onSelectGame(game);
                                    onClose();
                                }}
                            >
                                <div className="flex w-full justify-between items-start">
                                    <span className="font-bold text-lg group-hover:text-blue-700">{game.match}</span>
                                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        {game.date}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{game.stadium}, {game.city}</span>
                                    </div>
                                </div>
                            </Button>
                        )))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
