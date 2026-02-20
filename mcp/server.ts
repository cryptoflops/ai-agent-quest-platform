
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { paymentMiddleware } from "x402-stacks";

dotenv.config();
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    contractPrincipalCV,
    uintCV,
    stringAsciiCV,
    bufferCV,
    Pc,
    fetchCallReadOnlyFunction,
    cvToValue,
    UnsignedTokenTransferOptions,
    UnsignedContractCallOptions
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";

// Configuration
const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const QUEST_REGISTRY = "quest-registry";
const REPUTATION_REGISTRY = "reputation-registry";

// Mock sender key for demo purposes - in production this would be loaded securely
// This is the private key for ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM (deployer in Clarinet)
const SENDER_KEY = "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601";

// Define Tools
const SCAN_QUESTS_TOOL: Tool = {
    name: "scan_quests",
    description: "Fetch active quests filtering by reward and reputation. (Mocked for demo)",
    inputSchema: {
        type: "object",
        properties: {
            min_reward: { type: "number" },
            max_reputation_required: { type: "number" }
        }
    }
};

const ACCEPT_QUEST_TOOL: Tool = {
    name: "accept_quest",
    description: "Accept and lock a quest to this agent",
    inputSchema: {
        type: "object",
        properties: {
            quest_id: { type: "number" }
        },
        required: ["quest_id"]
    }
};

const SUBMIT_PROOF_TOOL: Tool = {
    name: "submit_proof",
    description: "Submit proof-of-completion for quest",
    inputSchema: {
        type: "object",
        properties: {
            quest_id: { type: "number" },
            proof_hash: { type: "string", description: "32-byte hex string (64 chars) without 0x prefix" }
        },
        required: ["quest_id", "proof_hash"]
    }
};

const CHECK_REPUTATION_TOOL: Tool = {
    name: "check_reputation",
    description: "Get current agent reputation and stats",
    inputSchema: {
        type: "object",
        properties: {
            agent_address: { type: "string" }
        },
        required: ["agent_address"]
    }
};

// Server Implementation
const server = new Server(
    {
        name: "stacks-quest-platform",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            SCAN_QUESTS_TOOL,
            ACCEPT_QUEST_TOOL,
            SUBMIT_PROOF_TOOL,
            CHECK_REPUTATION_TOOL
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "scan_quests") {
            // In a real implementation, this would query a Stacks API or indexer.
            // Returning mocked data for Phase 5 demo.
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify([
                        { id: 1, description: "Analyze data", reward: 1000, reputation_required: 0 },
                        { id: 2, description: "Train model", reward: 5000, reputation_required: 10 }
                    ])
                }]
            };
        }

        if (name === "accept_quest") {
            const questId = Number(args?.quest_id);

            const txOptions = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: QUEST_REGISTRY,
                functionName: "accept-quest",
                functionArgs: [uintCV(questId)],
                senderKey: SENDER_KEY,
                validateWithAbi: false, // skipping ABI check for simplicity in this demo
                network: NETWORK,
                anchorMode: AnchorMode.Any,
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction({ transaction });

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(broadcastResponse)
                }]
            };
        }

        if (name === "submit_proof") {
            const questId = Number(args?.quest_id);
            const proofHash = String(args?.proof_hash);

            const txOptions = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: QUEST_REGISTRY,
                functionName: "submit-proof",
                functionArgs: [
                    uintCV(questId),
                    bufferCV(Buffer.from(proofHash, 'hex'))
                ],
                senderKey: SENDER_KEY,
                validateWithAbi: false,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction({ transaction });

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(broadcastResponse)
                }]
            };
        }

        if (name === "check_reputation") {
            const agentAddress = String(args?.agent_address);

            // Use fetchCallReadOnlyFunction correctly
            const result = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: REPUTATION_REGISTRY,
                functionName: "get-reputation",
                functionArgs: [contractPrincipalCV(agentAddress, "agent")], // Assuming principal is passed
                senderAddress: agentAddress,
                network: NETWORK
            });

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(cvToValue(result))
                }]
            };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error: any) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

// Start server
const app = express();
app.use(cors({
    exposedHeaders: ['payment-required', 'payment-signature', 'payment-response']
}));
app.use(express.json());

// Protect the MCP routes with x402-stacks middleware
const x402Middleware = paymentMiddleware({
    payTo: process.env.CREATOR_WALLET_ADDRESS || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    amount: "1000", // 1000 microSTX (0.001 STX) per request
    network: "testnet",
    facilitatorUrl: "https://facilitator.stacksx402.com"
});

// Apply payment middleware to the MCP endpoints
app.use("/sse", x402Middleware);
app.use("/messages", x402Middleware);

let transport: SSEServerTransport | null = null;

app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(503).send("Server not ready");
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`MCP server running on port ${PORT}`);
    console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`Protected by x402-stacks payment middleware`);
});
