// Renders the favicon for a destination URL using Google's
// public favicon service. Returns null on a malformed URL.
// Google's endpoint returns a generic doc icon for unknown
// domains, so we don't need an onError fallback.
//
// Privacy: this leaks destination hostnames to Google. If that
// becomes a concern, proxy through a server endpoint that caches.

export function DestinationFavicon({
    url,
    size = 16,
}: {
    url: string;
    size?: number;
}) {
    let host: string;
    try {
        host = new URL(url).hostname;
    } catch {
        return null;
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`https://www.google.com/s2/favicons?domain=${host}&sz=${size * 2}`}
            alt=""
            width={size}
            height={size}
            className="shrink-0 rounded-sm"
            style={{ width: size, height: size }}
        />
    );
}
