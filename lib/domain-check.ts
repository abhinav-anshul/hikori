import { resolveTxt } from "node:dns/promises";

const RECORD_PREFIX = "hikori-verify=";

export type DomainCheckResult =
    | { verified: true }
    | { verified: false; reason: "not_found" | "mismatch" | "lookup_error" };

// Proves domain ownership ourselves via a TXT lookup — no external
// service. The user adds `_hikori.<domain> TXT hikori-verify=<token>`
// at their DNS provider; matching that token here is what tells us
// they control the domain's DNS, not just that they typed it in.
export async function checkDomainOwnership(
    domain: string,
    token: string,
): Promise<DomainCheckResult> {
    const expected = `${RECORD_PREFIX}${token}`;

    let records: string[][];
    try {
        records = await resolveTxt(`_hikori.${domain}`);
    } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code === "ENOTFOUND" || code === "ENODATA") {
            return { verified: false, reason: "not_found" };
        }
        return { verified: false, reason: "lookup_error" };
    }

    // Each TXT record can be split across multiple quoted chunks by
    // the DNS provider — resolveTxt returns them unjoined per record.
    const found = records.some((chunks) => chunks.join("") === expected);
    return found ? { verified: true } : { verified: false, reason: "mismatch" };
}
