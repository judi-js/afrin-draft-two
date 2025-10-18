"use client"

import { useEffect, useState } from "react";

export default function BarcodeScanner({ onScan }: { onScan: (data: string) => void }) {
  const [buffer, setBuffer] = useState("");

  function decodeAltString(input: string) {
    return input.replace(/Alt(\d+)/g, (_, num) =>
      String.fromCharCode(parseInt(num, 10))
    );

  }
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Most barcode scanners send characters quickly, ending with Enter
      if (timeout) clearTimeout(timeout);

      if (e.key === "Enter") {
        if (buffer.trim()) {
          // onScan(buffer.trim())
          onScan(decodeAltString(buffer.trim()));
          setBuffer("");
        }
      } else {
        setBuffer(prev => prev + e.key);
      }

      // Reset buffer if no key pressed for 50ms (scanner sends very fast)
      timeout = setTimeout(() => setBuffer(""), 50);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [buffer, onScan]);

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-700 mb-2">استخدم ماسح الباركود لمسح رمز الطالب</p>
      <div className="w-64 h-32 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">انتظر المسح...</span>
      </div>
    </div>
  ); 
}
