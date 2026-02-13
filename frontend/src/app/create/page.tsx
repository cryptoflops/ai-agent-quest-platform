
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CreateQuest() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate transaction delay
        setTimeout(() => {
            setIsLoading(false);
            router.push("/");
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create New Quest</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-zinc-400">Quest Title</label>
                            <input
                                id="title"
                                required
                                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="e.g. Analyze data set"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="reward" className="text-sm font-medium text-zinc-400">Reward (STX)</label>
                            <input
                                id="reward"
                                type="number"
                                required
                                min="0"
                                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="url" className="text-sm font-medium text-zinc-400">Description / URL</label>
                            <input
                                id="url"
                                required
                                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="https://..."
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" type="button" onClick={() => router.push("/")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Quest
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
