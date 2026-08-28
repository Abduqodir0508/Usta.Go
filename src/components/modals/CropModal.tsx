"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { XCircle, CheckCircle2 } from 'lucide-react';

interface CropModalProps {
  imageSrc: string;
  shape: 'rect' | 'round';
  aspect?: number;
  onClose: () => void;
  onCropCompleteAction: (file: File) => void;
}

export default function CropModal({ imageSrc, shape, aspect = 1, onClose, onCropCompleteAction }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedFile) {
        onCropCompleteAction(croppedFile);
      }
    } catch (e) {
      console.error(e);
      alert("Rasmni qirqishda xatolik yuz berdi!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface border border-border-color rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Rasmni to'g'rilash</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-red-500 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="relative w-full h-[300px] md:h-[400px] bg-black/50 rounded-xl overflow-hidden mb-6">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={shape}
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-400 mb-2">Yaqinlashtirish (Zoom)</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-stone-400 hover:text-white bg-[#231F1C] hover:bg-stone-800 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Qirqilmoqda..." : "Qirqish va Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
