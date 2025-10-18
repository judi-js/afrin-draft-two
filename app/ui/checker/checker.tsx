"use client"

import React, { useEffect, useState } from 'react';
import QrReader from '@/app/ui/checker/QrReader'; // Adjust the import path if necessary
import { CheckButton } from '@/app/ui/kits/buttons';
import { StudentField } from '@/app/lib/definitions';
import { useRouter } from 'next/navigation';

export default function Checker({ students }: { students: StudentField[] }) {
  const [qrData, setQrData] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router])

  const handleScan = async (data: string) => {
    if (data) {
      setQrData(data);
    }
  };

  return (
    // <div className="min-h-[70vh] max-sm:min-h-[40vh]">
    <div>
      <QrReader qrData={qrData} onScan={handleScan} setQrData={setQrData} students={students} setDate={setDate} />
      {qrData && <p className="text-gray-700 flex items-center my-1 justify-center"><span className="font-semibold">{students.find(x => x.id === qrData)?.first_name || 'Unknown'} {students.find(x => x.id === qrData)?.last_name || 'Unknown'}</span></p>}
      {qrData && <CheckButton id={qrData || ''} date={date} />}
    </div>
  );
}