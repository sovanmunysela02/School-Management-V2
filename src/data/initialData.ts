import { Teacher, ClassGroup, Subject, TimeSlot, ScheduleEntry, SchoolInfo, DayOfWeek } from '../types';

export const DAYS_OF_WEEK: { id: DayOfWeek; nameKh: string; nameShortKh: string; nameEn: string }[] = [
  { id: 'mon', nameKh: 'ថ្ងៃច័ន្ទ', nameShortKh: 'ច័ន្ទ', nameEn: 'Monday' },
  { id: 'tue', nameKh: 'ថ្ងៃអង្គារ', nameShortKh: 'អង្គារ', nameEn: 'Tuesday' },
  { id: 'wed', nameKh: 'ថ្ងៃពុធ', nameShortKh: 'ពុធ', nameEn: 'Wednesday' },
  { id: 'thu', nameKh: 'ថ្ងៃព្រហស្បតិ៍', nameShortKh: 'ព្រហស្បតិ៍', nameEn: 'Thursday' },
  { id: 'fri', nameKh: 'ថ្ងៃសុក្រ', nameShortKh: 'សុក្រ', nameEn: 'Friday' },
  { id: 'sat', nameKh: 'ថ្ងៃសៅរ៍', nameShortKh: 'សៅរ៍', nameEn: 'Saturday' },
];

export const INITIAL_SCHOOL_INFO: SchoolInfo = {
  nameKh: 'វិទ្យាល័យ ព្រះស៊ីសុវត្ថិ',
  nameEn: 'Preah Sisowath High School',
  province: 'រាជធានីភ្នំពេញ',
  academicYear: '២០២៦-២០២៧',
  principalName: 'ឯកឧត្តមបណ្ឌិត ឡាយ សុខលី',
  morningStartTime: '07:00',
  afternoonStartTime: '13:00',
};

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'គណិតវិទ្យា', nameEn: 'Mathematics', code: 'MATH', color: '#2563eb', weeklyPeriodsDefault: 6 },
  { id: 'sub-2', name: 'អក្សរសាស្ត្រខ្មែរ', nameEn: 'Khmer Literature', code: 'KHM', color: '#db2777', weeklyPeriodsDefault: 5 },
  { id: 'sub-3', name: 'រូបវិទ្យា', nameEn: 'Physics', code: 'PHYS', color: '#7c3aed', weeklyPeriodsDefault: 4 },
  { id: 'sub-4', name: 'គីមីវិទ្យា', nameEn: 'Chemistry', code: 'CHEM', color: '#059669', weeklyPeriodsDefault: 4 },
  { id: 'sub-5', name: 'ជីវវិទ្យា', nameEn: 'Biology', code: 'BIO', color: '#16a34a', weeklyPeriodsDefault: 4 },
  { id: 'sub-6', name: 'ប្រវត្តិវិទ្យា', nameEn: 'History', code: 'HIST', color: '#d97706', weeklyPeriodsDefault: 2 },
  { id: 'sub-7', name: 'ភូមិវិទ្យា', nameEn: 'Geography', code: 'GEO', color: '#0891b2', weeklyPeriodsDefault: 2 },
  { id: 'sub-8', name: 'ភាសាអង់គ្លេស', nameEn: 'English', code: 'ENG', color: '#4f46e5', weeklyPeriodsDefault: 4 },
  { id: 'sub-9', name: 'ពលរដ្ឋវិទ្យា', nameEn: 'Morality & Civics', code: 'MORAL', color: '#ea580c', weeklyPeriodsDefault: 2 },
  { id: 'sub-10', name: 'ព័ត៌មានវិទ្យា', nameEn: 'ICT & Computer', code: 'ICT', color: '#0284c7', weeklyPeriodsDefault: 2 },
  { id: 'sub-11', name: 'អប់រំកាយ និងកីឡា', nameEn: 'Physical Education', code: 'PE', color: '#84cc16', weeklyPeriodsDefault: 2 },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    name: 'សាស្ត្រាចារ្យ ឡុង វិបុល',
    gender: 'ប្រុស',
    phone: '012 889 901',
    email: 'vibol.long@sisowath.edu.kh',
    roomNumber: 'បន្ទប់ A101',
    subjectsTaught: ['sub-1'], // Math
    color: '#3b82f6',
    role: 'admin',
    maxWeeklyHours: 24,
  },
  {
    id: 'tch-2',
    name: 'អ្នកគ្រូ ចាន់ ស្រីមុំ',
    gender: 'ស្រី',
    phone: '098 776 543',
    email: 'sreymom.chan@sisowath.edu.kh',
    roomNumber: 'បន្ទប់ A102',
    subjectsTaught: ['sub-2'], // Khmer
    color: '#ec4899',
    role: 'teacher',
    maxWeeklyHours: 22,
  },
  {
    id: 'tch-3',
    name: 'លោកគ្រូ កែវ សុខា',
    gender: 'ប្រុស',
    phone: '017 334 556',
    email: 'sokha.keo@sisowath.edu.kh',
    roomNumber: 'បន្ទប់ B201 (Lab)',
    subjectsTaught: ['sub-3'], // Physics
    color: '#8b5cf6',
    role: 'teacher',
    maxWeeklyHours: 20,
  },
  {
    id: 'tch-4',
    name: 'អ្នកគ្រូ ហេង ម៉ាលីស',
    gender: 'ស្រី',
    phone: '092 112 233',
    email: 'malis.heng@sisowath.edu.kh',
    roomNumber: 'បន្ទប់ B202 (Lab)',
    subjectsTaught: ['sub-4', 'sub-5'], // Chemistry & Bio
    color: '#10b981',
    role: 'teacher',
    maxWeeklyHours: 22,
  },
  {
    id: 'tch-5',
    name: 'លោកគ្រូ ម៉ៅ ពិសិដ្ឋ',
    gender: 'ប្រុស',
    phone: '088 554 321',
    email: 'piseth.mao@sisowath.edu.kh',
    roomNumber: 'បន្ទប់ C301',
    subjectsTaught: ['sub-8'], // English
    color: '#6366f1',
    role: 'teacher',
    maxWeeklyHours: 20,
  },
  {
    id: 'tch-6',
    name: 'អ្នកគ្រូ រ័ត្ន ធីតា',
    gender: 'ស្រី',
    phone: '016 443 322',
    email: 'thida.rath@sisowath.edu.kh',
    roomNumber: 'បន្ទប់ C302',
    subjectsTaught: ['sub-6', 'sub-7'], // History & Geo
    color: '#f59e0b',
    role: 'teacher',
    maxWeeklyHours: 18,
  },
  {
    id: 'tch-7',
    name: 'លោកគ្រូ ស៊ន វ៉ាន់នី',
    gender: 'ប្រុស',
    phone: '093 998 877',
    email: 'vanny.sorn@sisowath.edu.kh',
    roomNumber: 'បន្ទប់កុំព្យូទ័រ Lab 1',
    subjectsTaught: ['sub-10'], // ICT
    color: '#06b6d4',
    role: 'teacher',
    maxWeeklyHours: 16,
  },
  {
    id: 'tch-8',
    name: 'លោកគ្រូ អ៊ុក ដារ៉ា',
    gender: 'ប្រុស',
    phone: '077 665 544',
    email: 'dara.ouk@sisowath.edu.kh',
    roomNumber: 'ទីលានកីឡា',
    subjectsTaught: ['sub-11', 'sub-9'], // PE & Civics
    color: '#84cc16',
    role: 'teacher',
    maxWeeklyHours: 18,
  },
];

export const INITIAL_CLASSES: ClassGroup[] = [
  { id: 'cls-1', name: 'ថ្នាក់ទី ៧A', gradeLevel: 7, shift: 'morning', homeroomTeacherId: 'tch-1', defaultRoom: 'បន្ទប់ A101', studentCount: 42 },
  { id: 'cls-2', name: 'ថ្នាក់ទី ៧B', gradeLevel: 7, shift: 'morning', homeroomTeacherId: 'tch-2', defaultRoom: 'បន្ទប់ A102', studentCount: 40 },
  { id: 'cls-3', name: 'ថ្នាក់ទី ៨A', gradeLevel: 8, shift: 'morning', homeroomTeacherId: 'tch-3', defaultRoom: 'បន្ទប់ A103', studentCount: 44 },
  { id: 'cls-4', name: 'ថ្នាក់ទី ៩A', gradeLevel: 9, shift: 'morning', homeroomTeacherId: 'tch-5', defaultRoom: 'បន្ទប់ A104', studentCount: 38 },
  { id: 'cls-5', name: 'ថ្នាក់ទី ១០A', gradeLevel: 10, shift: 'afternoon', homeroomTeacherId: 'tch-4', defaultRoom: 'បន្ទប់ B201', studentCount: 39 },
  { id: 'cls-6', name: 'ថ្នាក់ទី ១១A', gradeLevel: 11, shift: 'afternoon', homeroomTeacherId: 'tch-6', defaultRoom: 'បន្ទប់ B202', studentCount: 36 },
  { id: 'cls-7', name: 'ថ្នាក់ទី ១២A', gradeLevel: 12, shift: 'afternoon', homeroomTeacherId: 'tch-7', defaultRoom: 'បន្ទប់ C301', studentCount: 45 },
];

export function generateTimeSlots(): TimeSlot[] {
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const morningTimes = [
    { period: 1, start: '07:00', end: '07:50' },
    { period: 2, start: '07:55', end: '08:45' },
    { period: 3, start: '09:00', end: '09:50' },
    { period: 4, start: '09:55', end: '10:45' },
    { period: 5, start: '10:50', end: '11:40' },
  ];

  const afternoonTimes = [
    { period: 1, start: '13:00', end: '13:50' },
    { period: 2, start: '13:55', end: '14:45' },
    { period: 3, start: '15:00', end: '15:50' },
    { period: 4, start: '15:55', end: '16:45' },
    { period: 5, start: '16:50', end: '17:40' },
  ];

  const slots: TimeSlot[] = [];

  for (const day of days) {
    // Morning
    for (const mt of morningTimes) {
      slots.push({
        id: `slot-m-${day}-${mt.period}`,
        dayOfWeek: day,
        shift: 'morning',
        periodNumber: mt.period,
        startTime: mt.start,
        endTime: mt.end,
        labelKh: `ម៉ោងទី ${mt.period} (${mt.start} - ${mt.end})`,
      });
    }
    // Afternoon
    for (const at of afternoonTimes) {
      slots.push({
        id: `slot-a-${day}-${at.period}`,
        dayOfWeek: day,
        shift: 'afternoon',
        periodNumber: at.period,
        startTime: at.start,
        endTime: at.end,
        labelKh: `ម៉ោងទី ${at.period} (${at.start} - ${at.end})`,
      });
    }
  }

  return slots;
}

export const INITIAL_TIMESLOTS = generateTimeSlots();

// Generate high quality sample schedules for Class 7A and 7B
export const INITIAL_SCHEDULES: ScheduleEntry[] = [
  // Class 7A (Morning)
  // Monday
  { id: 'sch-1', teacherId: 'tch-1', classId: 'cls-1', subjectId: 'sub-1', timeSlotId: 'slot-m-mon-1', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-2', teacherId: 'tch-1', classId: 'cls-1', subjectId: 'sub-1', timeSlotId: 'slot-m-mon-2', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-3', teacherId: 'tch-2', classId: 'cls-1', subjectId: 'sub-2', timeSlotId: 'slot-m-mon-3', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-4', teacherId: 'tch-5', classId: 'cls-1', subjectId: 'sub-8', timeSlotId: 'slot-m-mon-4', roomNumber: 'បន្ទប់ A101' },
  
  // Tuesday
  { id: 'sch-5', teacherId: 'tch-2', classId: 'cls-1', subjectId: 'sub-2', timeSlotId: 'slot-m-tue-1', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-6', teacherId: 'tch-3', classId: 'cls-1', subjectId: 'sub-3', timeSlotId: 'slot-m-tue-2', roomNumber: 'បន្ទប់ B201 (Lab)' },
  { id: 'sch-7', teacherId: 'tch-4', classId: 'cls-1', subjectId: 'sub-4', timeSlotId: 'slot-m-tue-3', roomNumber: 'បន្ទប់ B202 (Lab)' },
  { id: 'sch-8', teacherId: 'tch-6', classId: 'cls-1', subjectId: 'sub-6', timeSlotId: 'slot-m-tue-4', roomNumber: 'បន្ទប់ A101' },

  // Wednesday
  { id: 'sch-9', teacherId: 'tch-1', classId: 'cls-1', subjectId: 'sub-1', timeSlotId: 'slot-m-wed-1', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-10', teacherId: 'tch-5', classId: 'cls-1', subjectId: 'sub-8', timeSlotId: 'slot-m-wed-2', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-11', teacherId: 'tch-7', classId: 'cls-1', subjectId: 'sub-10', timeSlotId: 'slot-m-wed-3', roomNumber: 'បន្ទប់កុំព្យូទ័រ Lab 1' },
  { id: 'sch-12', teacherId: 'tch-8', classId: 'cls-1', subjectId: 'sub-11', timeSlotId: 'slot-m-wed-4', roomNumber: 'ទីលានកីឡា' },

  // Thursday
  { id: 'sch-13', teacherId: 'tch-2', classId: 'cls-1', subjectId: 'sub-2', timeSlotId: 'slot-m-thu-1', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-14', teacherId: 'tch-4', classId: 'cls-1', subjectId: 'sub-5', timeSlotId: 'slot-m-thu-2', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-15', teacherId: 'tch-3', classId: 'cls-1', subjectId: 'sub-3', timeSlotId: 'slot-m-thu-3', roomNumber: 'បន្ទប់ B201 (Lab)' },
  { id: 'sch-16', teacherId: 'tch-6', classId: 'cls-1', subjectId: 'sub-7', timeSlotId: 'slot-m-thu-4', roomNumber: 'បន្ទប់ A101' },

  // Friday
  { id: 'sch-17', teacherId: 'tch-1', classId: 'cls-1', subjectId: 'sub-1', timeSlotId: 'slot-m-fri-1', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-18', teacherId: 'tch-2', classId: 'cls-1', subjectId: 'sub-2', timeSlotId: 'slot-m-fri-2', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-19', teacherId: 'tch-8', classId: 'cls-1', subjectId: 'sub-9', timeSlotId: 'slot-m-fri-3', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-20', teacherId: 'tch-5', classId: 'cls-1', subjectId: 'sub-8', timeSlotId: 'slot-m-fri-4', roomNumber: 'បន្ទប់ A101' },

  // Saturday
  { id: 'sch-21', teacherId: 'tch-4', classId: 'cls-1', subjectId: 'sub-5', timeSlotId: 'slot-m-sat-1', roomNumber: 'បន្ទប់ A101' },
  { id: 'sch-22', teacherId: 'tch-1', classId: 'cls-1', subjectId: 'sub-1', timeSlotId: 'slot-m-sat-2', roomNumber: 'បន្ទប់ A101' },

  // Class 7B (Morning) - Carefully allocated without teacher or room conflict!
  // Monday
  { id: 'sch-23', teacherId: 'tch-2', classId: 'cls-2', subjectId: 'sub-2', timeSlotId: 'slot-m-mon-1', roomNumber: 'បន្ទប់ A102' },
  { id: 'sch-24', teacherId: 'tch-5', classId: 'cls-2', subjectId: 'sub-8', timeSlotId: 'slot-m-mon-2', roomNumber: 'បន្ទប់ A102' },
  { id: 'sch-25', teacherId: 'tch-1', classId: 'cls-2', subjectId: 'sub-1', timeSlotId: 'slot-m-mon-3', roomNumber: 'បន្ទប់ A102' },
  { id: 'sch-26', teacherId: 'tch-1', classId: 'cls-2', subjectId: 'sub-1', timeSlotId: 'slot-m-mon-4', roomNumber: 'បន្ទប់ A102' },

  // Tuesday
  { id: 'sch-27', teacherId: 'tch-1', classId: 'cls-2', subjectId: 'sub-1', timeSlotId: 'slot-m-tue-1', roomNumber: 'បន្ទប់ A102' },
  { id: 'sch-28', teacherId: 'tch-2', classId: 'cls-2', subjectId: 'sub-2', timeSlotId: 'slot-m-tue-2', roomNumber: 'បន្ទប់ A102' },
  { id: 'sch-29', teacherId: 'tch-6', classId: 'cls-2', subjectId: 'sub-6', timeSlotId: 'slot-m-tue-3', roomNumber: 'បន្ទប់ A102' },
  { id: 'sch-30', teacherId: 'tch-3', classId: 'cls-2', subjectId: 'sub-3', timeSlotId: 'slot-m-tue-4', roomNumber: 'បន្ទប់ B201 (Lab)' },

  // Class 8A (Morning)
  { id: 'sch-31', teacherId: 'tch-3', classId: 'cls-3', subjectId: 'sub-3', timeSlotId: 'slot-m-mon-1', roomNumber: 'បន្ទប់ A103' },
  { id: 'sch-32', teacherId: 'tch-4', classId: 'cls-3', subjectId: 'sub-4', timeSlotId: 'slot-m-mon-2', roomNumber: 'បន្ទប់ A103' },
  { id: 'sch-33', teacherId: 'tch-5', classId: 'cls-3', subjectId: 'sub-8', timeSlotId: 'slot-m-mon-3', roomNumber: 'បន្ទប់ A103' },
  { id: 'sch-34', teacherId: 'tch-2', classId: 'cls-3', subjectId: 'sub-2', timeSlotId: 'slot-m-mon-4', roomNumber: 'បន្ទប់ A103' },
];
