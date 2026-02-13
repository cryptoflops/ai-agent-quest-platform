
import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const agent = accounts.get("wallet_1")!;
const creator = accounts.get("wallet_2")!;

describe('reputation-registry', () => {

    it('can add reputation', () => {
        const score = 5;
        const questId = 1;

        const result = simnet.callPublicFn(
            "reputation-registry",
            "add-reputation",
            [
                Cl.standardPrincipal(agent),
                Cl.uint(questId),
                Cl.uint(score)
            ],
            creator
        );

        expect(result.result).toBeOk(Cl.bool(true));
    });

    it('validates score range', () => {
        const invalidScore = 6;
        const questId = 1;

        const result = simnet.callPublicFn(
            "reputation-registry",
            "add-reputation",
            [
                Cl.standardPrincipal(agent),
                Cl.uint(questId),
                Cl.uint(invalidScore)
            ],
            creator
        );

        expect(result.result).toBeErr(Cl.uint(102)); // err-invalid-score
    });

    it('updates total score correctly', () => {
        // Add first score
        simnet.callPublicFn(
            "reputation-registry",
            "add-reputation",
            [
                Cl.standardPrincipal(agent),
                Cl.uint(1),
                Cl.uint(5)
            ],
            creator
        );

        // Add second score
        simnet.callPublicFn(
            "reputation-registry",
            "add-reputation",
            [
                Cl.standardPrincipal(agent),
                Cl.uint(2),
                Cl.uint(4)
            ],
            creator
        );

        const reputation = simnet.callReadOnlyFn(
            "reputation-registry",
            "get-reputation",
            [Cl.standardPrincipal(agent)],
            deployer
        );

        expect(reputation.result).toBeTuple({
            "total-score": Cl.uint(9),
            "total-quests": Cl.uint(2),
            "last-updated": Cl.uint(3) // block height
        });
    });
});
