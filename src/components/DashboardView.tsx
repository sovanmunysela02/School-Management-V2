import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  School
} from 'lucide-react';
import { Teacher, ClassGroup, Subject, TimeSlot, ScheduleEntry, ConflictDetail, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../data/initialData';

interface DashboardViewProps {
  teachers: Teacher[];
  classes: ClassGroup[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  schedules: ScheduleEntry[];
  conflicts: ConflictDetail[];
  onNavigateToTab: (tab: string) => void;
  onOpenAutoScheduler: () => void;
  onOpenNewSchedule: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teachers,
  classes,
  subjects,
  timeSlots,
  schedules,
  conflicts,
  onNavigateToTab,
  onOpenAutoScheduler,
  onOpenNewSchedule,
}) => {
  // Determine current day of week (mapping JS getDay() 0=Sun, 1=Mon, etc. to 'mon', 'tue'...)
  const dayIndex = new Date().getDay();
  const dayKeyMap: Record<number, DayOfWeek> = {
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
    0: 'mon', // fallback Sunday to Monday for school
  };
  const currentDayKey = dayKeyMap[dayIndex] || 'mon';
  const currentDayInfo = DAYS_OF_WEEK.find(d => d.id === currentDayKey) || DAYS_OF_WEEK[0];

  // Today's slots & schedules
  const todaySlotIds = new Set(timeSlots.filter(s => s.dayOfWeek === currentDayKey).map(s => s.id));
  const todaySchedules = schedules.filter(s => todaySlotIds.has(s.timeSlotId));

  // Teacher workload
  const teacherWorkload = teachers.map(t => {
    const count = schedules.filter(s => s.teacherId === t.id).length;
    const max = t.maxWeeklyHours || 22;
    const percentage = Math.min(100, Math.round((count / max) * 100));
    return {
      teacher: t,
      count,
      max,
      percentage,
    };
  }).sort((a, b) => b.count - a.count);

  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const classMap = new Map(classes.map(c => [c.id, c]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const slotMap = new Map(timeSlots.map(s => [s.id, s]));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Calendar className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium mb-3 backdrop-blur-xs">
            <School className="w-3.5 h-3.5" />
            <span>ប្រព័ន្ធគ្រប់គ្រងកាលវិភាគបង្រៀន</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            សួស្តី! សូមស្វាគមន៍មកកាន់ប្រព័ន្ធកាលវិភាគសិក្សា
          </h2>
          <p className="text-blue-100/90 text-sm leading-relaxed mb-4">
            ប្រព័ន្ធជួយគ្រប់គ្រងគ្រូ ថ្នាក់រៀន មុខវិជ្ជា និងរៀបចំកាលវិភាគដោយស្វ័យប្រវត្តិ 
            ព្រមទាំងពិនិត្យ និងការពារការជាន់គ្នានៃម៉ោងបង្រៀនបាន ១០០%។
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateToTab('timetable')}
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <span>មើលកាលវិភាគ (Timetable)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenAutoScheduler}
              className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 border border-blue-400/40 text-white font-medium text-xs rounded-xl backdrop-blur-xs transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>រៀបចំស្វ័យប្រវត្តិ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teachers */}
        <div 
          onClick={() => onNavigateToTab('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">គ្រូបង្រៀនសរុប</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mb-1">{teachers.length} <span className="text-sm font-normal text-slate-500">នាក់</span></div>
          <div className="text-xs text-slate-500">សាស្ត្រាចារ្យ និងលោកគ្រូ-អ្នកគ្រូ</div>
        </div>

        {/* Total Classes */}
        <div 
          onClick={() => onNavigateToTab('classes')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">ថ្នាក់រៀនសរុប</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mb-1">{classes.length} <span className="text-sm font-normal text-slate-500">ថ្នាក់</span></div>
          <div className="text-xs text-slate-500">វេនព្រឹក និងវេនរសៀល</div>
        </div>

        {/* Total Scheduled Periods */}
        <div 
          onClick={() => onNavigateToTab('timetable')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">ម៉ោងបង្រៀនក្នុងសប្តាហ៍</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mb-1">{schedules.length} <span className="text-sm font-normal text-slate-500">ម៉ោង</span></div>
          <div className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>បានចាត់តាំងរួចរាល់</span>
          </div>
        </div>

        {/* Conflict Detection Status */}
        <div 
          onClick={() => onNavigateToTab('conflicts')}
          className={`p-5 rounded-2xl border shadow-xs transition cursor-pointer group ${
            conflicts.length > 0
              ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
              : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${conflicts.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              ស្ថានភាពកាលវិភាគ
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition ${
              conflicts.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {conflicts.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
          </div>
          <div className={`text-3xl font-extrabold mb-1 ${conflicts.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {conflicts.length} <span className="text-sm font-normal">បញ្ហាជាន់គ្នា</span>
          </div>
          <div className={`text-xs ${conflicts.length > 0 ? 'text-rose-600 font-medium' : 'text-emerald-600'}`}>
            {conflicts.length > 0 ? 'ចុចទីនេះដើម្បីដោះស្រាយម៉ោងជាន់គ្នា' : 'ល្អឥតខ្ចោះ! គ្មានម៉ោងជាន់គ្នាឡើយ'}
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Teacher Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Schedule Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>កាលវិភាគប្រចាំថ្ងៃ៖ {currentDayInfo.nameKh} ({currentDayInfo.nameEn})</span>
              </h3>
              <p className="text-xs text-slate-500">
                បញ្ជីម៉ោងបង្រៀនដែលកំពុង និងត្រូវបង្រៀននៅថ្ងៃនេះ ({todaySchedules.length} ម៉ោង)
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('timetable')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              មើលកាលវិភាគពេញលេញ →
            </button>
          </div>

          {todaySchedules.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">មិនទាន់មានម៉ោងបង្រៀននៅថ្ងៃនេះទេ</p>
              <button
                onClick={onOpenNewSchedule}
                className="mt-3 px-3.5 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                + បន្ថែមម៉ោងបង្រៀន
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {todaySchedules.map((sch) => {
                const sub = subjectMap.get(sch.subjectId);
                const tch = teacherMap.get(sch.teacherId);
                const cls = classMap.get(sch.classId);
                const slot = slotMap.get(sch.timeSlotId);

                return (
                  <div
                    key={sch.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition flex items-start space-x-3"
                  >
                    <div
                      className="w-2.5 self-stretch rounded-full shrink-0"
                      style={{ backgroundColor: sub?.color || '#3b82f6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {sub?.name || 'មុខវិជ្ជា'}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 shrink-0">
                          {cls?.name || 'ថ្នាក់'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center space-x-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{tch?.name || 'គ្រូ'}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{slot?.labelKh || ''}</span>
                        </span>
                        <span className="font-medium text-slate-600 bg-white px-1.5 py-0.5 rounded-sm border border-slate-200">
                          {sch.roomNumber || 'បន្ទប់ទូទៅ'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Teacher Workload Meter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">បន្ទុកបង្រៀនគ្រូ</h3>
              <p className="text-xs text-slate-500">ម៉ោងបង្រៀនសរុបក្នុងសប្តាហ៍</p>
            </div>
            <button
              onClick={() => onNavigateToTab('teachers')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              ទាំងអស់ →
            </button>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[380px] pr-1">
            {teacherWorkload.slice(0, 6).map((item) => (
              <div key={item.teacher.id} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800 truncate max-w-[170px]">
                    {item.teacher.name}
                  </span>
                  <span className="text-slate-500 font-semibold shrink-0">
                    {item.count} / {item.max} ម៉ោង
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.percentage > 100
                        ? 'bg-rose-500'
                        : item.percentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>បទដ្ឋានគ្រូ៖ ២០-២៤ ម៉ោង/សប្តាហ៍</span>
          </div>
        </div>
      </div>
    </div>
  );
};
