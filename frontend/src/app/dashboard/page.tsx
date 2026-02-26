"use client";

import { useEffect, useState } from "react";
import { getUserSession, getContractAddress, getStacksNetwork } from "@/lib/stacks";
import { callReadOnlyFunction, cvToValue, uintCV, standardPrincipalCV } from "@stacks/transactions";
import { QuestCard } from "@/components/QuestCard";
import { Lock, Wallet, Trophy, Target } from "lucide-react";

export default function Dashboard() {
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [reputation, setReputation] = useState({ score: 0, quests: 0 });
    const [myQuests, setMyQuests] = useState<any[]>([]);

    // Ensure we only render wallet logic on the client
    useEffect(() => {
        setIsClient(true);
        const session = getUserSession();
        if (session.isUserSignedIn()) {
            const userData = session.loadUserData();
            setUserAddress(userData.profile.stxAddress.mainnet);
        } else {
            setIsLoading(false);
        }
    }, []);

    // Fetch Reputation and Quests
    useEffect(() => {
        if (!userAddress) return;

        async function fetchDashboardData() {
            try {
                // 1. Fetch Reputation
                const repResult = await callReadOnlyFunction({
                    contractAddress: getContractAddress(),
                    contractName: "reputation-registry",
                    functionName: "get-reputation",
                    functionArgs: [standardPrincipalCV(userAddress!)], // Passing mapped user address
                    network: getStacksNetwork() as any,
                    senderAddress: userAddress!,
                });
                const repParsed: any = cvToValue(repResult);
                const repData = repParsed?.type === "some" ? repParsed.value : null;

                setReputation({
                    score: repData ? Number(repData['total-score'].value) : 0,
                    quests: repData ? Number(repData['total-quests'].value) : 0
                });

                // 2. Fetch All Quests and Filter by Creator
                let id = 1;
                const fetchedQuests = [];
                while (true) {
                    try {
                        const result = await callReadOnlyFunction({
                            contractAddress: getContractAddress(),
                            contractName: "quest-registry",
                            functionName: "get-quest",
                            functionArgs: [uintCV(id)],
                            network: getStacksNetwork() as any,
                            senderAddress: getContractAddress(),
                        });

                        const parsedCv: any = cvToValue(result);
                        if (parsedCv === null || parsedCv.type === "none") break;

                        const questData = parsedCv.value;

                        // Check if the current user is the creator
                        if (questData.creator.value === userAddress) {
                            const statusMap = ["OPEN", "IN_PROGRESS", "COMPLETED", "EXPIRED"];
                            const statusCode = Number(questData.status.value);

                            fetchedQuests.push({
                                id,
                                title: questData.description.value,
                                reward: Number(questData['reward-amount'].value) / 1000000,
                                reputation: Number(questData['reputation-threshold'].value),
                                status: statusMap[statusCode] || "UNKNOWN"
                            });
                        }
                        id++;
                    } catch {
                        break;
                    }
                }
                setMyQuests(fetchedQuests.reverse());
            } catch (e) {
                console.error("Error fetching dashboard data:", e);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [userAddress]);

    if (!isClient) return null; // Avoid hydration errors

    if (!userAddress) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
                <Lock className="w-16 h-16 text-zinc-600 mb-6" />
                <h2 className="text-3xl font-bold mb-2">Dashboard Locked</h2>
                <p className="text-zinc-500 mb-8text-center max-w-sm">Please connect your Stacks wallet to view your reputation and manage your created quests.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold tracking-tight mb-8">User Dashboard</h1>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <Wallet className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold mb-1">Connected Wallet</p>
                    <p className="text-lg font-mono text-zinc-300">
                        {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                        <Trophy className="w-32 h-32" />
                    </div>
                    <Trophy className="w-10 h-10 text-orange-500 mb-4" />
                    <p className="text-sm text-zinc-400 uppercase tracking-widest font-semibold mb-1">Total Score</p>
                    <p className="text-5xl font-bold text-white">
                        {isLoading ? "-" : reputation.score}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                        <Target className="w-32 h-32" />
                    </div>
                    <Target className="w-10 h-10 text-emerald-500 mb-4" />
                    <p className="text-sm text-zinc-400 uppercase tracking-widest font-semibold mb-1">Quests Completed</p>
                    <p className="text-5xl font-bold text-white">
                        {isLoading ? "-" : reputation.quests}
                    </p>
                </div>
            </div>

            {/* My Quests */}
            <section>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">My Created Quests</h2>
                        <p className="text-zinc-400">Manage the quests you have broadcasted to the network.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="text-zinc-500">Scanning blockchain for your quests...</div>
                    ) : myQuests.length === 0 ? (
                        <div className="text-zinc-500">You haven't created any quests yet.</div>
                    ) : (
                        myQuests.map((quest) => (
                            <QuestCard
                                key={quest.id}
                                id={quest.id}
                                title={quest.title}
                                reward={quest.reward}
                                reputation={quest.reputation}
                                status={quest.status}
                                onAccept={() => { }}
                            />
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
