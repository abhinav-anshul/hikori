/**
 * Wavy underline accent, drawn natively via CSS text-decoration. Always
 * fits the text exactly — no JS measurement, no font-load race, no
 * reflow/misalignment risk, unlike an overlaid hand-drawn annotation.
 */
export function SquiggleUnderline({ children }: { children: React.ReactNode }) {
    return (
        <span className="underline decoration-primary decoration-wavy decoration-2 underline-offset-4">
            {children}
        </span>
    );
}
