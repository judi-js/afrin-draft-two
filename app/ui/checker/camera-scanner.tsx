"use client"

import React, { useRef, useEffect, useState, SetStateAction, Dispatch } from 'react';
import jsQR from 'jsqr';

const CameraScanner: React.FC<{ onScan: (data: string) => void, setQrData: Dispatch<SetStateAction<string | null>> }> = ({ onScan, setQrData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    let animationId: number;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        scanLoop();
      } catch {
        setError('يجب منح الإذن لاستخدام الكاميرا');
      }
    };

    const scanLoop = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && !scanned) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setScanned(true);
            onScan(code.data);
          }
        }
      }
      animationId = requestAnimationFrame(scanLoop);
    };

    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationId);
    };
  }, [onScan, scanned]);


  // Hidden canvas for frame processing

  return (
    <div className='flex flex-col items-center'>
      <div style={{ position: 'relative', width: '100%', maxWidth: 400, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: 16 }} />
        {scanned && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md"
          >
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
              onClick={() => {
                setScanned(false);
                onScan('');
                setQrData(null);
              }}
            >
              إعادة المسح
            </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {error && <div className="w-full text-red-500 mt-2 font-semibold bg-red-100 rounded px-3 py-2 shadow">{error}</div>}
    </div>
  );
};

export default CameraScanner;