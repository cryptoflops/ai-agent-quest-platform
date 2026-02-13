
import { AppConfig, UserSession, showConnect } from "@stacks/connect";

export const appConfig = new AppConfig(["store_write", "publish_data"]);

// Lazy initialization to avoid SSR issues
let userSession: UserSession | undefined;

export function getUserSession() {
    if (!userSession) {
        userSession = new UserSession({ appConfig });
    }
    return userSession;
}

export const contractAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export function authenticate() {
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
    if (session.isUserSignedIn()) {
        return session.loadUserData();
    }
    return null;
}

export function signOut() {
    getUserSession().signUserOut("/");
}
