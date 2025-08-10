import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

export default function PanelShell({ id, title, children, capClass = "max-h-60" }) {

    const [open, setOpen] = useState(false);

    // remember state per panel
    useEffect(() => {
        const saved = localStorage.getItem(`panel:${id}`);
        if (saved !== null) setOpen(saved === "1");
    }, [id]);

    useEffect(() => {
        localStorage.setItem(`panel:${id}`, open ? "1" : "0");
    }, [id, open]);

    return (
            <div className="w-full bg-white rounded-2xl overflow-hidden border shadow-md transition-all">
            {/* Toggle bar — matches Location */}
            <div
                className="flex items-center justify-between px-4 py-2 text-xl font-semibold cursor-pointer"
                onClick={() => setOpen(v => !v)}
            >
                <span>{title}</span>
                {open ? (
                <ChevronUpIcon className="w-4 h-4 text-amber-900" />
                ) : (
                <ChevronDownIcon className="w-4 h-4 text-amber-900" />
                )}
            </div>

            {/* Content */}
            {open && (
                <div className="px-4 pb-4 pt-1 text-amber-900">
                <div className={`${capClass} overflow-y-auto custom-scrollbar pr-1`}>
                    {children}
                </div>
                </div>
            )}
            </div>
    );
}
