
import { AppConfig, UserSession } from "@stacks/auth";
import { showConnect } from "@stacks/connect";

// Lazy initialization to avoid SSR issues
let userSession: UserSession | undefined;
let appConfig: AppConfig | undefined;

export function getUserSession() {
    if (!userSession) {
        appConfig = new AppConfig(["store_write", "publish_data"]);
        userSession = new UserSession({ appConfig });
    }
    return userSession;
}

import { StacksMainnet, StacksTestnet, StacksNetwork } from "@stacks/network";

export type NetworkMode = "mainnet" | "testnet";

export function getNetworkMode(): NetworkMode {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("stacks-network-mode");
        if (stored === "mainnet" || stored === "testnet") return stored;
    }
    return (process.env.NEXT_PUBLIC_NETWORK_MODE as NetworkMode) || "mainnet";
}

export function setNetworkMode(mode: NetworkMode) {
    if (typeof window !== "undefined") {
        localStorage.setItem("stacks-network-mode", mode);
        window.location.reload();
    }
}

export function getStacksNetwork(): StacksNetwork {
    return getNetworkMode() === "mainnet" ? new StacksMainnet() : new StacksTestnet();
}

export function getContractAddress(): string {
    return getNetworkMode() === "mainnet"
        ? "SP1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7M3CKVJJ"
        : "ST1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7MAMP23P";
}

export function authenticate() {
    console.log("Authenticating with Stacks...");
    const icon = typeof window !== "undefined" ? window.location.origin + "/favicon.ico" : "/favicon.ico";
    showConnect({
        appDetails: {
            name: "AI Agent Quest Platform",
            icon,
        },
        redirectTo: "/",
        onFinish: () => {
            window.location.reload();
        },
        userSession: getUserSession(),
    });
}

export function getUserData() {
    const session = getUserSession();
    try {
        if (session.isUserSignedIn()) {
            return session.loadUserData();
        }
    } catch (e) {
        console.error("Session corrupted in getUserData, signing out...", e);
        session.signUserOut();
    }
    return null;
}

export function signOut() {
    getUserSession().signUserOut("/");
}
