import { AppStateData, ClassGroup, ScheduleEntry, SchoolInfo, Subject, Teacher } from '../types';

export const api = {
  async fetchAllData(): Promise<AppStateData & { conflicts: any[] }> {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('បរាជ័យក្នុងការទាញយកទិន្នន័យ');
    return res.json();
  },

  // Teachers
  async addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការបន្ថែមគ្រូបង្រៀន');
    return res.json();
  },

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher> {
    const res = await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការកែប្រែព័ត៌មានគ្រូ');
    return res.json();
  },

  async deleteTeacher(id: string): Promise<void> {
    const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការលុបគ្រូ');
  },

  // Classes
  async addClass(cls: Omit<ClassGroup, 'id'>): Promise<ClassGroup> {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cls),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការបន្ថែមថ្នាក់រៀន');
    return res.json();
  },

  async updateClass(id: string, cls: Partial<ClassGroup>): Promise<ClassGroup> {
    const res = await fetch(`/api/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cls),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការកែប្រែថ្នាក់រៀន');
    return res.json();
  },

  async deleteClass(id: string): Promise<void> {
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការលុបថ្នាក់រៀន');
  },

  // Subjects
  async addSubject(sub: Omit<Subject, 'id'>): Promise<Subject> {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការបន្ថែមមុខវិជ្ជា');
    return res.json();
  },

  async updateSubject(id: string, sub: Partial<Subject>): Promise<Subject> {
    const res = await fetch(`/api/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការកែប្រែមុខវិជ្ជា');
    return res.json();
  },

  async deleteSubject(id: string): Promise<void> {
    const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការលុបមុខវិជ្ជា');
  },

  // Schedules
  async validateSlot(params: {
    teacherId: string;
    classId: string;
    roomNumber: string;
    timeSlotId: string;
    excludeScheduleId?: string;
  }) {
    const res = await fetch('/api/schedules/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async addSchedule(entry: Omit<ScheduleEntry, 'id'>, force = false): Promise<ScheduleEntry> {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, force }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'បរាជ័យក្នុងការកំណត់កាលវិភាគ');
    }
    return res.json();
  },

  async updateSchedule(id: string, entry: Partial<ScheduleEntry>, force = false): Promise<ScheduleEntry> {
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, force }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'បរាជ័យក្នុងការកែប្រែកាលវិភាគ');
    }
    return res.json();
  },

  async deleteSchedule(id: string): Promise<void> {
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការលុបម៉ោងបង្រៀន');
  },

  async clearSchedules(classId?: string): Promise<void> {
    const res = await fetch('/api/schedules/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId }),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការសម្អាតកាលវិភាគ');
  },

  async autoGenerateSchedules(classIds?: string[], clearExisting = true): Promise<{
    totalAllocated: number;
    unallocatedReasons: string[];
    totalSchedules: number;
  }> {
    const res = await fetch('/api/schedules/auto-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classIds, clearExisting }),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការរៀបចំកាលវិភាគស្វ័យប្រវត្តិ');
    return res.json();
  },

  async updateSchoolInfo(info: Partial<SchoolInfo>): Promise<SchoolInfo> {
    const res = await fetch('/api/school-info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការកែប្រែព័ត៌មានសាលា');
    return res.json();
  },

  async resetToSample(): Promise<void> {
    const res = await fetch('/api/reset-sample', { method: 'POST' });
    if (!res.ok) throw new Error('បរាជ័យក្នុងការកំណត់ឡើងវិញ');
  },
};
