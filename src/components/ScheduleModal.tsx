import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Teacher, ClassGroup, Subject, TimeSlot, ScheduleEntry } from '../types';
import { validateProposedSlot } from '../utils/conflicts';
import { DAYS_OF_WEEK } from '../data/initialData';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<ScheduleEntry, 'id'>, force?: boolean) => Promise<void>;
  editEntry?: ScheduleEntry | null;
  defaultTimeSlotId?: string;
  defaultClassId?: string;
  defaultTeacherId?: string;
  teachers: Teacher[];
  classes: ClassGroup[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  schedules: ScheduleEntry[];
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editEntry,
  defaultTimeSlotId,
  defaultClassId,
  defaultTeacherId,
  teachers,
  classes,
  subjects,
  timeSlots,
  schedules,
}) => {
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [timeSlotId, setTimeSlotId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill fields on open / edit
  useEffect(() => {
    if (editEntry) {
      setClassId(editEntry.classId);
      setSubjectId(editEntry.subjectId);
      setTeacherId(editEntry.teacherId);
      setTimeSlotId(editEntry.timeSlotId);
      setRoomNumber(editEntry.roomNumber);
    } else {
      const initClass = defaultClassId || (classes[0]?.id || '');
      const clsObj = classes.find(c => c.id === initClass);
      setClassId(initClass);
      
      const initSub = subjects[0]?.id || '';
      setSubjectId(initSub);

      // Auto pick eligible teacher for this subject
      const eligible = teachers.find(t => t.subjectsTaught.includes(initSub));
      setTeacherId(defaultTeacherId || eligible?.id || teachers[0]?.id || '');

      setTimeSlotId(defaultTimeSlotId || timeSlots[0]?.id || '');
      setRoomNumber(clsObj?.defaultRoom || 'បន្ទប់ A101');
    }
    setErrorMsg('');
  }, [editEntry, defaultTimeSlotId, defaultClassId, defaultTeacherId, isOpen, classes, subjects, teachers, timeSlots]);

  // When class changes, update default room if empty
  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    const cls = classes.find(c => c.id === newClassId);
    if (cls && (!roomNumber || roomNumber.trim() === '')) {
      setRoomNumber(cls.defaultRoom);
    }
  };

  // When subject changes, recommend a teacher who teaches this subject
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);
    const eligibleTeacher = teachers.find(t => t.subjectsTaught.includes(newSubjectId));
    if (eligibleTeacher) {
      setTeacherId(eligibleTeacher.id);
    }
  };

  // Real-time conflict validation
  const validation = useMemo(() => {
    if (!teacherId || !classId || !timeSlotId) {
      return { hasConflict: false, conflicts: [] };
    }
    return validateProposedSlot({
      teacherId,
      classId,
      roomNumber,
      timeSlotId,
      excludeScheduleId: editEntry?.id,
      schedules,
      teachers,
      classes,
    });
  }, [teacherId, classId, roomNumber, timeSlotId, editEntry, schedules, teachers, classes]);

  if (!isOpen) return null;

  const handleSubmit = async (force = false) => {
    if (!classId || !subjectId || !teacherId || !timeSlotId) {
      setErrorMsg('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់!');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave(
        {
          classId,
          subjectId,
          teacherId,
          timeSlotId,
          roomNumber,
        },
        force
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'មានបញ្ហាក្នុងការរក្សាទុក');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {editEntry ? 'កែប្រែម៉ោងបង្រៀន' : 'ចាត់តាំងម៉ោងបង្រៀនថ្មី'}
            </h3>
            <p className="text-xs text-slate-500">
              ជ្រើសរើសថ្នាក់ មុខវិជ្ជា គ្រូ និងម៉ោងសិក្សា
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Real-time Conflict Alert Box */}
          {validation.hasConflict && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 space-y-1.5">
              <div className="flex items-center space-x-2 font-bold text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>រកឃើញការជាន់គ្នានៃកាលវិភាគ! (Conflict Warning)</span>
              </div>
              <ul className="text-xs space-y-1 pl-6 list-disc text-rose-700 font-medium">
                {validation.conflicts.map((c) => (
                  <li key={c.id}>{c.descriptionKh}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Class Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ថ្នាក់រៀន <span className="text-rose-500">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              មុខវិជ្ជា <span className="text-rose-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - លំនាំដើម {s.weeklyPeriodsDefault} ម៉ោង/សប្តាហ៍
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              គ្រូបង្រៀន <span className="text-rose-500">*</span>
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {teachers.map((t) => {
                const teachesThis = t.subjectsTaught.includes(subjectId);
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} {teachesThis ? '★ (ជំនាញមុខវិជ្ជានេះ)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* TimeSlot Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ម៉ោងសិក្សា និងថ្ងៃ <span className="text-rose-500">*</span>
            </label>
            <select
              value={timeSlotId}
              onChange={(e) => setTimeSlotId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {timeSlots.map((ts) => {
                const day = DAYS_OF_WEEK.find(d => d.id === ts.dayOfWeek);
                return (
                  <option key={ts.id} value={ts.id}>
                    {day?.nameKh} ({day?.nameEn}) — {ts.labelKh} [{ts.shift === 'morning' ? 'ព្រឹក' : 'រសៀល'}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              បន្ទប់រៀន (Room Number)
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="ឧទាហរណ៍៖ បន្ទប់ A101, Lab B201..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition"
          >
            បោះបង់
          </button>

          <div className="flex items-center space-x-2">
            {validation.hasConflict && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(true)}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition"
                title="រក្សាទុកទោះបីជាមានការជាន់គ្នាក៏ដោយ"
              >
                រក្សាទុកដោយបង្ខំ (Force)
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting || (validation.hasConflict && !editEntry)}
              onClick={() => handleSubmit(false)}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition flex items-center space-x-1.5 ${
                validation.hasConflict
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកកាលវិភាគ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
