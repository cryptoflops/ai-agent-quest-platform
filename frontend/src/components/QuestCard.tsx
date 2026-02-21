
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface QuestProps {
    id: number;
    title: string;
    reward: number;
    reputation: number;
    status: string;
    onAccept: () => void;
}

export function QuestCard({ id, title, reward, reputation, status, onAccept }: QuestProps) {
    const isPending = status.includes("PENDING");

    const getBadgeVariant = () => {
        if (status === "OPEN") return "default";
        if (isPending) return "outline";
        return "secondary";
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{title}</CardTitle>
                    <Badge variant={getBadgeVariant()}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex justify-between">
                        <span>Reward:</span>
                        <span className="text-primary font-bold">{reward} STX</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Reputation Required:</span>
                        <span>{reputation}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={onAccept}
                    disabled={status !== "OPEN" && !isPending}
                    variant={isPending ? "outline" : "default"}
                >
                    {status === "OPEN" ? "Accept Quest" : isPending ? "View on Explorer" : "View Details"}
                </Button>
            </CardFooter>
        </Card>
    );
}
