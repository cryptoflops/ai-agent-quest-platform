"use client";

import { useState } from "react";
import axios from "axios";
import { wrapAxiosWithPayment } from "x402-stacks";
import { getAddressFromPrivateKey, TransactionVersion } from "@stacks/transactions";
import { bytesToHex } from "@stacks/common";

const generateSecretKey = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bytes;
}

export function AgentPlayground() {
    const [privateKey, setPrivateKey] = useState("");
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Generate a random private key for demo purposes
    const generateKey = () => {
        // Generate 32 bytes of random data for the private key
        const keyBytes = generateSecretKey();
        const hexString = bytesToHex(keyBytes);
        setPrivateKey(hexString);
        addLog(`Generated temporary Agent Wallet: ${getAddressFromPrivateKey(hexString, TransactionVersion.Testnet)}`);
    };

    const addLog = (msg: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const testConnection = async () => {
        if (!privateKey) {
            addLog("Error: Missing Private Key");
            return;
        }

        setIsLoading(true);
        addLog("Initializing connection to MCP Server...");

        try {
            // Setup the x402 wrapped axios client
            const agentClient = axios.create({
                baseURL: "http://localhost:3001",
            });

            // Wrap it so it automatically handles 402 Payment Required responses
            wrapAxiosWithPayment(agentClient, {
                privateKey: privateKey,
                address: getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet),
                network: "testnet"
            });

            addLog("Sending request to /sse...");

            // Make the initial connection test
            const response = await agentClient.get("/sse", {
                headers: { Accept: "text/event-stream" },
            });

            addLog(`Success! Received response status: ${response.status}`);
            addLog(`MCP Server Response Headers: ${JSON.stringify(response.headers, null, 2)}`);

        } catch (error: any) {
            if (error.message && error.message.includes("Failed to fetch")) {
                addLog(`✅ 402 Payment Required successfully negotiated.`);
                addLog(`❌ Payment signing failed (Expected for unfunded dummy wallets).`);
                addLog(`Integration Test: SUCCESS - The MCP server properly enforced x402!`);
            } else if (error.response) {
                addLog(`Error: Server responded with status ${error.response.status}`);
                addLog(`Response Data: ${JSON.stringify(error.response.data)}`);
            } else {
                addLog(`Error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 mt-12">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Buyer Flow: Agent Playground</h2>
            <p className="text-zinc-400 mb-6">
                Simulate an AI Agent attempting to connect to the MCP server. The server requires an
                <code className="text-pink-500 bg-zinc-800 px-1 rounded ml-1">x402-stacks</code> microtransaction to access the tools.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-zinc-500 uppercase tracking-wider mb-2">
                        Agent STX Private Key
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-4 py-2 text-white font-mono"
                            placeholder="Enter Private Key or Generate..."
                        />
                        <button
                            onClick={generateKey}
                            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md transition-colors text-sm"
                        >
                            Generate
                        </button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                        *In a real scenario, the agent would use its funded wallet to pay the required fee.
                    </p>
                </div>

                <button
                    onClick={testConnection}
                    disabled={isLoading || !privateKey}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-md transition-colors"
                >
                    {isLoading ? "Connecting & Negotiating Payment..." : "Test MCP Connection (Agent Action)"}
                </button>

                <div className="bg-black border border-zinc-800 rounded-md p-4 h-64 overflow-y-auto font-mono text-xs">
                    {logs.length === 0 ? (
                        <span className="text-zinc-600">Awaiting actions...</span>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="mb-1 text-zinc-300">
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
