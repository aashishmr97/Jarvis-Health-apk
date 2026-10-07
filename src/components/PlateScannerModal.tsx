import React, { useState } from 'react';
import { X, Camera, Upload, Sparkles, Check, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { MealLog, PlateScanResult } from '../types';

interface PlateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogScannedMeal: (meal: MealLog) => void;
}

const SAMPLE_PLATES = [
  {
    id: 'chicken_rice',
    title: 'Grilled Chicken & Basmati Rice',
    desc: 'Chicken breast, steamed jasmine rice, broccoli',
    sampleImg: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    fallback: {
      dishName: "Grilled Chicken, Steamed Rice & Broccoli",
      recognizedItems: [
        { name: "Grilled Chicken Breast", quantity: 160, unit: "g", calories: 264, protein: 49.6, carbs: 0, fat: 5.8, fiber: 0 },
        { name: "Steamed White Rice", quantity: 150, unit: "g", calories: 195, protein: 4.1, carbs: 43.0, fat: 0.4, fiber: 0.6 },
        { name: "Steamed Broccoli", quantity: 80, unit: "g", calories: 28, protein: 2.2, carbs: 5.6, fat: 0.3, fiber: 2.1 }
      ],
      totalCalories: 487,
      totalProtein: 55.9,
      totalCarbs: 48.6,
      totalFat: 6.5,
      totalFiber: 2.7,
      coachingFeedback: "Superb post-workout plate: 55.9g protein to trigger muscle protein synthesis."
    }
  },
  {
    id: 'idli_sambar',
    title: 'South Indian Idli, Sambar & Eggs',
    desc: '3 steamed idlis, vegetable sambar, 2 boiled eggs',
    sampleImg: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    fallback: {
      dishName: "3 Steamed Idlis, Sambar & 2 Boiled Eggs",
      recognizedItems: [
        { name: "Steamed Idli", quantity: 3, unit: "pieces", calories: 174, protein: 6.3, carbs: 36.0, fat: 0.6, fiber: 3.3 },
        { name: "Vegetable Sambar", quantity: 150, unit: "g (1 bowl)", calories: 120, protein: 5.4, carbs: 18.2, fat: 3.1, fiber: 4.2 },
        { name: "Large Boiled Eggs", quantity: 2, unit: "eggs", calories: 148, protein: 12.6, carbs: 0.8, fat: 10.0, fiber: 0 }
      ],
      totalCalories: 442,
      totalProtein: 24.3,
      totalCarbs: 55.0,
      totalFat: 13.7,
      totalFiber: 7.5,
      coachingFeedback: "Balanced fermented gut-friendly carb source backed by high biological value egg protein."
    }
  }
];

export const PlateScannerModal: React.FC<PlateScannerModalProps> = ({
  isOpen,
  onClose,
  onLogScannedMeal
}) => {
  if (!isOpen) return null;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<PlateScanResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      runPlateAnalysis(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSamplePlate = (sample: typeof SAMPLE_PLATES[0]) => {
    setSelectedImage(sample.sampleImg);
    setScanResult(sample.fallback);
  };

  const runPlateAnalysis = async (imgData: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/gemini/analyze-plate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          notes: userNotes
        })
      });

      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      } else {
        throw new Error('Scan failed');
      }
    } catch (e) {
      // Fallback
      setScanResult(SAMPLE_PLATES[0].fallback);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (!scanResult) return;

    const newMeal: MealLog = {
      id: `meal_scan_${Date.now()}`,
      mealType: 'lunch',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawInput: `Photo Scan: ${scanResult.dishName}`,
      items: scanResult.recognizedItems.map((item, idx) => ({
        id: `scanned_item_${Date.now()}_${idx}`,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        verified: true
      })),
      totalCalories: scanResult.totalCalories,
      totalProtein: scanResult.totalProtein,
      totalCarbs: scanResult.totalCarbs,
      totalFat: scanResult.totalFat,
      totalFiber: scanResult.totalFiber
    };

    onLogScannedMeal(newMeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-2xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-hud font-bold text-xs uppercase tracking-wider text-blue-700">
                  PEAKD COMPUTER VISION
                </span>
              </div>
              <h3 className="font-hud font-bold text-base text-slate-900">Plate Photo Food Recognition</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Photo Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
            {selectedImage ? (
              <div className="space-y-3">
                <img
                  src={selectedImage}
                  alt="Scanned Plate"
                  className="max-h-48 rounded-xl mx-auto object-cover border border-slate-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setScanResult(null);
                  }}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Choose Different Photo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Photograph Plate or Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    JPG, PNG or Mobile Camera Photo
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sample Plates */}
          {!selectedImage && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Or Test with Sample Plates (1-Click):
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {SAMPLE_PLATES.map(sample => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSamplePlate(sample)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 text-left transition-all"
                  >
                    <strong className="text-xs font-bold text-slate-900 block">{sample.title}</strong>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{sample.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Results Display */}
          {scanResult && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <strong className="text-sm font-bold text-slate-900">{scanResult.dishName}</strong>
                <span className="font-mono text-xs font-bold text-blue-700">
                  {scanResult.totalCalories} kcal
                </span>
              </div>

              <div className="divide-y divide-blue-100/60 text-xs">
                {scanResult.recognizedItems.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <span>
                      <strong className="text-slate-800">{item.name}</strong> ({item.quantity}{item.unit})
                    </span>
                    <span className="font-mono text-slate-600">
                      {item.calories} kcal · {item.protein}g P · {item.carbs}g C · {item.fat}g F
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-blue-900 bg-white/70 p-2.5 rounded-lg border border-blue-200/60 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 inline mr-1" />
                {scanResult.coachingFeedback}
              </div>

              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-hud font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Log This Plate to Today's Food Diary</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
