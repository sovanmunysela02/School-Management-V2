import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  GraduationCap, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Printer, 
  FileSpreadsheet, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { Teacher, ClassGroup, Subject, TimeSlot, ScheduleEntry, ConflictDetail, DayOfWeek, ShiftType } from '../types';
import { DAYS_OF_WEEK } from '../data/initialData';

interface ScheduleMatrixViewProps {
  teachers: Teacher[];
  classes: ClassGroup[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  schedules: ScheduleEntry[];
  conflicts: ConflictDetail[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedTeacherId: string;
  setSelectedTeacherId: (id: string) => void;
  onOpenNewSlot: (defaultTimeSlotId?: string, defaultClassId?: string, defaultTeacherId?: string) => void;
  onEditSlot: (schedule: ScheduleEntry) => void;
  onDeleteSlot: (id: string) => void;
  onClearClassSchedule: (classId: string) => void;
  onAutoScheduleClass: (classId: string) => void;
  onPrint: () => void;
  onExportExcel: () => void;
  isAdmin: boolean;
}

export const ScheduleMatrixView: React.FC<ScheduleMatrixViewProps> = ({
  teachers,
  classes,
  subjects,
  timeSlots,
  schedules,
  conflicts,
  selectedClassId,
  setSelectedClassId,
  selectedTeacherId,
  setSelectedTeacherId,
  onOpenNewSlot,
  onEditSlot,
  onDeleteSlot,
  onClearClassSchedule,
  onAutoScheduleClass,
  onPrint,
  onExportExcel,
  isAdmin,
}) => {
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lookup maps
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t])), [teachers]);
  const classMap = useMemo(() => new Map(classes.map(c => [c.id, c])), [classes]);
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);

  // Set of conflicting schedule IDs for instant O(1) lookup
  const conflictingScheduleIds = useMemo(() => {
    const set = new Set<string>();
    conflicts.forEach(c => c.scheduleIds.forEach(id => set.add(id)));
    return set;
  }, [conflicts]);

  // Active entity details
  const activeClass = classMap.get(selectedClassId) || classes[0];
  const activeTeacher = teacherMap.get(selectedTeacherId) || teachers[0];

  // Filtered days
  const displayedDays = useMemo(() => {
    if (selectedDayFilter === 'all') return DAYS_OF_WEEK;
    return DAYS_OF_WEEK.filter(d => d.id === selectedDayFilter);
  }, [selectedDayFilter]);

  // Periods configuration
  const periods = useMemo(() => {
    const list: { shift: ShiftType; period: number; labelKh: string; timeRange: string }[] = [];
    
    if (selectedShiftFilter === 'all' || selectedShiftFilter === 'morning') {
      list.push(
        { shift: 'morning', period: 1, labelKh: 'ព្រឹក ម៉ោងទី ១', timeRange: '07:00 - 07:50' },
        { shift: 'morning', period: 2, labelKh: 'ព្រឹក ម៉ោងទី ២', timeRange: '07:55 - 08:45' },
        { shift: 'morning', period: 3, labelKh: 'ព្រឹក ម៉ោងទី ៣', timeRange: '09:00 - 09:50' },
        { shift: 'morning', period: 4, labelKh: 'ព្រឹក ម៉ោងទី ៤', timeRange: '09:55 - 10:45' },
        { shift: 'morning', period: 5, labelKh: 'ព្រឹក ម៉ោងទី ៥', timeRange: '10:50 - 11:40' },
      );
    }

    if (selectedShiftFilter === 'all' || selectedShiftFilter === 'afternoon') {
      list.push(
        { shift: 'afternoon', period: 1, labelKh: 'រសៀល ម៉ោងទី ១', timeRange: '13:00 - 13:50' },
        { shift: 'afternoon', period: 2, labelKh: 'រសៀល ម៉ោងទី ២', timeRange: '13:55 - 14:45' },
        { shift: 'afternoon', period: 3, labelKh: 'រសៀល ម៉ោងទី ៣', timeRange: '15:00 - 15:50' },
        { shift: 'afternoon', period: 4, labelKh: 'រសៀល ម៉ោងទី ៤', timeRange: '15:55 - 16:45' },
        { shift: 'afternoon', period: 5, labelKh: 'រសៀល ម៉ោងទី ៥', timeRange: '16:50 - 17:40' },
      );
    }

    return list;
  }, [selectedShiftFilter]);

  // Filter schedules based on active view mode
  const currentSchedules = useMemo(() => {
    let list = schedules;
    if (viewMode === 'class' && activeClass) {
      list = list.filter(s => s.classId === activeClass.id);
    } else if (viewMode === 'teacher' && activeTeacher) {
      list = list.filter(s => s.teacherId === activeTeacher.id);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => {
        const sub = subjectMap.get(s.subjectId)?.name.toLowerCase() || '';
        const tch = teacherMap.get(s.teacherId)?.name.toLowerCase() || '';
        const cls = classMap.get(s.classId)?.name.toLowerCase() || '';
        const rm = s.roomNumber.toLowerCase();
        return sub.includes(q) || tch.includes(q) || cls.includes(q) || rm.includes(q);
      });
    }

    return list;
  }, [schedules, viewMode, activeClass, activeTeacher, searchQuery, subjectMap, teacherMap, classMap]);

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* View Mode Toggle: By Class vs By Teacher */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('class')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'class'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>កាលវិភាគតាមថ្នាក់</span>
            </button>

            <button
              onClick={() => setViewMode('teacher')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'teacher'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>កាលវិភាគតាមគ្រូ</span>
            </button>
          </div>

          {/* Selector based on view mode */}
          {viewMode === 'class' ? (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'})
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.roomNumber})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Secondary filters: Day, Shift, Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day Filter */}
          <select
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">គ្រប់ថ្ងៃទាំងអស់ (ច័ន្ទ - សៅរ៍)</option>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameKh} ({d.nameEn})
              </option>
            ))}
          </select>

          {/* Shift Filter */}
          <select
            value={selectedShiftFilter}
            onChange={(e) => setSelectedShiftFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">វេនសិក្សាទាំងអស់ (ព្រឹក & រសៀល)</option>
            <option value="morning">តែវេនព្រឹក (7:00 - 11:40)</option>
            <option value="afternoon">តែវេនរសៀល (13:00 - 17:40)</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកមុខវិជ្ជា, គ្រូ, បន្ទប់..."
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-700 w-44 focus:w-56 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Action buttons */}
          <button
            onClick={onPrint}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
            title="បោះពុម្ពកាលវិភាគ"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onExportExcel}
            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition"
            title="នាំចេញជា Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Information strip for Active Entity */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {viewMode === 'class' ? activeClass?.name.slice(-2) : activeTeacher?.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-slate-800">
                {viewMode === 'class' ? activeClass?.name : activeTeacher?.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                {viewMode === 'class'
                  ? activeClass?.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'
                  : activeTeacher?.role === 'admin' ? 'នាយក / Admin' : 'គ្រូបង្រៀន'}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
              {viewMode === 'class' ? (
                <>
                  <span>បន្ទប់លំនាំដើម៖ {activeClass?.defaultRoom}</span>
                  <span>•</span>
                  <span>សិស្ស៖ {activeClass?.studentCount || 0} នាក់</span>
                  <span>•</span>
                  <span>
                    គ្រូបន្ទុកថ្នាក់៖ {teacherMap.get(activeClass?.homeroomTeacherId || '')?.name || 'មិនទាន់កំណត់'}
                  </span>
                </>
              ) : (
                <>
                  <span>ទូរស័ព្ទ៖ {activeTeacher?.phone}</span>
                  <span>•</span>
                  <span>អ៊ីមែល៖ {activeTeacher?.email}</span>
                  <span>•</span>
                  <span>បន្ទប់៖ {activeTeacher?.roomNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions for this entity */}
        {isAdmin && viewMode === 'class' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAutoScheduleClass(activeClass.id)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>រៀបចំស្វ័យប្រវត្តិថ្នាក់នេះ</span>
            </button>

            <button
              onClick={() => onClearClassSchedule(activeClass.id)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium rounded-xl transition"
              title="សម្អាតកាលវិភាគថ្នាក់នេះទាំងអស់"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>សម្អាត</span>
            </button>
          </div>
        )}
      </div>

      {/* Timetable Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            {/* Table Header: Days of the week */}
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-40 border-r border-slate-200">
                  ម៉ោងសិក្សា
                </th>
                {displayedDays.map((day) => (
                  <th
                    key={day.id}
                    className="p-3 text-center text-xs font-bold text-slate-800 border-r border-slate-200 last:border-r-0"
                  >
                    <div className="text-sm font-extrabold text-blue-900">{day.nameKh}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{day.nameEn}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Shift / Periods */}
            <tbody className="divide-y divide-slate-200">
              {periods.map((p, idx) => {
                // Break separator between morning and afternoon
                const isShiftBreak = idx > 0 && periods[idx - 1].shift !== p.shift;

                return (
                  <React.Fragment key={`${p.shift}-${p.period}`}>
                    {isShiftBreak && (
                      <tr className="bg-gradient-to-r from-amber-50 to-orange-50/50 border-y border-amber-200">
                        <td
                          colSpan={displayedDays.length + 1}
                          className="py-2 text-center text-xs font-bold text-amber-800"
                        >
                          --- ម៉ោងសម្រាកថ្ងៃត្រង់ (11:40 - 13:00) Lunch Break ---
                        </td>
                      </tr>
                    )}

                    <tr className="hover:bg-slate-50/40 transition">
                      {/* Period Label Column */}
                      <td className="p-3 border-r border-slate-200 bg-slate-50/70 align-top">
                        <div className="text-xs font-bold text-slate-800">{p.labelKh}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{p.timeRange}</div>
                        <span
                          className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.shift === 'morning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {p.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'}
                        </span>
                      </td>

                      {/* Day Columns */}
                      {displayedDays.map((day) => {
                        // Find slot
                        const slot = timeSlots.find(
                          s => s.dayOfWeek === day.id && s.shift === p.shift && s.periodNumber === p.period
                        );

                        // Find matching schedule entries for this cell
                        const cellEntries = slot
                          ? currentSchedules.filter(s => s.timeSlotId === slot.id)
                          : [];

                        return (
                          <td
                            key={day.id}
                            className="p-2 border-r border-slate-200 last:border-r-0 align-top min-w-[150px] relative h-28"
                          >
                            {cellEntries.length === 0 ? (
                              // Empty Cell -> Allow clicking to add
                              <div
                                onClick={() => {
                                  if (isAdmin && slot) {
                                    onOpenNewSlot(
                                      slot.id,
                                      viewMode === 'class' ? activeClass?.id : undefined,
                                      viewMode === 'teacher' ? activeTeacher?.id : undefined
                                    );
                                  }
                                }}
                                className={`h-full min-h-[90px] rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group transition ${
                                  isAdmin
                                    ? 'hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer'
                                    : 'bg-slate-50/30'
                                }`}
                              >
                                {isAdmin ? (
                                  <>
                                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition text-slate-400">
                                      <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition">
                                      ចាត់តាំងម៉ោង
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs text-slate-300">-</span>
                                )}
                              </div>
                            ) : (
                              // Occupied Cell
                              <div className="space-y-1.5 h-full">
                                {cellEntries.map((sch) => {
                                  const sub = subjectMap.get(sch.subjectId);
                                  const tch = teacherMap.get(sch.teacherId);
                                  const cls = classMap.get(sch.classId);
                                  const hasConflict = conflictingScheduleIds.has(sch.id);

                                  return (
                                    <div
                                      key={sch.id}
                                      className={`p-2 rounded-xl border shadow-xs transition relative group ${
                                        hasConflict
                                          ? 'border-rose-400 bg-rose-50/90 ring-2 ring-rose-500/50'
                                          : 'border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-md'
                                      }`}
                                    >
                                      {/* Conflict Warning Indicator */}
                                      {hasConflict && (
                                        <div className="flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-200/80 px-1.5 py-0.5 rounded-sm mb-1">
                                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                          <span>ម៉ោងជាន់គ្នា!</span>
                                        </div>
                                      )}

                                      {/* Subject badge with color accent */}
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-1.5 truncate">
                                          <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: sub?.color || '#2563eb' }}
                                          />
                                          <span className="text-xs font-bold text-slate-800 truncate">
                                            {sub?.name || 'មុខវិជ្ជា'}
                                          </span>
                                        </div>

                                        {/* Class tag */}
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                                          {cls?.name || 'ថ្នាក់'}
                                        </span>
                                      </div>

                                      {/* Teacher Name */}
                                      <div className="text-[11px] text-slate-600 flex items-center space-x-1 truncate">
                                        <Users className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="truncate">{tch?.name || 'គ្រូ'}</span>
                                      </div>

                                      {/* Room number */}
                                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">
                                          {sch.roomNumber || 'បន្ទប់ទូទៅ'}
                                        </span>
                                      </div>

                                      {/* Hover Edit / Delete actions for Admin */}
                                      {isAdmin && (
                                        <div className="absolute right-1 top-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition bg-white/95 p-0.5 rounded-lg border border-slate-200 shadow-xs">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onEditSlot(sch);
                                            }}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition"
                                            title="កែប្រែ"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onDeleteSlot(sch.id);
                                            }}
                                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition"
                                            title="លុប"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
