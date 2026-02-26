
"use client";


import { useEffect, useState } from "react";
import { authenticate, getUserData, signOut, getUserSession } from "@/lib/stacks";
import { Button } from "./ui/button";

export function ConnectWallet() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        try {
            if (getUserSession().isUserSignedIn()) {
                setUser(getUserData());
            }
        } catch (e) {
            console.error("Session corrupted, signing out...", e);
            signOut();
        }
    }, []);

    if (!mounted) return <Button disabled>Loading...</Button>;


    if (user) {
        return (
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        import("@/lib/stacks").then((mod) => {
                            mod.setNetworkMode(mod.getNetworkMode() === "mainnet" ? "testnet" : "mainnet");
                        });
                    }}
                    className="text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors"
                >
                    NET: <span className={user.profile.stxAddress.mainnet ? "text-amber-500" : "text-emerald-500"}>
                        {typeof window !== 'undefined' ? (localStorage.getItem('stacks-network-mode') || 'mainnet') : 'mainnet'}
                    </span> ⇄
                </button>
                <span className="text-sm font-mono text-zinc-400">
                    {user.profile.stxAddress.mainnet.slice(0, 6)}...{user.profile.stxAddress.mainnet.slice(-4)}
                </span>
                <Button variant="outline" onClick={signOut}>
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={() => authenticate()}>
            Connect Wallet
        </Button>
    );
}
