import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  INITIAL_CLASSES,
  INITIAL_SCHOOL_INFO,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_TIMESLOTS,
  INITIAL_SCHEDULES,
} from './src/data/initialData.ts';
import { AppStateData, ScheduleEntry } from './src/types.ts';
import { detectAllConflicts, validateProposedSlot } from './src/utils/conflicts.ts';
import { runAutoSchedulingAlgorithm } from './src/utils/autoScheduler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data_store.json');

// Initialize state
function loadInitialState(): AppStateData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to load saved state, using default:', err);
  }

  return {
    teachers: INITIAL_TEACHERS,
    classes: INITIAL_CLASSES,
    subjects: INITIAL_SUBJECTS,
    timeSlots: INITIAL_TIMESLOTS,
    schedules: INITIAL_SCHEDULES,
    schoolInfo: INITIAL_SCHOOL_INFO,
  };
}

let appState: AppStateData = loadInitialState();

function persistState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save state to file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  // 1. Get all app data
  app.get('/api/data', (_req: Request, res: Response) => {
    res.json({
      ...appState,
      conflicts: detectAllConflicts(
        appState.schedules,
        appState.teachers,
        appState.classes,
        appState.subjects,
        appState.timeSlots
      ),
    });
  });

  // 2. Teachers CRUD
  app.get('/api/teachers', (_req: Request, res: Response) => {
    res.json(appState.teachers);
  });

  app.post('/api/teachers', (req: Request, res: Response) => {
    const newTeacher = {
      ...req.body,
      id: req.body.id || `tch-${Date.now()}`,
    };
    appState.teachers.push(newTeacher);
    persistState();
    res.status(201).json(newTeacher);
  });

  app.put('/api/teachers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = appState.teachers.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    appState.teachers[index] = { ...appState.teachers[index], ...req.body, id };
    persistState();
    res.json(appState.teachers[index]);
  });

  app.delete('/api/teachers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    appState.teachers = appState.teachers.filter(t => t.id !== id);
    // Also remove schedules associated with this teacher
    appState.schedules = appState.schedules.filter(s => s.teacherId !== id);
    persistState();
    res.json({ success: true, removedId: id });
  });

  // 3. Classes CRUD
  app.get('/api/classes', (_req: Request, res: Response) => {
    res.json(appState.classes);
  });

  app.post('/api/classes', (req: Request, res: Response) => {
    const newClass = {
      ...req.body,
      id: req.body.id || `cls-${Date.now()}`,
    };
    appState.classes.push(newClass);
    persistState();
    res.status(201).json(newClass);
  });

  app.put('/api/classes/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = appState.classes.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }
    appState.classes[index] = { ...appState.classes[index], ...req.body, id };
    persistState();
    res.json(appState.classes[index]);
  });

  app.delete('/api/classes/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    appState.classes = appState.classes.filter(c => c.id !== id);
    appState.schedules = appState.schedules.filter(s => s.classId !== id);
    persistState();
    res.json({ success: true, removedId: id });
  });

  // 4. Subjects CRUD
  app.get('/api/subjects', (_req: Request, res: Response) => {
    res.json(appState.subjects);
  });

  app.post('/api/subjects', (req: Request, res: Response) => {
    const newSubject = {
      ...req.body,
      id: req.body.id || `sub-${Date.now()}`,
    };
    appState.subjects.push(newSubject);
    persistState();
    res.status(201).json(newSubject);
  });

  app.put('/api/subjects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = appState.subjects.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    appState.subjects[index] = { ...appState.subjects[index], ...req.body, id };
    persistState();
    res.json(appState.subjects[index]);
  });

  app.delete('/api/subjects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    appState.subjects = appState.subjects.filter(s => s.id !== id);
    appState.schedules = appState.schedules.filter(s => s.subjectId !== id);
    persistState();
    res.json({ success: true, removedId: id });
  });

  // 5. Schedules CRUD & Queries
  app.get('/api/schedules', (_req: Request, res: Response) => {
    res.json(appState.schedules);
  });

  app.get('/api/schedules/teacher/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const teacherSchedules = appState.schedules.filter(s => s.teacherId === id);
    res.json(teacherSchedules);
  });

  app.get('/api/schedules/class/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const classSchedules = appState.schedules.filter(s => s.classId === id);
    res.json(classSchedules);
  });

  // Validate endpoint for conflict prevention
  app.post('/api/schedules/validate', (req: Request, res: Response) => {
    const { teacherId, classId, roomNumber, timeSlotId, excludeScheduleId } = req.body;
    const validation = validateProposedSlot({
      teacherId,
      classId,
      roomNumber,
      timeSlotId,
      excludeScheduleId,
      schedules: appState.schedules,
      teachers: appState.teachers,
      classes: appState.classes,
    });
    res.json(validation);
  });

  // Add new schedule slot
  app.post('/api/schedules', (req: Request, res: Response) => {
    const { teacherId, classId, subjectId, timeSlotId, roomNumber, force } = req.body;

    if (!force) {
      const validation = validateProposedSlot({
        teacherId,
        classId,
        roomNumber,
        timeSlotId,
        schedules: appState.schedules,
        teachers: appState.teachers,
        classes: appState.classes,
      });

      if (validation.hasConflict) {
        return res.status(409).json({
          error: 'មានការជាន់គ្នានៃកាលវិភាគ',
          conflicts: validation.conflicts,
        });
      }
    }

    const newSchedule: ScheduleEntry = {
      id: req.body.id || `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      teacherId,
      classId,
      subjectId,
      timeSlotId,
      roomNumber: roomNumber || '',
    };

    appState.schedules.push(newSchedule);
    persistState();
    res.status(201).json(newSchedule);
  });

  // Update schedule slot
  app.put('/api/schedules/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { teacherId, classId, subjectId, timeSlotId, roomNumber, force } = req.body;

    const index = appState.schedules.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    if (!force) {
      const validation = validateProposedSlot({
        teacherId: teacherId || appState.schedules[index].teacherId,
        classId: classId || appState.schedules[index].classId,
        roomNumber: roomNumber !== undefined ? roomNumber : appState.schedules[index].roomNumber,
        timeSlotId: timeSlotId || appState.schedules[index].timeSlotId,
        excludeScheduleId: id,
        schedules: appState.schedules,
        teachers: appState.teachers,
        classes: appState.classes,
      });

      if (validation.hasConflict) {
        return res.status(409).json({
          error: 'មានការជាន់គ្នានៃកាលវិភាគ',
          conflicts: validation.conflicts,
        });
      }
    }

    appState.schedules[index] = {
      ...appState.schedules[index],
      ...req.body,
      id,
    };
    persistState();
    res.json(appState.schedules[index]);
  });

  // Delete schedule slot
  app.delete('/api/schedules/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    appState.schedules = appState.schedules.filter(s => s.id !== id);
    persistState();
    res.json({ success: true, removedId: id });
  });

  // Batch clear or update
  app.post('/api/schedules/batch', (req: Request, res: Response) => {
    const { schedules } = req.body;
    if (Array.isArray(schedules)) {
      appState.schedules = schedules;
      persistState();
      return res.json({ success: true, count: schedules.length });
    }
    res.status(400).json({ error: 'Invalid payload' });
  });

  // Clear by class or all
  app.post('/api/schedules/clear', (req: Request, res: Response) => {
    const { classId } = req.body;
    if (classId) {
      appState.schedules = appState.schedules.filter(s => s.classId !== classId);
    } else {
      appState.schedules = [];
    }
    persistState();
    res.json({ success: true, remaining: appState.schedules.length });
  });

  // Automated scheduling algorithm endpoint
  app.post('/api/schedules/auto-generate', (req: Request, res: Response) => {
    const { classIds, clearExisting } = req.body;
    const targetIds = Array.isArray(classIds) && classIds.length > 0
      ? classIds
      : appState.classes.map(c => c.id);

    const result = runAutoSchedulingAlgorithm(
      targetIds,
      !!clearExisting,
      appState.schedules,
      appState.teachers,
      appState.classes,
      appState.subjects,
      appState.timeSlots
    );

    appState.schedules = result.newSchedules;
    persistState();

    res.json({
      success: true,
      totalAllocated: result.totalAllocated,
      unallocatedReasons: result.unallocatedReasons,
      totalSchedules: appState.schedules.length,
    });
  });

  // School info
  app.put('/api/school-info', (req: Request, res: Response) => {
    appState.schoolInfo = { ...appState.schoolInfo, ...req.body };
    persistState();
    res.json(appState.schoolInfo);
  });

  // Reset to initial demo data
  app.post('/api/reset-sample', (_req: Request, res: Response) => {
    appState = {
      teachers: INITIAL_TEACHERS,
      classes: INITIAL_CLASSES,
      subjects: INITIAL_SUBJECTS,
      timeSlots: INITIAL_TIMESLOTS,
      schedules: INITIAL_SCHEDULES,
      schoolInfo: INITIAL_SCHOOL_INFO,
    };
    persistState();
    res.json({ success: true, message: 'ទិន្នន័យគំរូត្រូវបានកំណត់ឡើងវិញជោគជ័យ' });
  });

  // Integrate Vite or serve static dist
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
