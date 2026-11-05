import React, { useState } from 'react';
import { Settings, School, RotateCcw, Download, Upload, CheckCircle2, Clock } from 'lucide-react';
import { SchoolInfo, AppStateData } from '../types';

interface SettingsViewProps {
  schoolInfo: SchoolInfo;
  onUpdateSchoolInfo: (info: Partial<SchoolInfo>) => Promise<void>;
  onResetSample: () => Promise<void>;
  getFullDataJson: () => string;
  onRestoreDataJson: (json: string) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  schoolInfo,
  onUpdateSchoolInfo,
  onResetSample,
  getFullDataJson,
  onRestoreDataJson,
}) => {
  const [nameKh, setNameKh] = useState(schoolInfo.nameKh);
  const [nameEn, setNameEn] = useState(schoolInfo.nameEn);
  const [province, setProvince] = useState(schoolInfo.province);
  const [academicYear, setAcademicYear] = useState(schoolInfo.academicYear);
  const [principalName, setPrincipalName] = useState(schoolInfo.principalName);
  const [morningStartTime, setMorningStartTime] = useState(schoolInfo.morningStartTime);
  const [afternoonStartTime, setAfternoonStartTime] = useState(schoolInfo.afternoonStartTime);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onUpdateSchoolInfo({
        nameKh,
        nameEn,
        province,
        academicYear,
        principalName,
        morningStartTime,
        afternoonStartTime,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(getFullDataJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sisowath_timetable_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        await onRestoreDataJson(content);
        alert('ទិន្នន័យត្រូវបានបញ្ចូលឡើងវិញដោយជោគជ័យ!');
      } catch (err) {
        alert('ឯកសារមិនត្រឹមត្រូវ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>ការកំណត់ទូទៅ (School Settings & Preferences)</span>
        </h2>
        <p className="text-xs text-slate-500">
          គ្រប់គ្រងព័ត៌មានគ្រឹះស្ថានសិក្សា ឆ្នាំសិក្សា និងការបម្រុងទុកទិន្នន័យ
        </p>
      </div>

      {/* School Info Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">ព័ត៌មានសាលារៀន</h3>
            <p className="text-xs text-slate-500">ប្រើប្រាស់សម្រាប់បង្ហាញលើក្បាលកាលវិភាគ និងការបោះពុម្ព</p>
          </div>
        </div>

        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឈ្មោះសាលារៀន (ភាសាខ្មែរ)
              </label>
              <input
                type="text"
                required
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឈ្មោះសាលារៀន (English)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                រាជធានី / ខេត្ត
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឆ្នាំសិក្សា
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                នាម និងគោត្តនាម នាយកសាលា (សម្រាប់ចុះហត្ថលេខា)
              </label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>បានរក្សាទុកជោគជ័យ!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
            >
              {isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកព័ត៌មាន'}
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Restore and Reset Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup & Restore */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span>បម្រុងទុកទិន្នន័យ (Backup & Restore)</span>
          </h3>
          <p className="text-xs text-slate-500">
            ទាញយក ឬបញ្ចូលឯកសារទិន្នន័យ JSON នៃកាលវិភាគទាំងអស់
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleDownloadBackup}
              className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ទាញយក Backup</span>
            </button>

            <label className="flex-1 py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>បញ្ចូល Backup JSON</span>
              <input type="file" accept=".json" onChange={handleUploadBackup} className="hidden" />
            </label>
          </div>
        </div>

        {/* Reset to Sample Data */}
        <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-rose-800 flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>កំណត់ទិន្នន័យគំរូឡើងវិញ (Reset Demo)</span>
          </h3>
          <p className="text-xs text-slate-500">
            ផ្ទុកទិន្នន័យគំរូផ្លូវការរបស់វិទ្យាល័យ ព្រះស៊ីសុវត្ថិ ឡើងវិញ
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូឡើងវិញមែនទេ?')) {
                  onResetSample();
                }
              }}
              className="w-full py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>កំណត់ឡើងវិញ (Reset to Sample Data)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
