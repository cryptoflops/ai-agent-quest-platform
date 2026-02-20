
"use client";


import { useEffect, useState } from "react";
import { authenticate, getUserData, signOut, getUserSession } from "@/lib/stacks";
import { Button } from "./ui/button";

export function ConnectWallet() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
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
