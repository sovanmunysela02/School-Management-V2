export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type ShiftType = 'morning' | 'afternoon';
export type UserRole = 'admin' | 'teacher';

export interface Teacher {
  id: string;
  name: string;
  gender: 'ប្រុស' | 'ស្រី';
  phone: string;
  email: string;
  roomNumber: string;
  subjectsTaught: string[]; // subject IDs
  color: string;
  role: UserRole;
  avatar?: string;
  maxWeeklyHours?: number;
}

export interface ClassGroup {
  id: string;
  name: string; // e.g., ថ្នាក់ទី ៧A
  gradeLevel: number; // 7, 8, 9, 10, 11, 12
  shift: ShiftType;
  homeroomTeacherId?: string;
  defaultRoom: string;
  studentCount?: number;
}

export interface Subject {
  id: string;
  name: string; // e.g., គណិតវិទ្យា
  nameEn?: string;
  code: string; // e.g., MATH
  color: string;
  weeklyPeriodsDefault: number;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  shift: ShiftType;
  periodNumber: number; // 1, 2, 3, 4, 5
  startTime: string; // e.g. "07:00"
  endTime: string;   // e.g. "07:50"
  labelKh: string;   // e.g. "ម៉ោងទី ១ (០៧:០០ - ០៧:៥០)"
}

export interface ScheduleEntry {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  timeSlotId: string;
  roomNumber: string;
}

export interface ConflictDetail {
  id: string;
  type: 'teacher' | 'room' | 'class';
  titleKh: string;
  descriptionKh: string;
  timeSlotId: string;
  scheduleIds: string[];
}

export interface SchoolInfo {
  nameKh: string;
  nameEn: string;
  province: string;
  academicYear: string;
  principalName: string;
  morningStartTime: string;
  afternoonStartTime: string;
}

export interface AppStateData {
  teachers: Teacher[];
  classes: ClassGroup[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  schedules: ScheduleEntry[];
  schoolInfo: SchoolInfo;
}
