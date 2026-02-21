import { stringAsciiCV, uintCV, serializeCV } from "@stacks/transactions";

try {
    const title = "test quest";
    const rewardInMicroSTX = 1000000;

    const args = [
        stringAsciiCV(title),
        uintCV(rewardInMicroSTX),
        uintCV(0),
        uintCV(1000000)
    ];

    console.log("Args:", JSON.stringify(args, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

    for (let i = 0; i < args.length; i++) {
        try {
            const hex = serializeCV(args[i]);
            console.log(`Arg ${i} serialized safely`);
        } catch (e) {
            console.error(`Arg ${i}FAILED serialization:`, e.message);
        }
    }
} catch (e) {
    console.error("Setup error:", e.message);
}
