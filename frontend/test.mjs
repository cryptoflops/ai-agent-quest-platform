import { someCV, tupleCV, uintCV, stringAsciiCV, cvToValue } from "@stacks/transactions";

const mockCv = someCV(
    tupleCV({
        "description": stringAsciiCV("Hello"),
        "reward-amount": uintCV(100),
        status: uintCV(0)
    })
);

console.log(JSON.stringify(mockCv, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
console.log("---- cvToValue ----");
const val = cvToValue(mockCv);
console.log(JSON.stringify(val, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
