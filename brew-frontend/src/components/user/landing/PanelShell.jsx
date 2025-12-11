import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

export default function PanelShell({ id, title, children, capClass = "max-h-56", summary }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(`panel:${id}`);
    if (saved !== null) setOpen(saved === "1");
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`panel:${id}`, open ? "1" : "0");
  }, [id, open]);

  return (
    <div className="w-full bg-[#f2f2f2] shadow-md border border-[#d7d7d7]">
      
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 py-3 
                   bg-[#445A7D] text-white font-semibold cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        <span className="tracking-[0.12em] uppercase">{title}</span>
        {open ? (
          <ChevronUpIcon className="w-5 h-5 text-white" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Summary Chips */}
      {Array.isArray(summary) && (
        <div className="ml-3 flex items-center gap-2 overflow-x-auto  max-w-[100%] mt-2 mb-2">
          {summary.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs 
                         border border-[#8A5A3C] bg-white text-[#8A5A3C] 
                         whitespace-nowrap"
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </span>
          ))}
        </div>
      )}

      {/* CONTENT */}
      {open && (
        <div className="px-4 pb-4 pt-2 text-[#8A5A3C] font-medium">
          <div className={`${capClass} overflow-y-auto no-scrollbar pr-1`}>
            
            {/* Override checkboxes inside children */}
            <div >
              {children}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
