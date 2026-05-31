"use client";

import { useEffect, useState } from "react";
import { RoughNotation } from "react-rough-notation";

/**
 * Hand-drawn squiggly underline (rough-notation) that draws itself in on
 * first paint. Reads the brand color from the --primary token at runtime so
 * nothing is hardcoded, and honors prefers-reduced-motion.
 */
export function SquiggleUnderline({
    children,
    delay = 900,
}: {
    children: React.ReactNode;
    delay?: number;
}) {
    const [show, setShow] = useState(false);
    const [color, setColor] = useState<string>();
    const [animate, setAnimate] = useState(true);

    useEffect(() => {
        const resolved = getComputedStyle(document.documentElement)
            .getPropertyValue("--primary")
            .trim();
        setColor(resolved || undefined);

        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        setAnimate(!reduced);

        const t = setTimeout(() => setShow(true), reduced ? 0 : delay);
        return () => clearTimeout(t);
    }, [delay]);

    // Wait until the token color is read so the annotation never flashes a
    // wrong/default stroke.
    if (!color) return <span>{children}</span>;

    return (
        <RoughNotation
            type="underline"
            show={show}
            color={color}
            strokeWidth={2}
            iterations={2}
            animate={animate}
            animationDuration={700}
        >
            {children}
        </RoughNotation>
    );
}
