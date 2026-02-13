
import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const agent1 = accounts.get("wallet_1")!;

describe('agent-identity-registry', () => {

    it('can register a new agent', () => {
        const bitcoinAddress = "0x0000000000000000000000000000000000000000"; // Mock 20 bytes
        const endpoint = "https://agent.example.com";

        const result = simnet.callPublicFn(
            "agent-identity-registry",
            "register-agent",
            [
                Cl.bufferFromHex(bitcoinAddress.replace("0x", "")),
                Cl.stringAscii(endpoint)
            ],
            agent1
        );

        expect(result.result).toBeOk(Cl.uint(1));
    });

    it('prevents duplicate registration', () => {
        const bitcoinAddress = "0x0000000000000000000000000000000000000000";
        const endpoint = "https://agent.example.com";

        // First registration
        simnet.callPublicFn(
            "agent-identity-registry",
            "register-agent",
            [
                Cl.bufferFromHex(bitcoinAddress.replace("0x", "")),
                Cl.stringAscii(endpoint)
            ],
            agent1
        );

        // Second registration attempt
        const result = simnet.callPublicFn(
            "agent-identity-registry",
            "register-agent",
            [
                Cl.bufferFromHex(bitcoinAddress.replace("0x", "")),
                Cl.stringAscii(endpoint)
            ],
            agent1
        );

        expect(result.result).toBeErr(Cl.uint(102)); // err-agent-exists
    });

    it('can update endpoint', () => {
        // Prepare agent
        const bitcoinAddress = "0x0000000000000000000000000000000000000000";
        const endpoint = "https://agent.example.com";
        simnet.callPublicFn(
            "agent-identity-registry",
            "register-agent",
            [
                Cl.bufferFromHex(bitcoinAddress.replace("0x", "")),
                Cl.stringAscii(endpoint)
            ],
            agent1
        );

        const newEndpoint = "https://new.agent.com";
        const result = simnet.callPublicFn(
            "agent-identity-registry",
            "update-endpoint",
            [Cl.stringAscii(newEndpoint)],
            agent1
        );

        expect(result.result).toBeOk(Cl.bool(true));

        // Verify update
        const info = simnet.callReadOnlyFn(
            "agent-identity-registry",
            "get-agent-info",
            [Cl.uint(1)],
            deployer
        );

        // Check if the endpoint matches. 
        // Note: The return structure of get-agent-info is (some (tuple ...))
        // We need to carefully inspect the result in a real scenario, but for now checking it's Ok is a start.
        expect(info.result).toBeSome(
            Cl.tuple({
                "bitcoin-address": Cl.bufferFromHex(bitcoinAddress.replace("0x", "")),
                "registered-at": Cl.uint(2), // Verified via test run
                "endpoint": Cl.stringAscii(newEndpoint),
                "active": Cl.bool(true)
            })
        );
    });
});
