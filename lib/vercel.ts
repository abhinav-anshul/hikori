import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
    bearerToken: process.env.VERCEL_TOKEN,
});

const PROJECT_ID = process.env.VERCEL_PROJECT_ID!;

// Registers a domain with the Vercel project so its edge network
// starts routing to us and provisioning an SSL certificate for it.
// Call only after our own DNS check (lib/domain-check.ts) has
// already proven the caller owns the domain — this step doesn't
// re-check that, it just makes Vercel aware the domain exists.
// Throws (VercelError) if the domain is already attached elsewhere
// or the request is rate-limited — the caller decides how to
// surface that, this doesn't swallow it.
export async function attachDomain(domain: string) {
    return vercel.projects.addProjectDomain({
        idOrName: PROJECT_ID,
        requestBody: { name: domain },
    });
}

// Detaches a domain from the project and deletes it from the Vercel
// account entirely, so it doesn't linger as an orphaned entry (and
// can be cleanly re-added later, by the same or a different user).
export async function removeDomain(domain: string) {
    await vercel.projects.removeProjectDomain({
        idOrName: PROJECT_ID,
        domain,
    });
    await vercel.domains.deleteDomain({ domain });
}
