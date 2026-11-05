import React, { useState } from 'react';
import { BookOpen, Plus, Edit3, Trash2, Users, Clock, X } from 'lucide-react';
import { Subject, Teacher, ScheduleEntry } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  teachers: Teacher[];
  schedules: ScheduleEntry[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  onUpdateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  isAdmin: boolean;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  teachers,
  schedules,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  isAdmin,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [weeklyPeriodsDefault, setWeeklyPeriodsDefault] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName('');
    setNameEn('');
    setCode('');
    setColor('#2563eb');
    setWeeklyPeriodsDefault(4);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setName(s.name);
    setNameEn(s.nameEn || '');
    setCode(s.code);
    setColor(s.color);
    setWeeklyPeriodsDefault(s.weeklyPeriodsDefault);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingSubject) {
        await onUpdateSubject(editingSubject.id, {
          name,
          nameEn,
          code: code.toUpperCase(),
          color,
          weeklyPeriodsDefault: Number(weeklyPeriodsDefault),
        });
      } else {
        await onAddSubject({
          name,
          nameEn,
          code: code.toUpperCase() || name.slice(0, 4).toUpperCase(),
          color,
          weeklyPeriodsDefault: Number(weeklyPeriodsDefault),
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>គ្រប់គ្រងមុខវិជ្ជាសិក្សា (Curriculum Subjects)</span>
          </h2>
          <p className="text-xs text-slate-500">
            មុខវិជ្ជាក្រសួងអប់រំ យុវជន និងកីឡា និងបទដ្ឋានម៉ោងក្នុងសប្តាហ៍
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមមុខវិជ្ជា</span>
          </button>
        )}
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => {
          const eligibleTeachers = teachers.filter(t => t.subjectsTaught.includes(sub.id));
          const totalScheduled = schedules.filter(s => s.subjectId === sub.id).length;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-2xs"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.code.slice(0, 3)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        {sub.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {sub.nameEn} • <span className="font-mono">{sub.code}</span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="កែប្រែ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSubject(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>បទដ្ឋានក្នុងមួយថ្នាក់៖</span>
                    </span>
                    <strong className="text-slate-800">{sub.weeklyPeriodsDefault} ម៉ោង/សប្តាហ៍</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ម៉ោងបង្រៀនសរុបបច្ចុប្បន្ន៖</span>
                    <strong className="text-blue-600">{totalScheduled} ម៉ោង</strong>
                  </div>
                </div>

                {/* Qualified Teachers */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center space-x-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>គ្រូបង្រៀនមុខវិជ្ជានេះ ({eligibleTeachers.length} នាក់)៖</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {eligibleTeachers.length === 0 ? (
                      <span className="text-xs text-rose-500 font-medium">
                        មិនទាន់មានគ្រូជំនាញនៅឡើយ
                      </span>
                    ) : (
                      eligibleTeachers.map(t => (
                        <span
                          key={t.id}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          {t.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                {editingSubject ? 'កែប្រែមុខវិជ្ជា' : 'បន្ថែមមុខវិជ្ជាថ្មី'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះមុខវិជ្ជា (ខ្មែរ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ គណិតវិទ្យា, អក្សរសាស្ត្រខ្មែរ..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះមុខវិជ្ជា (English)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Mathematics, Khmer Literature"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">កូដកាត់ (Code)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="MATH, KHM..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ពណ៌សម្គាល់ (Color)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ចំនួនម៉ោងក្នុងមួយសប្តាហ៍សម្រាប់ ១ ថ្នាក់
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={weeklyPeriodsDefault}
                  onChange={(e) => setWeeklyPeriodsDefault(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  {isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
