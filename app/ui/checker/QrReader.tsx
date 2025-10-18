"use client";

import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { StudentField } from "@/app/lib/definitions";
import CameraScanner from "@/app/ui/checker/camera-scanner";
import BarcodeScanner from "@/app/ui/checker/barcode-scanner";
import ManualScanner from "@/app/ui/checker/manual-scanner";
import { FaQrcode, FaBarcode, FaUser } from "react-icons/fa";

export default function QrReader({
  onScan,
  setQrData,
  setDate,
  students,
  qrData
}: {
  onScan: (data: string) => void;
  setQrData?: Dispatch<SetStateAction<string | null>>;
  setDate?: Dispatch<SetStateAction<string | null>>;
  students: StudentField[];
  qrData?: string | null;
}) {
  const [scannerMode, setScannerMode] = useState<"qr" | "barcode" | "student">("qr");
  console.log("Current QR Data:", qrData);

  useEffect(() => {
    const savedMode = localStorage.getItem("scannerMode");
    if (savedMode) {
      setScannerMode(savedMode as "qr" | "barcode" | "student");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("scannerMode", scannerMode);
  }, [scannerMode]);

  const handleScan = (data: string) => {
    if (!data) return;
    onScan(data);
  };

  const handleStudentSelect = (id: string) => {
    if (id) {
      onScan(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="mb-4 text-xl md:text-2xl">تسجيل دخول/خروج الطلاب</h1>
        <button
          className="w-44 max-sm:w-auto transition-colors duration-200 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center sm:justify-start"
          onClick={() =>
            setScannerMode((prev) =>
              prev === "qr" ? "barcode" : prev === "barcode" ? "student" : "qr"
            )
          }
        >
          <span className="sm:hidden">
            {scannerMode === "qr" && <FaBarcode />}
            {scannerMode === "barcode" && <FaUser />}
            {scannerMode === "student" && <FaQrcode />}
          </span>
          <span className="hidden sm:inline">
            التبديل إلى {scannerMode === "qr" ? "ماسح الباركود" : scannerMode === "barcode" ? "اختيار الطالب" : "ماسح QR"}
          </span>
        </button>
      </div>

      {scannerMode === "qr" && (
        <CameraScanner onScan={handleScan} setQrData={setQrData || (() => {})} />
      )}
      {scannerMode === "barcode" && <BarcodeScanner onScan={handleScan} />}
      {scannerMode === "student" && (
        <ManualScanner onSelect={handleStudentSelect} setDate={setDate} students={students} />
      )}
    </div>
  );
}
