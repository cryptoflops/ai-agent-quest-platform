
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

export const contractAddress = "SP1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7M3CKVJJ";

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
