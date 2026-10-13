import { Geist, Instrument_Serif } from "next/font/google";

export const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
export const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-instrument-serif",
});

export const fontVariables = `${geist.variable} ${instrumentSerif.variable}`;
