import React from 'react';
import { X, AlertTriangle, Trash2, Edit3, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ConflictDetail, ScheduleEntry, Teacher, ClassGroup, Subject, TimeSlot } from '../types';

interface ConflictWarningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictDetail[];
  schedules: ScheduleEntry[];
  teachers: Teacher[];
  classes: ClassGroup[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  onEditSchedule: (schedule: ScheduleEntry) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ConflictWarningDrawer: React.FC<ConflictWarningDrawerProps> = ({
  isOpen,
  onClose,
  conflicts,
  schedules,
  teachers,
  classes,
  subjects,
  timeSlots,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  if (!isOpen) return null;

  const scheduleMap = new Map(schedules.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const classMap = new Map(classes.map(c => [c.id, c]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const slotMap = new Map(timeSlots.map(s => [s.id, s]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-700/80 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">បញ្ជីការជាន់គ្នានៃកាលវិភាគ ({conflicts.length})</h3>
              <p className="text-xs text-rose-100">Conflict Detection & Resolution Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-100 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {conflicts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <div className="text-base font-bold text-slate-800">គ្មានបញ្ហាជាន់គ្នាទេ!</div>
              <p className="text-xs text-slate-500 mt-1">
                កាលវិភាគទាំងអស់ត្រូវបានផ្ទៀងផ្ទាត់ដោយជោគជ័យ។ គ្រូបង្រៀន និងបន្ទប់រៀនទាំងអស់គ្មានម៉ោងជាន់គ្នាឡើយ។
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                ប្រព័ន្ធបានរកឃើញម៉ោងបង្រៀនជាន់គ្នាខាងក្រោម។ សូមចុចលើប៊ូតុង "កែប្រែ" ឬ "លុប" ដើម្បីដោះស្រាយ៖
              </p>

              {conflicts.map((conflict, idx) => {
                const slot = slotMap.get(conflict.timeSlotId);

                return (
                  <div
                    key={conflict.id || idx}
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                        <h4 className="text-xs font-bold text-rose-900">{conflict.titleKh}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        {conflict.type === 'teacher' ? 'គ្រូជាន់គ្នា' : conflict.type === 'room' ? 'បន្ទប់ជាន់គ្នា' : 'ថ្នាក់ជាន់គ្នា'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {conflict.descriptionKh}
                    </p>

                    {/* Involved schedule cards */}
                    <div className="pt-2 border-t border-rose-200/80 space-y-2">
                      <div className="text-[11px] font-bold text-slate-600">ម៉ោងបង្រៀនដែលពាក់ព័ន្ធ៖</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {conflict.scheduleIds.map((schId) => {
                          const sch = scheduleMap.get(schId);
                          if (!sch) return null;
                          const sub = subjectMap.get(sch.subjectId);
                          const tch = teacherMap.get(sch.teacherId);
                          const cls = classMap.get(sch.classId);

                          return (
                            <div
                              key={schId}
                              className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-bold text-slate-800 truncate">
                                  {cls?.name} — {sub?.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {tch?.name} ({sch.roomNumber})
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  onClick={() => onEditSchedule(sch)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                                  title="កែប្រែម៉ោងនេះ"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteSchedule(sch.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                                  title="លុបម៉ោងនេះ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
