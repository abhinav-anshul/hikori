// 8 preset tag colors. The DB stores the key as text; the UI
// maps each to a bg + text Tailwind class pair. Picked to be
// readable on the white card surface AND in dark mode.

export const TAG_COLORS = [
    "gray",
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export function isTagColor(value: string): value is TagColor {
    return (TAG_COLORS as readonly string[]).includes(value);
}

const COLOR_CLASSES: Record<TagColor, string> = {
    gray:   "bg-gray-200   text-gray-900   dark:bg-gray-700/60   dark:text-gray-100",
    red:    "bg-red-100    text-red-900    dark:bg-red-900/40    dark:text-red-100",
    orange: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100",
    yellow: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100",
    green:  "bg-green-100  text-green-900  dark:bg-green-900/40  dark:text-green-100",
    blue:   "bg-blue-100   text-blue-900   dark:bg-blue-900/40   dark:text-blue-100",
    purple: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100",
    pink:   "bg-pink-100   text-pink-900   dark:bg-pink-900/40   dark:text-pink-100",
};

export function tagColorClass(color: string): string {
    return COLOR_CLASSES[(isTagColor(color) ? color : "gray")];
}

// Bolder bg-only class for tiny dot indicators (filter trigger, etc).
const DOT_CLASSES: Record<TagColor, string> = {
    gray:   "bg-gray-400",
    red:    "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    green:  "bg-green-500",
    blue:   "bg-blue-500",
    purple: "bg-purple-500",
    pink:   "bg-pink-500",
};

export function tagDotClass(color: string): string {
    return DOT_CLASSES[(isTagColor(color) ? color : "gray")];
}

// Picks a stable color for a brand-new tag so the user gets visual
// variety without having to choose. Uses the name's char codes so
// the same name always lands on the same color.
export function pickColorFor(name: string): TagColor {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]!;
}
