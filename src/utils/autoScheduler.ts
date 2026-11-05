import { ScheduleEntry, Teacher, ClassGroup, Subject, TimeSlot } from '../types';

export interface AutoScheduleOptions {
  classIds: string[];
  clearExisting: boolean;
  respectMaxPeriodsPerDay?: boolean;
}

export interface AutoScheduleResult {
  newSchedules: ScheduleEntry[];
  totalAllocated: number;
  unallocatedReasons: string[];
}

export function runAutoSchedulingAlgorithm(
  targetClassIds: string[],
  clearExisting: boolean,
  currentSchedules: ScheduleEntry[],
  teachers: Teacher[],
  classes: ClassGroup[],
  subjects: Subject[],
  timeSlots: TimeSlot[]
): AutoScheduleResult {
  // If clearExisting, filter out schedules of target classes, otherwise keep them
  let workingSchedules: ScheduleEntry[] = clearExisting
    ? currentSchedules.filter(s => !targetClassIds.includes(s.classId))
    : [...currentSchedules];

  const unallocatedReasons: string[] = [];
  let totalAllocated = 0;

  const targetClasses = classes.filter(c => targetClassIds.includes(c.id));

  for (const cls of targetClasses) {
    // Filter timeslots appropriate for this class's shift (morning / afternoon)
    const classShiftSlots = timeSlots.filter(s => s.shift === cls.shift);

    // Build requirement list for this class
    // Priority order: Math, Khmer, English, Physics, Chem, Bio, History, Geo, ICT, Moral, PE
    const requiredSubjectAllocations: { subject: Subject; periodsNeeded: number }[] = [];
    for (const sub of subjects) {
      // Find how many already exist if not clearing
      const alreadyAssignedCount = workingSchedules.filter(
        s => s.classId === cls.id && s.subjectId === sub.id
      ).length;
      const needed = Math.max(0, sub.weeklyPeriodsDefault - alreadyAssignedCount);
      if (needed > 0) {
        requiredSubjectAllocations.push({ subject: sub, periodsNeeded: needed });
      }
    }

    // Sort subjects by priority/periods descending
    requiredSubjectAllocations.sort((a, b) => b.periodsNeeded - a.periodsNeeded);

    for (const req of requiredSubjectAllocations) {
      const { subject, periodsNeeded } = req;

      // Find eligible teachers who can teach this subject
      const eligibleTeachers = teachers.filter(t => t.subjectsTaught.includes(subject.id));
      if (eligibleTeachers.length === 0) {
        unallocatedReasons.push(`គ្មានគ្រូដែលបង្រៀនមុខវិជ្ជា ${subject.name} សម្រាប់ថ្នាក់ ${cls.name}`);
        continue;
      }

      let periodsAllocated = 0;

      // Iterate through days to distribute evenly
      const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

      for (let pass = 0; pass < periodsNeeded; pass++) {
        let placed = false;

        // Try candidate slots
        for (const day of daysOrder) {
          if (placed) break;

          // Check how many periods of this subject already placed today in this class
          const countToday = workingSchedules.filter(s => {
            const slot = timeSlots.find(ts => ts.id === s.timeSlotId);
            return s.classId === cls.id && s.subjectId === subject.id && slot?.dayOfWeek === day;
          }).length;

          // Max 2 periods of the same subject on the same day
          if (countToday >= 2) continue;

          // Find slots for this day and class shift
          const availableSlotsForDay = classShiftSlots.filter(s => s.dayOfWeek === day);

          for (const slot of availableSlotsForDay) {
            // 1. Is this class already booked at this slot?
            const isClassBooked = workingSchedules.some(
              s => s.classId === cls.id && s.timeSlotId === slot.id
            );
            if (isClassBooked) continue;

            // 2. Find an eligible teacher free at this slot
            const freeTeacher = eligibleTeachers.find(t => {
              return !workingSchedules.some(
                s => s.teacherId === t.id && s.timeSlotId === slot.id
              );
            });
            if (!freeTeacher) continue;

            // 3. Room availability check
            const roomToUse = cls.defaultRoom || freeTeacher.roomNumber || `បន្ទប់ ${cls.name}`;
            const isRoomBooked = workingSchedules.some(
              s => s.roomNumber.toLowerCase() === roomToUse.toLowerCase() && s.timeSlotId === slot.id
            );

            // If primary room booked, fallback to teacher room or generic room
            let finalRoom = roomToUse;
            if (isRoomBooked) {
              const altRoom = `បន្ទប់បម្រុង ${cls.name}`;
              const isAltBooked = workingSchedules.some(
                s => s.roomNumber.toLowerCase() === altRoom.toLowerCase() && s.timeSlotId === slot.id
              );
              if (!isAltBooked) {
                finalRoom = altRoom;
              } else {
                continue; // Skip if no room available
              }
            }

            // Assign!
            const newEntry: ScheduleEntry = {
              id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              classId: cls.id,
              teacherId: freeTeacher.id,
              subjectId: subject.id,
              timeSlotId: slot.id,
              roomNumber: finalRoom,
            };

            workingSchedules.push(newEntry);
            periodsAllocated++;
            totalAllocated++;
            placed = true;
            break;
          }
        }

        if (!placed) {
          unallocatedReasons.push(`ខ្វះម៉ោងទំនេរសម្រាប់មុខវិជ្ជា ${subject.name} ក្នុងថ្នាក់ ${cls.name}`);
          break;
        }
      }
    }
  }

  return {
    newSchedules: workingSchedules,
    totalAllocated,
    unallocatedReasons,
  };
}
