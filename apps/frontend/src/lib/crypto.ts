export async function sha256(str: string) {
    // encode as UTF-8
    const data = new TextEncoder().encode(str);
    // hash the data
    const hash = await crypto.subtle.digest("SHA-256", data);
    // convert buffer to byte array, then to hex string
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
