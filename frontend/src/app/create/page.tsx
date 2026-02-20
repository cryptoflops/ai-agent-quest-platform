
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { openContractCall } from "@stacks/connect";
import { STACKS_MAINNET } from "@stacks/network";
import { stringAsciiCV, uintCV } from "@stacks/transactions";
import { contractAddress, getUserSession } from "@/lib/stacks";

export default function CreateQuest() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!getUserSession().isUserSignedIn()) {
            alert("Please connect your wallet first.");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const rewardRaw = formData.get("reward") as string;

        if (!title || !rewardRaw) {
            alert("Please fill all fields.");
            return;
        }

        const rewardInMicroSTX = parseInt(rewardRaw, 10) * 1000000;

        setIsLoading(true);

        try {
            await openContractCall({
                contractAddress,
                contractName: "quest-registry",
                functionName: "create-quest",
                functionArgs: [
                    stringAsciiCV(title),
                    uintCV(rewardInMicroSTX) as any, // Casts bypass version mismatches
                    uintCV(0) as any, // Reputation threshold 0
                    uintCV(1000000) as any // Far off expiry block
                ],
                network: STACKS_MAINNET as any,
                onFinish: (data) => {
                    console.log("Transaction broadcasted:", data);
                    setIsLoading(false);
                    router.push("/");
                },
                onCancel: () => {
                    console.log("Transaction cancelled.");
                    setIsLoading(false);
                }
            });
        } catch (error: any) {
            console.error(error);
            alert("Error initiating contract call: " + error.message);
            setIsLoading(false);
        }
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
                                name="title"
                                required
                                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="e.g. Analyze data set"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="reward" className="text-sm font-medium text-zinc-400">Reward (STX)</label>
                            <input
                                id="reward"
                                name="reward"
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
                                name="url"
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
