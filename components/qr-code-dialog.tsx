"use client";

import { Download, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const QR_SIZE = 320;

export function QrCodeDialog({
    slug,
    children,
}: {
    slug: string;
    children: React.ReactElement;
}) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [dataUrl, setDataUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const fullUrl = `${window.location.origin}/${slug}`;
        setUrl(fullUrl);
        setDataUrl(null);

        QRCode.toDataURL(fullUrl, {
            width: QR_SIZE,
            margin: 1,
            color: { dark: "#000000", light: "#FFFFFF" },
        })
            .then(setDataUrl)
            .catch(() => setDataUrl(null));
    }, [open, slug]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={children} />
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>QR code</DialogTitle>
                    <DialogDescription className="truncate">
                        {url || `/${slug}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-center rounded-lg border border-border bg-card p-6">
                    {dataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={dataUrl}
                            alt={`QR code for ${url}`}
                            width={QR_SIZE}
                            height={QR_SIZE}
                            className="size-64"
                        />
                    ) : (
                        <div className="flex size-64 items-center justify-center text-muted-foreground">
                            <Loader2 className="size-5 animate-spin" />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        disabled={!dataUrl}
                        className="font-normal"
                        render={
                            <a
                                href={dataUrl ?? "#"}
                                download={`${slug}.png`}
                            />
                        }
                    >
                        <Download className="size-4" />
                        Download PNG
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
