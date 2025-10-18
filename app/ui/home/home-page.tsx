'use client'

import { useState } from "react";
import LoginForm from "@/app/ui/home/login";
import QrScanner from "@/app/ui/checker/camera-scanner";

export default function HomePage() {
  const [qrData, setQrData] = useState<string | null>(null);

  return (
    <div className="bg-[url(/afrin.jpg)] bg-cover">
      <div className="font-sans flex flex-col items-center justify-center min-h-screen bg-black/70 text-white p-8 sm:p-20">
        <h1 className="text-4xl font-bold mb-4">معهد عفرين يرحب بك</h1>
        {/* <p className="text-lg mb-8 text-center max-w-2xl">
          اكتشف دوراتنا ومواردنا التعليمية لتحسين مهاراتك ومعرفتك.
        </p> */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="font-sans grid items-center justify-items-center gap-4">
            <QrScanner onScan={(data) => { if (!data) return; setQrData(data); }} setQrData={setQrData || (() => { })} />
          </div>
          {qrData && <LoginForm id={qrData} />}
          <div className="text-center mt-4 text-gray-700">قم بمسح رمز QR للبدء</div>
        </div>
      </div>
    </div>
  )
}

