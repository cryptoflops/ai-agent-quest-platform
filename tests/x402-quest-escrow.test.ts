
import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const depositor = accounts.get("wallet_1")!;
const recipient = accounts.get("wallet_2")!;

describe('x402-quest-escrow', () => {

    it('can deposit STX', () => {
        const amount = 1000;
        const questId = 1;

        const result = simnet.callPublicFn(
            "x402-quest-escrow",
            "deposit-stx",
            [
                Cl.uint(questId),
                Cl.uint(amount)
            ],
            depositor
        );

        expect(result.result).toBeOk(Cl.bool(true));

        // Check stx transfer happened (simnet tracks this implicitly, or we check balance logic if needed)
    });

    it('can release payment', () => {
        const amount = 1000;
        const questId = 1;

        // Deposit first
        simnet.callPublicFn(
            "x402-quest-escrow",
            "deposit-stx",
            [
                Cl.uint(questId),
                Cl.uint(amount)
            ],
            depositor
        );

        const result = simnet.callPublicFn(
            "x402-quest-escrow",
            "release-payment",
            [
                Cl.uint(questId),
                Cl.standardPrincipal(recipient)
            ],
            depositor
        );

        expect(result.result).toBeOk(Cl.bool(true));
    });

    it('prevents double payment', () => {
        const amount = 1000;
        const questId = 1;

        // Deposit
        simnet.callPublicFn(
            "x402-quest-escrow",
            "deposit-stx",
            [
                Cl.uint(questId),
                Cl.uint(amount)
            ],
            depositor
        );

        // First release
        simnet.callPublicFn(
            "x402-quest-escrow",
            "release-payment",
            [
                Cl.uint(questId),
                Cl.standardPrincipal(recipient)
            ],
            depositor
        );

        // Second release attempt
        const result = simnet.callPublicFn(
            "x402-quest-escrow",
            "release-payment",
            [
                Cl.uint(questId),
                Cl.standardPrincipal(recipient)
            ],
            depositor
        );

        expect(result.result).toBeErr(Cl.uint(102)); // err-unauthorized (due to assertions)
    });
});
