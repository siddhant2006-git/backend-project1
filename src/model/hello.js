import crypto from "crypto";

const text = "Hello, PyGit!";

const hash = crypto.createHash("sha256").update(text).digest("hex");

console.log(hash);
