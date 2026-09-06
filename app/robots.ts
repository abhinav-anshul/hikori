import type { MetadataRoute } from "next";

import { getBaseUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getBaseUrl();

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/dashboard", "/login", "/signup"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
