
import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const creator = accounts.get("wallet_1")!;
const agent = accounts.get("wallet_2")!;

describe('quest-registry', () => {

    it('can create a quest', () => {
        const description = "Analyze data";
        const reward = 1000;
        const reputation = 10;
        const expiry = 100;

        const result = simnet.callPublicFn(
            "quest-registry",
            "create-quest",
            [
                Cl.stringAscii(description),
                Cl.uint(reward),
                Cl.uint(reputation),
                Cl.uint(expiry)
            ],
            creator
        );

        expect(result.result).toBeOk(Cl.uint(1));
    });

    it('can accept a quest', () => {
        // Create quest first
        simnet.callPublicFn(
            "quest-registry",
            "create-quest",
            [
                Cl.stringAscii("Task 1"),
                Cl.uint(100),
                Cl.uint(0),
                Cl.uint(1000)
            ],
            creator
        );

        const result = simnet.callPublicFn(
            "quest-registry",
            "accept-quest",
            [Cl.uint(1)],
            agent
        );

        expect(result.result).toBeOk(Cl.bool(true));
    });

    it('can complete a quest', () => {
        // Create and accept
        simnet.callPublicFn(
            "quest-registry",
            "create-quest",
            [
                Cl.stringAscii("Task 2"),
                Cl.uint(100),
                Cl.uint(0),
                Cl.uint(1000)
            ],
            creator
        );

        simnet.callPublicFn(
            "quest-registry",
            "accept-quest",
            [Cl.uint(1)],
            agent
        );

        const proof = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const result = simnet.callPublicFn(
            "quest-registry",
            "submit-proof",
            [
                Cl.uint(1),
                Cl.bufferFromHex(proof.replace("0x", ""))
            ],
            agent
        );

        expect(result.result).toBeOk(Cl.bool(true));

        // Verify status
        const quest = simnet.callReadOnlyFn(
            "quest-registry",
            "get-quest",
            [Cl.uint(1)],
            creator
        );

        // Check that the result is Some and verify status field

        // Check that the result is Some
        const expected = Cl.tuple({
            "assigned-agent": Cl.some(Cl.standardPrincipal(agent)),
            "completed-at": Cl.some(Cl.uint(4)),
            "creator": Cl.standardPrincipal(creator),
            "description": Cl.stringAscii("Task 2"),
            "expiry-block": Cl.uint(1000),
            "reputation-threshold": Cl.uint(0),
            "reward-amount": Cl.uint(100),
            "status": Cl.uint(2)
        });

        expect(quest.result).toBeSome(expected);
    });
});
