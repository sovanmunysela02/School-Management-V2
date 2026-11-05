/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScheduleMatrixView } from './components/ScheduleMatrixView';
import { TeachersView } from './components/TeachersView';
import { ClassesView } from './components/ClassesView';
import { SubjectsView } from './components/SubjectsView';
import { SettingsView } from './components/SettingsView';
import { ScheduleModal } from './components/ScheduleModal';
import { AutoSchedulerModal } from './components/AutoSchedulerModal';
import { ConflictWarningDrawer } from './components/ConflictWarningDrawer';
import { PrintableView } from './components/PrintableView';
import { api } from './services/api';
import { 
  Teacher, 
  ClassGroup, 
  Subject, 
  TimeSlot, 
  ScheduleEntry, 
  SchoolInfo, 
  ConflictDetail, 
  UserRole 
} from './types';
import {
  INITIAL_CLASSES,
  INITIAL_SCHOOL_INFO,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_TIMESLOTS,
  INITIAL_SCHEDULES,
} from './data/initialData';
import { detectAllConflicts } from './utils/conflicts';
import { exportTimetableToExcel } from './utils/exportUtils';

export default function App() {
  // App state
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [classes, setClasses] = useState<ClassGroup[]>(INITIAL_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(INITIAL_TIMESLOTS);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(INITIAL_SCHEDULES);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(INITIAL_SCHOOL_INFO);
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation & Role
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [activeTeacherId, setActiveTeacherId] = useState<string>(INITIAL_TEACHERS[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(INITIAL_CLASSES[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(INITIAL_TEACHERS[0]?.id || '');

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [defaultSlotId, setDefaultSlotId] = useState<string | undefined>();
  const [defaultClassForSlot, setDefaultClassForSlot] = useState<string | undefined>();
  const [defaultTeacherForSlot, setDefaultTeacherForSlot] = useState<string | undefined>();

  const [isAutoSchedulerOpen, setIsAutoSchedulerOpen] = useState(false);
  const [isConflictDrawerOpen, setIsConflictDrawerOpen] = useState(false);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-calculate conflicts whenever schedules, teachers, classes, subjects, or timeslots change
  const recomputeConflicts = useCallback(
    (currentSchedules: ScheduleEntry[], t = teachers, c = classes, s = subjects, ts = timeSlots) => {
      const detected = detectAllConflicts(currentSchedules, t, c, s, ts);
      setConflicts(detected);
    },
    [teachers, classes, subjects, timeSlots]
  );

  // Fetch initial data from backend API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchAllData();
      if (data) {
        setTeachers(data.teachers || INITIAL_TEACHERS);
        setClasses(data.classes || INITIAL_CLASSES);
        setSubjects(data.subjects || INITIAL_SUBJECTS);
        setTimeSlots(data.timeSlots || INITIAL_TIMESLOTS);
        setSchedules(data.schedules || INITIAL_SCHEDULES);
        setSchoolInfo(data.schoolInfo || INITIAL_SCHOOL_INFO);
        if (data.teachers && data.teachers.length > 0 && !activeTeacherId) {
          setActiveTeacherId(data.teachers[0].id);
        }
        recomputeConflicts(
          data.schedules || INITIAL_SCHEDULES,
          data.teachers || INITIAL_TEACHERS,
          data.classes || INITIAL_CLASSES,
          data.subjects || INITIAL_SUBJECTS,
          data.timeSlots || INITIAL_TIMESLOTS
        );
      }
    } catch (err) {
      console.warn('Backend loading note, using local state:', err);
      recomputeConflicts(schedules, teachers, classes, subjects, timeSlots);
    } finally {
      setIsLoading(false);
    }
  }, [activeTeacherId, recomputeConflicts, schedules, teachers, classes, subjects, timeSlots]);

  useEffect(() => {
    loadData();
  }, []);

  // Sync role switch: If switched to teacher role, auto switch timetable view to that teacher
  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    if (role === 'teacher') {
      const targetId = activeTeacherId || teachers[0]?.id;
      if (targetId) {
        setSelectedTeacherId(targetId);
      }
    }
  };

  // Handlers for Schedule Slot CRUD
  const handleOpenNewSlot = (slotId?: string, classId?: string, teacherId?: string) => {
    setEditingSchedule(null);
    setDefaultSlotId(slotId);
    setDefaultClassForSlot(classId || selectedClassId);
    setDefaultTeacherForSlot(teacherId || (userRole === 'teacher' ? activeTeacherId : undefined));
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (entry: ScheduleEntry) => {
    setEditingSchedule(entry);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (entry: Omit<ScheduleEntry, 'id'>, force = false) => {
    if (editingSchedule) {
      await api.updateSchedule(editingSchedule.id, entry, force);
      const updated = schedules.map(s => (s.id === editingSchedule.id ? { ...s, ...entry } : s));
      setSchedules(updated);
      recomputeConflicts(updated);
      showToast('បានកែប្រែកាលវិភាគជោគជ័យ!');
    } else {
      const created = await api.addSchedule(entry, force);
      const updated = [...schedules, created];
      setSchedules(updated);
      recomputeConflicts(updated);
      showToast('បានចាត់តាំងម៉ោងបង្រៀនជោគជ័យ!');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    await api.deleteSchedule(id);
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    recomputeConflicts(updated);
    showToast('បានលុបម៉ោងបង្រៀនរួចរាល់!');
  };

  const handleClearClassSchedule = async (classId: string) => {
    const clsName = classes.find(c => c.id === classId)?.name || 'ថ្នាក់';
    if (window.confirm(`តើអ្នកពិតជាចង់សម្អាតកាលវិភាគទាំងអស់របស់ ${clsName} មែនទេ?`)) {
      await api.clearSchedules(classId);
      const updated = schedules.filter(s => s.classId !== classId);
      setSchedules(updated);
      recomputeConflicts(updated);
      showToast(`បានសម្អាតកាលវិភាគ ${clsName} រួចរាល់!`);
    }
  };

  const handleAutoScheduleClass = async (classId: string) => {
    const clsName = classes.find(c => c.id === classId)?.name || 'ថ្នាក់';
    try {
      const res = await api.autoGenerateSchedules([classId], true);
      await loadData();
      showToast(`បានរៀបចំស្វ័យប្រវត្តិចំនួន ${res.totalAllocated} ម៉ោងសម្រាប់ ${clsName}!`);
    } catch (err: any) {
      alert(err.message || 'បរាជ័យក្នុងការរៀបចំ');
    }
  };

  // Teachers CRUD
  const handleAddTeacher = async (t: Omit<Teacher, 'id'>) => {
    const created = await api.addTeacher(t);
    setTeachers(prev => [...prev, created]);
    showToast(`បានបន្ថែមគ្រូបង្រៀន ${created.name} ជោគជ័យ!`);
  };

  const handleUpdateTeacher = async (id: string, t: Partial<Teacher>) => {
    const updated = await api.updateTeacher(id, t);
    setTeachers(prev => prev.map(item => (item.id === id ? updated : item)));
    showToast('បានកែប្រែព័ត៌មានគ្រូរួចរាល់!');
  };

  const handleDeleteTeacher = async (id: string) => {
    const tch = teachers.find(t => t.id === id);
    if (window.confirm(`តើអ្នកពិតជាចង់លុបគ្រូ "${tch?.name}" មែនទេ? ម៉ោងបង្រៀនទាំងអស់របស់គាត់នឹងត្រូវលុបផងដែរ។`)) {
      await api.deleteTeacher(id);
      setTeachers(prev => prev.filter(t => t.id !== id));
      const updatedSchedules = schedules.filter(s => s.teacherId !== id);
      setSchedules(updatedSchedules);
      recomputeConflicts(updatedSchedules);
      showToast('បានលុបគ្រូបង្រៀនរួចរាល់!');
    }
  };

  // Classes CRUD
  const handleAddClass = async (c: Omit<ClassGroup, 'id'>) => {
    const created = await api.addClass(c);
    setClasses(prev => [...prev, created]);
    showToast(`បានបន្ថែម ${created.name} ជោគជ័យ!`);
  };

  const handleUpdateClass = async (id: string, c: Partial<ClassGroup>) => {
    const updated = await api.updateClass(id, c);
    setClasses(prev => prev.map(item => (item.id === id ? updated : item)));
    showToast('បានកែប្រែថ្នាក់រៀនរួចរាល់!');
  };

  const handleDeleteClass = async (id: string) => {
    const cls = classes.find(c => c.id === id);
    if (window.confirm(`តើអ្នកពិតជាចង់លុប "${cls?.name}" មែនទេ? កាលវិភាគរបស់ថ្នាក់នេះនឹងត្រូវលុបផងដែរ។`)) {
      await api.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      const updatedSchedules = schedules.filter(s => s.classId !== id);
      setSchedules(updatedSchedules);
      recomputeConflicts(updatedSchedules);
      showToast('បានលុបថ្នាក់រៀនរួចរាល់!');
    }
  };

  // Subjects CRUD
  const handleAddSubject = async (s: Omit<Subject, 'id'>) => {
    const created = await api.addSubject(s);
    setSubjects(prev => [...prev, created]);
    showToast(`បានបន្ថែមមុខវិជ្ជា ${created.name} ជោគជ័យ!`);
  };

  const handleUpdateSubject = async (id: string, s: Partial<Subject>) => {
    const updated = await api.updateSubject(id, s);
    setSubjects(prev => prev.map(item => (item.id === id ? updated : item)));
    showToast('បានកែប្រែមុខវិជ្ជារួចរាល់!');
  };

  const handleDeleteSubject = async (id: string) => {
    const sub = subjects.find(s => s.id === id);
    if (window.confirm(`តើអ្នកពិតជាចង់លុបមុខវិជ្ជា "${sub?.name}" មែនទេ?`)) {
      await api.deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      const updatedSchedules = schedules.filter(s => s.subjectId !== id);
      setSchedules(updatedSchedules);
      recomputeConflicts(updatedSchedules);
      showToast('បានលុបមុខវិជ្ជារួចរាល់!');
    }
  };

  // School Info
  const handleUpdateSchoolInfo = async (info: Partial<SchoolInfo>) => {
    const updated = await api.updateSchoolInfo(info);
    setSchoolInfo(updated);
    showToast('បានកែប្រែព័ត៌មានសាលារួចរាល់!');
  };

  // Reset to Sample
  const handleResetSample = async () => {
    await api.resetToSample();
    await loadData();
    showToast('ទិន្នន័យគំរូត្រូវបានកំណត់ឡើងវិញជោគជ័យ!');
  };

  // Export to Excel
  const handleExportExcel = () => {
    const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];
    const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
    const isClassView = currentTab === 'timetable' || true;
    const targetName = isClassView ? activeClass?.name || 'ថ្នាក់រៀន' : activeTeacher?.name || 'គ្រូ';

    exportTimetableToExcel({
      title: `កាលវិភាគបង្រៀន និងរៀន៖ ${targetName}`,
      schedules,
      teachers,
      classes,
      subjects,
      timeSlots,
      schoolInfo,
      viewType: isClassView ? 'class' : 'teacher',
      selectedEntityName: targetName,
    });
    showToast('បានទាញយកឯកសារ Excel ជោគជ័យ!');
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Full data json helper for backup
  const getFullDataJson = () => {
    return JSON.stringify(
      {
        teachers,
        classes,
        subjects,
        timeSlots,
        schedules,
        schoolInfo,
      },
      null,
      2
    );
  };

  const handleRestoreDataJson = async (jsonString: string) => {
    const parsed = JSON.parse(jsonString);
    if (parsed.teachers && parsed.classes && parsed.subjects && parsed.schedules) {
      setTeachers(parsed.teachers);
      setClasses(parsed.classes);
      setSubjects(parsed.subjects);
      setTimeSlots(parsed.timeSlots || INITIAL_TIMESLOTS);
      setSchedules(parsed.schedules);
      if (parsed.schoolInfo) setSchoolInfo(parsed.schoolInfo);
      recomputeConflicts(parsed.schedules, parsed.teachers, parsed.classes, parsed.subjects, parsed.timeSlots || INITIAL_TIMESLOTS);
      showToast('បានស្តារទិន្នន័យពី JSON ជោគជ័យ!');
    } else {
      throw new Error('ទម្រង់ទិន្នន័យមិនត្រូវគ្នា!');
    }
  };

  // Active print entity
  const printEntityName = useMemo(() => {
    const activeClass = classes.find(c => c.id === selectedClassId);
    return activeClass?.name || 'ថ្នាក់ទី ៧A';
  }, [classes, selectedClassId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 no-print">
          {toastMessage}
        </div>
      )}

      {/* Screen layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          conflictCount={conflicts.length}
          totalTeachers={teachers.length}
          totalClasses={classes.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar */}
          <Navbar
            schoolInfo={schoolInfo}
            userRole={userRole}
            setUserRole={handleSetUserRole}
            activeTeacherId={activeTeacherId}
            setActiveTeacherId={(id) => {
              setActiveTeacherId(id);
              setSelectedTeacherId(id);
            }}
            teachers={teachers}
            conflictCount={conflicts.length}
            onOpenNewScheduleModal={() => handleOpenNewSlot()}
            onOpenAutoSchedulerModal={() => setIsAutoSchedulerOpen(true)}
            onOpenConflictDrawer={() => setIsConflictDrawerOpen(true)}
            onPrint={handlePrint}
            onExportExcel={handleExportExcel}
          />

          {/* Main Views */}
          <main className="flex-1 no-print">
            {currentTab === 'dashboard' && (
              <DashboardView
                teachers={teachers}
                classes={classes}
                subjects={subjects}
                timeSlots={timeSlots}
                schedules={schedules}
                conflicts={conflicts}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
                onOpenAutoScheduler={() => setIsAutoSchedulerOpen(true)}
                onOpenNewSchedule={() => handleOpenNewSlot()}
              />
            )}

            {currentTab === 'timetable' && (
              <ScheduleMatrixView
                teachers={teachers}
                classes={classes}
                subjects={subjects}
                timeSlots={timeSlots}
                schedules={schedules}
                conflicts={conflicts}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                selectedTeacherId={selectedTeacherId}
                setSelectedTeacherId={setSelectedTeacherId}
                onOpenNewSlot={handleOpenNewSlot}
                onEditSlot={handleEditSchedule}
                onDeleteSlot={handleDeleteSchedule}
                onClearClassSchedule={handleClearClassSchedule}
                onAutoScheduleClass={handleAutoScheduleClass}
                onPrint={handlePrint}
                onExportExcel={handleExportExcel}
                isAdmin={userRole === 'admin'}
              />
            )}

            {currentTab === 'teachers' && (
              <TeachersView
                teachers={teachers}
                subjects={subjects}
                schedules={schedules}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onViewTeacherSchedule={(teacherId) => {
                  setSelectedTeacherId(teacherId);
                  setCurrentTab('timetable');
                }}
                isAdmin={userRole === 'admin'}
              />
            )}

            {currentTab === 'classes' && (
              <ClassesView
                classes={classes}
                teachers={teachers}
                schedules={schedules}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onViewClassSchedule={(classId) => {
                  setSelectedClassId(classId);
                  setCurrentTab('timetable');
                }}
                isAdmin={userRole === 'admin'}
              />
            )}

            {currentTab === 'subjects' && (
              <SubjectsView
                subjects={subjects}
                teachers={teachers}
                schedules={schedules}
                onAddSubject={handleAddSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
                isAdmin={userRole === 'admin'}
              />
            )}

            {currentTab === 'conflicts' && (
              <div className="p-6 max-w-4xl mx-auto">
                <ConflictWarningDrawer
                  isOpen={true}
                  onClose={() => setCurrentTab('timetable')}
                  conflicts={conflicts}
                  schedules={schedules}
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  timeSlots={timeSlots}
                  onEditSchedule={(sch) => {
                    handleEditSchedule(sch);
                  }}
                  onDeleteSchedule={handleDeleteSchedule}
                />
              </div>
            )}

            {currentTab === 'settings' && (
              <SettingsView
                schoolInfo={schoolInfo}
                onUpdateSchoolInfo={handleUpdateSchoolInfo}
                onResetSample={handleResetSample}
                getFullDataJson={getFullDataJson}
                onRestoreDataJson={handleRestoreDataJson}
              />
            )}
          </main>
        </div>
      </div>

      {/* Official Print Layout (Only visible in window.print()) */}
      <PrintableView
        schoolInfo={schoolInfo}
        viewType="class"
        entityName={printEntityName}
        schedules={schedules.filter(s => s.classId === selectedClassId)}
        teachers={teachers}
        classes={classes}
        subjects={subjects}
        timeSlots={timeSlots}
      />

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        editEntry={editingSchedule}
        defaultTimeSlotId={defaultSlotId}
        defaultClassId={defaultClassForSlot}
        defaultTeacherId={defaultTeacherForSlot}
        teachers={teachers}
        classes={classes}
        subjects={subjects}
        timeSlots={timeSlots}
        schedules={schedules}
      />

      <AutoSchedulerModal
        isOpen={isAutoSchedulerOpen}
        onClose={() => setIsAutoSchedulerOpen(false)}
        classes={classes}
        onRunAutoSchedule={async (targetClassIds, clearExisting) => {
          const res = await api.autoGenerateSchedules(targetClassIds, clearExisting);
          await loadData();
          return res;
        }}
      />

      {/* Conflict Drawer (when opened via Navbar alert badge) */}
      <ConflictWarningDrawer
        isOpen={isConflictDrawerOpen}
        onClose={() => setIsConflictDrawerOpen(false)}
        conflicts={conflicts}
        schedules={schedules}
        teachers={teachers}
        classes={classes}
        subjects={subjects}
        timeSlots={timeSlots}
        onEditSchedule={(sch) => {
          setIsConflictDrawerOpen(false);
          handleEditSchedule(sch);
        }}
        onDeleteSchedule={handleDeleteSchedule}
      />
    </div>
  );
}
