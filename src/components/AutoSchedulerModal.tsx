import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Settings2, RefreshCw } from 'lucide-react';
import { ClassGroup } from '../types';

interface AutoSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  onRunAutoSchedule: (selectedClassIds: string[], clearExisting: boolean) => Promise<{
    totalAllocated: number;
    unallocatedReasons: string[];
    totalSchedules: number;
  }>;
}

export const AutoSchedulerModal: React.FC<AutoSchedulerModalProps> = ({
  isOpen,
  onClose,
  classes,
  onRunAutoSchedule,
}) => {
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(classes.map(c => c.id));
  const [clearExisting, setClearExisting] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    totalAllocated: number;
    unallocatedReasons: string[];
    totalSchedules: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleToggleClass = (id: string) => {
    setSelectedClassIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedClassIds.length === classes.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(classes.map(c => c.id));
    }
  };

  const handleExecute = async () => {
    if (selectedClassIds.length === 0) return;
    try {
      setIsRunning(true);
      setResult(null);
      const res = await onRunAutoSchedule(selectedClassIds, clearExisting);
      setResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-700/80 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">ប្រព័ន្ធរៀបចំកាលវិភាគស្វ័យប្រវត្តិ</h3>
              <p className="text-xs text-indigo-200">Automated Multi-Constraint Timetable Generator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Algorithm Rules Box */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5 text-blue-800">
              <Settings2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>លក្ខខណ្ឌច្បាប់ការពារការជាន់គ្នា (Smart Constraints)</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>គ្រូបង្រៀនមិនត្រូវមានម៉ោងជាន់គ្នានៅថ្នាក់ ២ ផ្សេងគ្នាឡើយ</li>
              <li>បន្ទប់រៀនមិនត្រូវត្រូវប្រើដោយ ២ ថ្នាក់ក្នុងពេលតែមួយឡើយ</li>
              <li>មុខវិជ្ជាត្រូវបានចាត់តាំងតាមចំនួនម៉ោងកំណត់ក្នុងកម្មវិធីសិក្សា</li>
              <li>បែងចែកម៉ោងរៀនឱ្យស្មើគ្នាក្នុងសប្តាហ៍ (មិនឱ្យរៀនមុខវិជ្ជាដដែលលើសពី ២ ម៉ោងក្នុងមួយថ្ងៃ)</li>
            </ul>
          </div>

          {/* Mode Switch: Clear vs Keep */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              របៀបរៀបចំ (Scheduling Mode)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setClearExisting(true)}
                className={`p-3 rounded-xl border text-left text-xs transition ${
                  clearExisting
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-800">បង្កើតឡើងវិញថ្មីទាំងអស់</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  លុបកាលវិភាគចាស់ចោល ហើយរៀបចំពីដំបូង
                </div>
              </button>

              <button
                type="button"
                onClick={() => setClearExisting(false)}
                className={`p-3 rounded-xl border text-left text-xs transition ${
                  !clearExisting
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-800">បំពេញតែម៉ោងទទេ</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  រក្សាម៉ោងដែលមានស្រាប់ ហើយបំពេញបន្ថែម
                </div>
              </button>
            </div>
          </div>

          {/* Target Classes Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                ជ្រើសរើសថ្នាក់ដែលត្រូវរៀបចំ ({selectedClassIds.length}/{classes.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {selectedClassIds.length === classes.length ? 'ដោះចេញទាំងអស់' : 'ជ្រើសទាំងអស់'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {classes.map((c) => {
                const isChecked = selectedClassIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center space-x-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                      isChecked
                        ? 'bg-white border-blue-400 font-bold text-blue-900 shadow-2xs'
                        : 'border-transparent text-slate-600 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleClass(c.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Execution Result summary */}
          {result && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>បានបញ្ចប់ការរៀបចំដោយជោគជ័យ!</span>
              </div>
              <div>
                <p>
                  បានចាត់តាំងម៉ោងបង្រៀនថ្មីចំនួន៖ <span className="font-bold text-emerald-700 text-sm">{result.totalAllocated} ម៉ោង</span>
                </p>
                <p>
                  ម៉ោងបង្រៀនសរុបក្នុងប្រព័ន្ធ៖ <span className="font-bold text-slate-800">{result.totalSchedules} ម៉ោង</span>
                </p>
              </div>

              {result.unallocatedReasons.length > 0 && (
                <div className="mt-2 pt-2 border-t border-emerald-200">
                  <div className="font-semibold text-amber-800 flex items-center space-x-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>ចំណាំអំពីម៉ោងដែលនៅសល់៖</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-700 text-[11px]">
                    {result.unallocatedReasons.slice(0, 3).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition"
          >
            បិទ
          </button>

          <button
            type="button"
            disabled={isRunning || selectedClassIds.length === 0}
            onClick={handleExecute}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition flex items-center space-x-2 ${
              isRunning || selectedClassIds.length === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>កំពុងដំណើរការគណនា...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ចាប់ផ្តើមរៀបចំស្វ័យប្រវត្តិ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
