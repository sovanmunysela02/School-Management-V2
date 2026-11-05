import * as XLSX from 'xlsx';
import { ScheduleEntry, Teacher, ClassGroup, Subject, TimeSlot, SchoolInfo } from '../types';
import { DAYS_OF_WEEK } from '../data/initialData';

export function exportTimetableToExcel(params: {
  title: string;
  schedules: ScheduleEntry[];
  teachers: Teacher[];
  classes: ClassGroup[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  schoolInfo: SchoolInfo;
  viewType: 'class' | 'teacher';
  selectedEntityName: string;
}) {
  const { title, schedules, teachers, classes, subjects, timeSlots, schoolInfo, viewType, selectedEntityName } = params;

  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const classMap = new Map(classes.map(c => [c.id, c]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  // Create sheet rows
  const rows: (string | number)[][] = [];

  rows.push(['ព្រះរាជាណាចក្រកម្ពុជា']);
  rows.push(['ជាតិ សាសនា ព្រះមហាក្សត្រ']);
  rows.push([]);
  rows.push([schoolInfo.nameKh, '', '', `ឆ្នាំសិក្សា៖ ${schoolInfo.academicYear}`]);
  rows.push([title]);
  rows.push([`កាលបរិច្ឆេទបង្កើត៖ ${new Date().toLocaleDateString('km-KH')}`]);
  rows.push([]);

  // Table Header: Periods / Times, followed by Monday -> Saturday
  const headers = ['ម៉ោងសិក្សា / ពេល', ...DAYS_OF_WEEK.map(d => `${d.nameKh} (${d.nameEn})`)];
  rows.push(headers);

  // Group slots by period number & shift
  const periods = [
    { shift: 'morning', period: 1, label: 'ព្រឹក ម៉ោងទី ១ (07:00 - 07:50)' },
    { shift: 'morning', period: 2, label: 'ព្រឹក ម៉ោងទី ២ (07:55 - 08:45)' },
    { shift: 'morning', period: 3, label: 'ព្រឹក ម៉ោងទី ៣ (09:00 - 09:50)' },
    { shift: 'morning', period: 4, label: 'ព្រឹក ម៉ោងទី ៤ (09:55 - 10:45)' },
    { shift: 'morning', period: 5, label: 'ព្រឹក ម៉ោងទី ៥ (10:50 - 11:40)' },
    { shift: 'afternoon', period: 1, label: 'រសៀល ម៉ោងទី ១ (13:00 - 13:50)' },
    { shift: 'afternoon', period: 2, label: 'រសៀល ម៉ោងទី ២ (13:55 - 14:45)' },
    { shift: 'afternoon', period: 3, label: 'រសៀល ម៉ោងទី ៣ (15:00 - 15:50)' },
    { shift: 'afternoon', period: 4, label: 'រសៀល ម៉ោងទី ៤ (15:55 - 16:45)' },
    { shift: 'afternoon', period: 5, label: 'រសៀល ម៉ោងទី ៥ (16:50 - 17:40)' },
  ];

  for (const p of periods) {
    const row: string[] = [p.label];
    for (const day of DAYS_OF_WEEK) {
      // Find slot
      const slot = timeSlots.find(
        s => s.dayOfWeek === day.id && s.shift === p.shift && s.periodNumber === p.period
      );
      if (!slot) {
        row.push('');
        continue;
      }

      // Find matching schedule entries for this slot
      const entries = schedules.filter(s => s.timeSlotId === slot.id);
      if (entries.length === 0) {
        row.push('-');
      } else {
        const textParts = entries.map(e => {
          const sub = subjectMap.get(e.subjectId)?.name || 'មុខវិជ្ជា';
          const tch = teacherMap.get(e.teacherId)?.name || 'គ្រូ';
          const cls = classMap.get(e.classId)?.name || 'ថ្នាក់';
          const rm = e.roomNumber ? ` (${e.roomNumber})` : '';

          if (viewType === 'class') {
            return `${sub}\n[${tch}]${rm}`;
          } else {
            return `${sub}\n[${cls}]${rm}`;
          }
        });
        row.push(textParts.join('\n---\n'));
      }
    }
    rows.push(row);
  }

  rows.push([]);
  rows.push(['', '', '', '', 'បានឃើញ និងឯកភាព', '']);
  rows.push(['', '', '', '', 'នាយកសាលា', '']);
  rows.push([]);
  rows.push([]);
  rows.push(['', '', '', '', schoolInfo.principalName, '']);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 30 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'កាលវិភាគ');
  const fileName = `កាលវិភាគ_${selectedEntityName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
