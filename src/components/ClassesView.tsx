import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  X, 
  Users, 
  DoorClosed,
  Clock
} from 'lucide-react';
import { ClassGroup, Teacher, ScheduleEntry, ShiftType } from '../types';

interface ClassesViewProps {
  classes: ClassGroup[];
  teachers: Teacher[];
  schedules: ScheduleEntry[];
  onAddClass: (cls: Omit<ClassGroup, 'id'>) => Promise<void>;
  onUpdateClass: (id: string, cls: Partial<ClassGroup>) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
  onViewClassSchedule: (classId: string) => void;
  isAdmin: boolean;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  teachers,
  schedules,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onViewClassSchedule,
  isAdmin,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);

  // Form
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(7);
  const [shift, setShift] = useState<ShiftType>('morning');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [defaultRoom, setDefaultRoom] = useState('');
  const [studentCount, setStudentCount] = useState(40);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teacherMap = new Map(teachers.map(t => [t.id, t]));

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName('ថ្នាក់ទី ៧C');
    setGradeLevel(7);
    setShift('morning');
    setHomeroomTeacherId(teachers[0]?.id || '');
    setDefaultRoom('បន្ទប់ A105');
    setStudentCount(40);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClassGroup) => {
    setEditingClass(c);
    setName(c.name);
    setGradeLevel(c.gradeLevel);
    setShift(c.shift);
    setHomeroomTeacherId(c.homeroomTeacherId || '');
    setDefaultRoom(c.defaultRoom);
    setStudentCount(c.studentCount || 40);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingClass) {
        await onUpdateClass(editingClass.id, {
          name,
          gradeLevel: Number(gradeLevel),
          shift,
          homeroomTeacherId: homeroomTeacherId || undefined,
          defaultRoom,
          studentCount: Number(studentCount),
        });
      } else {
        await onAddClass({
          name,
          gradeLevel: Number(gradeLevel),
          shift,
          homeroomTeacherId: homeroomTeacherId || undefined,
          defaultRoom,
          studentCount: Number(studentCount),
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
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>គ្រប់គ្រងថ្នាក់រៀន និងកម្រិត (Classes & Grades)</span>
          </h2>
          <p className="text-xs text-slate-500">
            បញ្ជីថ្នាក់រៀន កម្រិតថ្នាក់ វេនសិក្សា និងគ្រូបន្ទុកថ្នាក់
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមថ្នាក់ថ្មី</span>
          </button>
        )}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const scheduledCount = schedules.filter(s => s.classId === cls.id).length;
          const homeroomTeacher = teacherMap.get(cls.homeroomTeacherId || '');

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-extrabold text-base shadow-2xs">
                      {cls.name.replace('ថ្នាក់ទី ', '')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        {cls.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cls.shift === 'morning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {cls.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          កម្រិតទី {cls.gradeLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="កែប្រែ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteClass(cls.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <DoorClosed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>បន្ទប់រៀន៖ <strong className="text-slate-800">{cls.defaultRoom}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      គ្រូបន្ទុកថ្នាក់៖ <strong className="text-slate-800">{homeroomTeacher?.name || 'មិនទាន់កំណត់'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>ចំនួនសិស្ស៖ {cls.studentCount || 0} នាក់</span>
                  </div>
                </div>
              </div>

              {/* Progress & View Button */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>ម៉ោងសិក្សាចាត់តាំង៖</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {scheduledCount} / 30 ម៉ោង
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((scheduledCount / 30) * 100))}%` }}
                  />
                </div>

                <button
                  onClick={() => onViewClassSchedule(cls.id)}
                  className="w-full mt-2 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>មើលកាលវិភាគថ្នាក់នេះ</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                {editingClass ? 'កែប្រែថ្នាក់រៀន' : 'បន្ថែមថ្នាក់រៀនថ្មី'}
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
                  ឈ្មោះថ្នាក់ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ ថ្នាក់ទី ៧A, ៨B, ៩C..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">កម្រិតថ្នាក់</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {[7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">វេនសិក្សា</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="morning">វេនព្រឹក (07:00 - 11:40)</option>
                    <option value="afternoon">វេនរសៀល (13:00 - 17:40)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  បន្ទប់រៀនលំនាំដើម
                </label>
                <input
                  type="text"
                  value={defaultRoom}
                  onChange={(e) => setDefaultRoom(e.target.value)}
                  placeholder="បន្ទប់ A101"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  គ្រូបន្ទុកថ្នាក់ (Homeroom Teacher)
                </label>
                <select
                  value={homeroomTeacherId}
                  onChange={(e) => setHomeroomTeacherId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">-- ជ្រើសរើសគ្រូបន្ទុកថ្នាក់ --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ចំនួនសិស្សក្នុងថ្នាក់
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
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
