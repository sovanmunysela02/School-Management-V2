import { ScheduleEntry, Teacher, ClassGroup, Subject, TimeSlot, ConflictDetail } from '../types';

export interface ConflictValidationResult {
  hasConflict: boolean;
  conflicts: ConflictDetail[];
}

/**
 * Scans all schedules and detects any collisions:
 * 1. Same teacher at same timeSlot across multiple classes
 * 2. Same room at same timeSlot across multiple classes
 * 3. Same class at same timeSlot with multiple entries
 */
export function detectAllConflicts(
  schedules: ScheduleEntry[],
  teachers: Teacher[],
  classes: ClassGroup[],
  subjects: Subject[],
  timeSlots: TimeSlot[]
): ConflictDetail[] {
  const conflicts: ConflictDetail[] = [];
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const classMap = new Map(classes.map(c => [c.id, c]));
  const slotMap = new Map(timeSlots.map(s => [s.id, s]));

  // Group by timeSlotId
  const bySlot = new Map<string, ScheduleEntry[]>();
  for (const s of schedules) {
    if (!bySlot.has(s.timeSlotId)) {
      bySlot.set(s.timeSlotId, []);
    }
    bySlot.get(s.timeSlotId)!.push(s);
  }

  for (const [slotId, entries] of bySlot.entries()) {
    const slot = slotMap.get(slotId);
    const slotLabel = slot ? `${slot.dayOfWeek.toUpperCase()} - ${slot.labelKh}` : slotId;

    // 1. Check teacher collision
    const teacherUsage = new Map<string, ScheduleEntry[]>();
    for (const e of entries) {
      if (!teacherUsage.has(e.teacherId)) {
        teacherUsage.set(e.teacherId, []);
      }
      teacherUsage.get(e.teacherId)!.push(e);
    }

    for (const [tId, tEntries] of teacherUsage.entries()) {
      if (tEntries.length > 1) {
        const teacher = teacherMap.get(tId);
        const classNames = tEntries.map(e => classMap.get(e.classId)?.name || 'ថ្នាក់មិនស្គាល់').join(', ');
        conflicts.push({
          id: `conf-teacher-${slotId}-${tId}`,
          type: 'teacher',
          titleKh: `គ្រូជាន់គ្នាម៉ោងបង្រៀន: ${teacher?.name || 'គ្រូ'}`,
          descriptionKh: `${teacher?.name || 'គ្រូ'} ត្រូវបានចាត់តាំងបង្រៀនក្នុងពេលតែមួយនៅ ${slotLabel} សម្រាប់ថ្នាក់៖ ${classNames}`,
          timeSlotId: slotId,
          scheduleIds: tEntries.map(e => e.id),
        });
      }
    }

    // 2. Check room collision (only if room is specified and not empty)
    const roomUsage = new Map<string, ScheduleEntry[]>();
    for (const e of entries) {
      if (e.roomNumber && e.roomNumber.trim() !== '') {
        const normRoom = e.roomNumber.trim().toLowerCase();
        if (!roomUsage.has(normRoom)) {
          roomUsage.set(normRoom, []);
        }
        roomUsage.get(normRoom)!.push(e);
      }
    }

    for (const [room, rEntries] of roomUsage.entries()) {
      if (rEntries.length > 1) {
        const displayRoom = rEntries[0].roomNumber;
        const classNames = rEntries.map(e => classMap.get(e.classId)?.name || 'ថ្នាក់').join(' និង ');
        conflicts.push({
          id: `conf-room-${slotId}-${room}`,
          type: 'room',
          titleKh: `បន្ទប់រៀនជាន់គ្នា: ${displayRoom}`,
          descriptionKh: `${displayRoom} ត្រូវបានប្រើប្រាស់ក្នុងពេលតែមួយនៅ ${slotLabel} ដោយថ្នាក់ ${classNames}`,
          timeSlotId: slotId,
          scheduleIds: rEntries.map(e => e.id),
        });
      }
    }

    // 3. Check class collision (one class cannot have 2 schedules in the same slot)
    const classUsage = new Map<string, ScheduleEntry[]>();
    for (const e of entries) {
      if (!classUsage.has(e.classId)) {
        classUsage.set(e.classId, []);
      }
      classUsage.get(e.classId)!.push(e);
    }

    for (const [cId, cEntries] of classUsage.entries()) {
      if (cEntries.length > 1) {
        const cls = classMap.get(cId);
        conflicts.push({
          id: `conf-class-${slotId}-${cId}`,
          type: 'class',
          titleKh: `ថ្នាក់រៀនជាន់គ្នាមុខវិជ្ជា: ${cls?.name || 'ថ្នាក់'}`,
          descriptionKh: `${cls?.name || 'ថ្នាក់'} មានមុខវិជ្ជាលើសពីមួយក្នុងម៉ោងតែមួយ (${slotLabel})`,
          timeSlotId: slotId,
          scheduleIds: cEntries.map(e => e.id),
        });
      }
    }
  }

  return conflicts;
}

/**
 * Validates a single proposed schedule entry before saving
 */
export function validateProposedSlot(params: {
  teacherId: string;
  classId: string;
  roomNumber: string;
  timeSlotId: string;
  excludeScheduleId?: string;
  schedules: ScheduleEntry[];
  teachers: Teacher[];
  classes: ClassGroup[];
}): ConflictValidationResult {
  const { teacherId, classId, roomNumber, timeSlotId, excludeScheduleId, schedules, teachers, classes } = params;
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const classMap = new Map(classes.map(c => [c.id, c]));

  const relevant = schedules.filter(s => s.id !== excludeScheduleId && s.timeSlotId === timeSlotId);
  const conflicts: ConflictDetail[] = [];

  // Check teacher conflict
  const teacherCollision = relevant.find(s => s.teacherId === teacherId);
  if (teacherCollision) {
    const teacher = teacherMap.get(teacherId);
    const otherClass = classMap.get(teacherCollision.classId);
    conflicts.push({
      id: `val-teacher-${teacherId}`,
      type: 'teacher',
      titleKh: `គ្រូបង្រៀនជាន់គ្នា!`,
      descriptionKh: `${teacher?.name || 'គ្រូ'} កំពុងបង្រៀនថ្នាក់ ${otherClass?.name || 'ផ្សេង'} ក្នុងម៉ោងនេះរួចហើយ!`,
      timeSlotId,
      scheduleIds: [teacherCollision.id],
    });
  }

  // Check room conflict
  if (roomNumber && roomNumber.trim() !== '') {
    const roomCollision = relevant.find(s => s.roomNumber.trim().toLowerCase() === roomNumber.trim().toLowerCase());
    if (roomCollision) {
      const otherClass = classMap.get(roomCollision.classId);
      conflicts.push({
        id: `val-room-${roomNumber}`,
        type: 'room',
        titleKh: `បន្ទប់រៀនជាន់គ្នា!`,
        descriptionKh: `${roomNumber} កំពុងត្រូវប្រើដោយថ្នាក់ ${otherClass?.name || 'ផ្សេង'} ក្នុងម៉ោងនេះរួចហើយ!`,
        timeSlotId,
        scheduleIds: [roomCollision.id],
      });
    }
  }

  // Check class conflict
  const classCollision = relevant.find(s => s.classId === classId);
  if (classCollision) {
    const cls = classMap.get(classId);
    conflicts.push({
      id: `val-class-${classId}`,
      type: 'class',
      titleKh: `ថ្នាក់រៀនមានម៉ោងរួចហើយ!`,
      descriptionKh: `ថ្នាក់ ${cls?.name || ''} មានមុខវិជ្ជាកំណត់ក្នុងម៉ោងនេះរួចហើយ។ ត្រូវលុប ឬជំនួសដើម្បីកែប្រែ។`,
      timeSlotId,
      scheduleIds: [classCollision.id],
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}
