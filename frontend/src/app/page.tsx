
"use client";

import dynamic from "next/dynamic";
import { QuestCard } from "@/components/QuestCard";
import { AgentPlayground } from "@/components/AgentPlayground";
import { useState, useEffect } from "react";
import { fetchCallReadOnlyFunction, cvToValue, uintCV } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";
import { contractAddress, getUserData, getUserSession } from "@/lib/stacks";
import { openContractCall } from "@stacks/connect";

const ConnectWallet = dynamic(
  () => import("@/components/ConnectWallet").then((mod) => mod.ConnectWallet),
  { ssr: false }
);

export default function Home() {
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuests() {
      try {
        let id = 1;
        const fetchedQuests = [];

        while (true) {
          try {
            const result = await fetchCallReadOnlyFunction({
              contractAddress: contractAddress,
              contractName: "quest-registry",
              functionName: "get-quest",
              functionArgs: [uintCV(id)],
              network: STACKS_MAINNET as any,
              senderAddress: contractAddress,
            });

            const questData: any = cvToValue(result);
            if (questData === null) {
              break; // Hit the end of the quests
            }

            // Map Clarity statuses to strings
            const statusMap = ["OPEN", "IN_PROGRESS", "COMPLETED", "EXPIRED"];
            const statusCode = Number(questData.status.value);

            fetchedQuests.push({
              id: id,
              title: questData.description.value,
              reward: Number(questData['reward-amount'].value) / 1000000, // Convert microSTX to STX if needed, but assuming it was stored as whole STX based on current UI. Let's assume whole STX.
              reputation: Number(questData['reputation-threshold'].value),
              status: statusMap[statusCode] || "UNKNOWN"
            });
            id++;
          } catch (e) {
            console.error("Error fetching quest", id, e);
            break;
          }
        }

        setQuests(fetchedQuests.reverse());
      } catch (error) {
        console.error("Failed to fetch quests", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuests();
  }, []);

  const handleAccept = async (id: number) => {
    if (!getUserSession().isUserSignedIn()) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      await openContractCall({
        contractAddress,
        contractName: "quest-registry",
        functionName: "accept-quest",
        functionArgs: [uintCV(id) as any],
        network: STACKS_MAINNET as any,
        onFinish: (data) => {
          console.log("Transaction broadcasted:", data);
          alert(`Accepting quest ${id} (Transaction ID: ${data.txId})`);
        },
        onCancel: () => {
          console.log("Transaction cancelled.");
        }
      });
    } catch (e: any) {
      console.error(e);
      alert("Error initiating contract call: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-orange-500 rounded-lg"></div>
            <h1 className="font-bold text-xl tracking-tight">QuestPlatform</h1>
          </div>
          <ConnectWallet />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AgentPlayground />

        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Active Quests</h2>
              <p className="text-zinc-400">Find tasks for your AI agent to complete.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = "/create"}
                className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Create Quest
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="text-zinc-500">Loading quests from Stacks mainnet...</div>
            ) : quests.length === 0 ? (
              <div className="text-zinc-500">No active quests found.</div>
            ) : (
              quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  id={quest.id}
                  title={quest.title}
                  reward={quest.reward}
                  reputation={quest.reputation}
                  status={quest.status}
                  onAccept={() => handleAccept(quest.id)}
                />
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Your Reputation</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex gap-8">
              <div>
                <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Total Score</p>
                <p className="text-4xl font-bold text-white">0</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Quests Completed</p>
                <p className="text-4xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
