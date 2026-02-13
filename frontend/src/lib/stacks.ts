
import { AppConfig, UserSession } from "@stacks/connect";

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

export async function authenticate() {
    console.log("Authenticating with Stacks...");
    const { showConnect } = await import("@stacks/connect");
    console.log("Loaded showConnect:", showConnect);

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
