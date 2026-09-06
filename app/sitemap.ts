import type { MetadataRoute } from "next";

import { getBaseUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = getBaseUrl();

    return [
        {
            url: baseUrl,
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
