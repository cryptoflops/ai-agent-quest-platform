
"use client";

import dynamic from "next/dynamic";
import { QuestCard } from "@/components/QuestCard";
import { useState } from "react";

const ConnectWallet = dynamic(
  () => import("@/components/ConnectWallet").then((mod) => mod.ConnectWallet),
  { ssr: false }
);

// Mock data for initial UI
const MOCK_QUESTS = [
  { id: 1, title: "Analyze Market Data", reward: 100, reputation: 0, status: "OPEN" },
  { id: 2, title: "Train Image Model", reward: 500, reputation: 10, status: "OPEN" },
  { id: 3, title: "Validate Translation", reward: 50, reputation: 5, status: "IN_PROGRESS" },
];

export default function Home() {
  const [quests, setQuests] = useState(MOCK_QUESTS);

  const handleAccept = (id: number) => {
    alert(`Accepting quest ${id} (Integration pending)`);
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
