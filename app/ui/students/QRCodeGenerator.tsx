"use client"

import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

type QRProps = {
  value: string;
  title?: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  colorPresets?: { bgColor: string; fgColor: string }[];
};

export default function QRCodeGenerator({
  value,
  title,
  size = 128,
  level = "L",
  colorPresets = [
    { bgColor: "#F3F4F6", fgColor: "#1F2937" },
    { bgColor: "#1E3A8A", fgColor: "#FBBF24" },
    { bgColor: "#10B981", fgColor: "#FFFFFF" },
    { bgColor: "#F43F5E", fgColor: "#F9FAFB" },
    { bgColor: "#3B82F6", fgColor: "#E5E7EB" },
  ],
}: QRProps) {
  const [colorIndex, setColorIndex] = useState<number>(0);
  const qrCodeRef = useRef<HTMLDivElement | null>(null);
  const hiddenQrRef = useRef<HTMLDivElement | null>(null);

  const handleQrCodeClick = () => {
    setColorIndex((prevIndex) => (prevIndex + 1) % colorPresets.length);
  };

  const handleDownloadQrCode = () => {
    if (!hiddenQrRef.current) return;

    const svgElement = hiddenQrRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 512, 512);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${title || "qr-code"}.png`;
            link.click();
          }
        }, "image/png");
      }
    };
    img.src = url;
  };


  return (
    <div className="flex flex-col items-center">
      {/* Visible QR Code */}
      <div
        ref={qrCodeRef}
        onClick={handleQrCodeClick}
        className="cursor-pointer"
      >
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          bgColor={colorPresets[colorIndex].bgColor}
          fgColor={colorPresets[colorIndex].fgColor}
        />
      </div>

      {/* Hidden High-Res QR Code for Export */}
      <div
        ref={hiddenQrRef}
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <QRCodeSVG
          value={value}
          size={512}
          level={level}
          bgColor={colorPresets[colorIndex].bgColor}
          fgColor={colorPresets[colorIndex].fgColor}
        />
      </div>

      <button
        onClick={handleDownloadQrCode}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
      >
        Download as PNG
      </button>
    </div>
  );
}
