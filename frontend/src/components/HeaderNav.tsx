"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const ConnectWallet = dynamic(
    () => import("@/components/ConnectWallet").then((mod) => mod.ConnectWallet),
    { ssr: false }
);

export function HeaderNav() {
    return (
        <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-orange-500 rounded-lg"></div>
                        <h1 className="font-bold text-xl tracking-tight hidden sm:block">QuestPlatform</h1>
                    </Link>
                    <nav className="hidden md:flex gap-4">
                        <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Explore</Link>
                        <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <ConnectWallet />
                </div>
            </div>
        </header>
    );
}
