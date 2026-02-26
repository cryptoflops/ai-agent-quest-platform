
"use client";

import { QuestCard } from "@/components/QuestCard";
import { AgentPlayground } from "@/components/AgentPlayground";
import { useState, useEffect } from "react";
import { callReadOnlyFunction, cvToValue, uintCV, cvToHex } from "@stacks/transactions";
import { getContractAddress, getStacksNetwork, getUserSession } from "@/lib/stacks";
import { openContractCall } from "@stacks/connect";

export default function Home() {
  const [quests, setQuests] = useState<any[]>([]);
  const [pendingQuests, setPendingQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPending = JSON.parse(localStorage.getItem('pendingQuests') || '[]');
      // Automatically clean up quests older than 2 hours just in case
      const validPending = storedPending.filter((q: any) => Date.now() - q.createdAt < 2 * 60 * 60 * 1000);
      setPendingQuests(validPending);
      localStorage.setItem('pendingQuests', JSON.stringify(validPending));
    } catch (e) {
      console.error("Error reading pending quests", e);
    }

    async function fetchQuests() {
      try {
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
            if (parsedCv === null || parsedCv.type === "none") {
              break; // Hit the end of the quests
            }

            const questData = parsedCv.value;

            // Map Clarity statuses to strings
            const statusMap = ["OPEN", "IN_PROGRESS", "COMPLETED", "EXPIRED"];
            const statusCode = Number(questData.status.value);

            fetchedQuests.push({
              id: id,
              title: questData.description.value,
              reward: Number(questData['reward-amount'].value) / 1000000,
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
        contractAddress: getContractAddress(),
        contractName: "quest-registry",
        functionName: "accept-quest",
        functionArgs: [cvToHex(uintCV(id))],
        network: getStacksNetwork() as any,
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
    <div className="selection:bg-purple-500 selection:text-white">
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
            ) : quests.length === 0 && pendingQuests.length === 0 ? (
              <div className="text-zinc-500">No active quests found.</div>
            ) : (
              <>
                {pendingQuests.map((quest) => (
                  <QuestCard
                    key={`pending-${quest.id}`}
                    id={quest.txId ? quest.txId.slice(0, 6) : quest.id}
                    title={quest.title}
                    reward={quest.reward}
                    reputation={quest.reputation}
                    status={quest.status}
                    onAccept={() => window.open(`https://explorer.hiro.so/txid/${quest.txId}?chain=mainnet`, "_blank")}
                  />
                ))}
                {quests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    id={quest.id}
                    title={quest.title}
                    reward={quest.reward}
                    reputation={quest.reputation}
                    status={quest.status}
                    onAccept={() => handleAccept(quest.id)}
                  />
                ))}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
