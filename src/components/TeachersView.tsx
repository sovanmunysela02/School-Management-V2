import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  DoorClosed, 
  Edit3, 
  Trash2, 
  Calendar, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { Teacher, Subject, ScheduleEntry } from '../types';

interface TeachersViewProps {
  teachers: Teacher[];
  subjects: Subject[];
  schedules: ScheduleEntry[];
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  onUpdateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
  onViewTeacherSchedule: (teacherId: string) => void;
  isAdmin: boolean;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  subjects,
  schedules,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onViewTeacherSchedule,
  isAdmin,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'ប្រុស' | 'ស្រី'>('ប្រុស');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [role, setRole] = useState<'admin' | 'teacher'>('teacher');
  const [maxWeeklyHours, setMaxWeeklyHours] = useState(22);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const filteredTeachers = teachers.filter(t => {
    const q = search.toLowerCase();
    const subNames = t.subjectsTaught.map(sid => subjectMap.get(sid)?.name.toLowerCase() || '').join(' ');
    return (
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.email.toLowerCase().includes(q) ||
      subNames.includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setName('');
    setGender('ប្រុស');
    setPhone('');
    setEmail('');
    setRoomNumber('បន្ទប់ A101');
    setSelectedSubjects(subjects.length > 0 ? [subjects[0].id] : []);
    setRole('teacher');
    setMaxWeeklyHours(22);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setName(t.name);
    setGender(t.gender || 'ប្រុស');
    setPhone(t.phone);
    setEmail(t.email);
    setRoomNumber(t.roomNumber);
    setSelectedSubjects(t.subjectsTaught || []);
    setRole(t.role);
    setMaxWeeklyHours(t.maxWeeklyHours || 22);
    setIsModalOpen(true);
  };

  const handleToggleSubject = (subId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subId) ? prev.filter(x => x !== subId) : [...prev, subId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingTeacher) {
        await onUpdateTeacher(editingTeacher.id, {
          name,
          gender,
          phone,
          email,
          roomNumber,
          subjectsTaught: selectedSubjects,
          role,
          maxWeeklyHours: Number(maxWeeklyHours),
        });
      } else {
        await onAddTeacher({
          name,
          gender,
          phone,
          email,
          roomNumber,
          subjectsTaught: selectedSubjects,
          color: '#3b82f6',
          role,
          maxWeeklyHours: Number(maxWeeklyHours),
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>គ្រប់គ្រងគ្រូបង្រៀន (Teachers Directory)</span>
          </h2>
          <p className="text-xs text-slate-500">
            បញ្ជីគ្រូបង្រៀនទាំងអស់ មុខវិជ្ជាទទួលខុសត្រូវ និងម៉ោងបង្រៀនក្នុងសប្តាហ៍
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ, លេខទូរស័ព្ទ, មុខវិជ្ជា..."
              className="text-xs bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 w-64 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមគ្រូថ្មី</span>
            </button>
          )}
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => {
          const currentHours = schedules.filter(s => s.teacherId === teacher.id).length;
          const max = teacher.maxWeeklyHours || 22;
          const percent = Math.min(100, Math.round((currentHours / max) * 100));

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-base shadow-2xs">
                      {teacher.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        {teacher.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {teacher.gender}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600">
                          {teacher.role === 'admin' ? 'នាយក / Admin' : 'គ្រូបង្រៀន'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(teacher)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="កែប្រែ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTeacher(teacher.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{teacher.phone || 'មិនមានលេខទូរស័ព្ទ'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.email || 'មិនមានអ៊ីមែល'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DoorClosed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{teacher.roomNumber || 'មិនទាន់ចាត់តាំង'}</span>
                  </div>
                </div>

                {/* Subjects taught */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5">មុខវិជ្ជាបង្រៀន៖</div>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.subjectsTaught.length === 0 ? (
                      <span className="text-xs text-slate-400">មិនទាន់ចាត់តាំង</span>
                    ) : (
                      teacher.subjectsTaught.map(sid => {
                        const sub = subjectMap.get(sid);
                        return (
                          <span
                            key={sid}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-lg border"
                            style={{
                              backgroundColor: `${sub?.color || '#3b82f6'}15`,
                              borderColor: `${sub?.color || '#3b82f6'}40`,
                              color: sub?.color || '#3b82f6',
                            }}
                          >
                            {sub?.name || 'មុខវិជ្ជា'}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Workload & Quick schedule view */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">បន្ទុកបង្រៀន៖</span>
                  <span className="font-bold text-slate-800">
                    {currentHours} / {max} ម៉ោង ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent > 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <button
                  onClick={() => onViewTeacherSchedule(teacher.id)}
                  className="w-full mt-2 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>មើលកាលវិភាគគ្រូនេះ</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                {editingTeacher ? 'កែប្រែព័ត៌មានគ្រូ' : 'បន្ថែមគ្រូបង្រៀនថ្មី'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  គោត្តនាម និងនាម <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ សាស្ត្រាចារ្យ ឡុង វិបុល"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ភេទ</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="ប្រុស">ប្រុស</option>
                    <option value="ស្រី">ស្រី</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">តួនាទី</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="teacher">គ្រូបង្រៀន</option>
                    <option value="admin">នាយកសាលា / Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">លេខទូរស័ព្ទ</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012 345 678"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">បន្ទប់ប្រចាំ</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="បន្ទប់ A101"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">អ៊ីមែល (Email)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu.kh"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  មុខវិជ្ជាដែលអាចបង្រៀនបាន
                </label>
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
                  {subjects.map((sub) => {
                    const isChecked = selectedSubjects.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg text-xs cursor-pointer ${
                          isChecked ? 'bg-blue-50 font-bold text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSubject(sub.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{sub.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ម៉ោងអតិបរមាក្នុងសប្តាហ៍ (Standard Max Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={maxWeeklyHours}
                  onChange={(e) => setMaxWeeklyHours(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  {isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
