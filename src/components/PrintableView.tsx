import React from 'react';
import { Teacher, ClassGroup, Subject, TimeSlot, ScheduleEntry, SchoolInfo } from '../types';
import { DAYS_OF_WEEK } from '../data/initialData';

interface PrintableViewProps {
  schoolInfo: SchoolInfo;
  viewType: 'class' | 'teacher';
  entityName: string;
  schedules: ScheduleEntry[];
  teachers: Teacher[];
  classes: ClassGroup[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
}

export const PrintableView: React.FC<PrintableViewProps> = ({
  schoolInfo,
  viewType,
  entityName,
  schedules,
  teachers,
  classes,
  subjects,
  timeSlots,
}) => {
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const classMap = new Map(classes.map(c => [c.id, c]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const periods = [
    { shift: 'morning', period: 1, label: 'ម៉ោងទី ១', time: '07:00 - 07:50' },
    { shift: 'morning', period: 2, label: 'ម៉ោងទី ២', time: '07:55 - 08:45' },
    { shift: 'morning', period: 3, label: 'ម៉ោងទី ៣', time: '09:00 - 09:50' },
    { shift: 'morning', period: 4, label: 'ម៉ោងទី ៤', time: '09:55 - 10:45' },
    { shift: 'morning', period: 5, label: 'ម៉ោងទី ៥', time: '10:50 - 11:40' },
    { shift: 'afternoon', period: 1, label: 'ម៉ោងទី ១ (រសៀល)', time: '13:00 - 13:50' },
    { shift: 'afternoon', period: 2, label: 'ម៉ោងទី ២ (រសៀល)', time: '13:55 - 14:45' },
    { shift: 'afternoon', period: 3, label: 'ម៉ោងទី ៣ (រសៀល)', time: '15:00 - 15:50' },
    { shift: 'afternoon', period: 4, label: 'ម៉ោងទី ៤ (រសៀល)', time: '15:55 - 16:45' },
    { shift: 'afternoon', period: 5, label: 'ម៉ោងទី ៥ (រសៀល)', time: '16:50 - 17:40' },
  ];

  return (
    <div className="print-only p-8 text-black bg-white">
      {/* Official Cambodian Header */}
      <div className="flex justify-between items-start mb-6">
        {/* Left header */}
        <div className="text-center font-bold text-xs space-y-0.5">
          <div>ក្រសួងអប់រំ យុវជន និងកីឡា</div>
          <div>មន្ទីរអប់រំ យុវជន និងកីឡា {schoolInfo.province}</div>
          <div className="text-sm font-extrabold">{schoolInfo.nameKh}</div>
        </div>

        {/* Right header */}
        <div className="text-center font-bold text-xs space-y-0.5">
          <div className="text-sm font-extrabold tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</div>
          <div>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
          <div className="font-serif text-[11px] italic tracking-widest pt-0.5">--- 3 ---</div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center my-6 space-y-1">
        <h2 className="text-base font-extrabold uppercase tracking-wide">
          កាលវិភាគបង្រៀន និងរៀនប្រចាំសប្តាហ៍
        </h2>
        <div className="text-xs font-bold">
          {viewType === 'class' ? `ថ្នាក់រៀន៖ ${entityName}` : `គ្រូបង្រៀន៖ ${entityName}`}
          <span className="mx-2">•</span>
          <span>ឆ្នាំសិក្សា៖ {schoolInfo.academicYear}</span>
        </div>
      </div>

      {/* Timetable Print Table */}
      <table className="w-full border-collapse border border-black text-xs mb-8">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black p-2 text-center w-28 font-bold">
              ម៉ោងសិក្សា
            </th>
            {DAYS_OF_WEEK.map((d) => (
              <th key={d.id} className="border border-black p-2 text-center font-bold">
                {d.nameKh}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p, pIdx) => {
            const isBreak = pIdx === 5;
            return (
              <React.Fragment key={`${p.shift}-${p.period}`}>
                {isBreak && (
                  <tr className="bg-slate-100">
                    <td colSpan={7} className="border border-black py-1 text-center font-bold text-[11px]">
                      --- សម្រាកថ្ងៃត្រង់ (11:40 - 13:00) ---
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="border border-black p-2 bg-slate-50 text-center font-semibold text-[11px]">
                    <div>{p.label}</div>
                    <div className="text-[10px] text-slate-600 font-mono">{p.time}</div>
                  </td>

                  {DAYS_OF_WEEK.map((day) => {
                    const slot = timeSlots.find(
                      s => s.dayOfWeek === day.id && s.shift === p.shift && s.periodNumber === p.period
                    );
                    const entries = slot ? schedules.filter(s => s.timeSlotId === slot.id) : [];

                    return (
                      <td key={day.id} className="border border-black p-1 text-center align-middle h-14">
                        {entries.length === 0 ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          entries.map(e => {
                            const sub = subjectMap.get(e.subjectId)?.name || 'មុខវិជ្ជា';
                            const tch = teacherMap.get(e.teacherId)?.name || 'គ្រូ';
                            const cls = classMap.get(e.classId)?.name || 'ថ្នាក់';

                            return (
                              <div key={e.id} className="leading-tight">
                                <div className="font-bold text-[11px]">{sub}</div>
                                <div className="text-[10px] text-slate-700">
                                  {viewType === 'class' ? tch : cls}
                                </div>
                                {e.roomNumber && (
                                  <div className="text-[9px] text-slate-500 font-mono">
                                    [{e.roomNumber}]
                                  </div>
                                )}
                              </div>
                            );
                          })
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

      {/* Signature Section */}
      <div className="flex justify-between items-start text-xs pt-4 print-break-inside-avoid">
        {/* Left */}
        <div className="text-center w-56">
          <div className="font-bold mb-1">គ្រូបន្ទុកថ្នាក់ / សាស្ត្រាចារ្យ</div>
          <div className="text-[11px] text-slate-500 italic mb-16">(ហត្ថលេខា និងឈ្មោះ)</div>
          <div className="font-bold">..............................................</div>
        </div>

        {/* Right */}
        <div className="text-center w-64">
          <div className="italic text-[11px] mb-1">
            {schoolInfo.province}, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...
          </div>
          <div className="font-bold">បានឃើញ និងឯកភាព</div>
          <div className="font-bold mb-16">នាយកសាលា</div>
          <div className="font-bold text-sm underline">{schoolInfo.principalName}</div>
        </div>
      </div>
    </div>
  );
};
