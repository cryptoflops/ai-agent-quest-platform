
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
    try {
        const module = await import("@stacks/connect");
        console.log("Stacks Connect Module:", module);
        const showConnect = module.showConnect || (module as any).default?.showConnect;

        if (!showConnect) {
            console.error("showConnect function not found in module", module);
            alert("Failed to load wallet connection library. See console for details.");
            return;
        }

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
    } catch (error) {
        console.error("Error loading @stacks/connect:", error);
        alert("Error loading wallet connection. Please check console.");
    }
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
