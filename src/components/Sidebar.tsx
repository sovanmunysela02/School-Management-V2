import React from 'react';
import { 
  Calendar, 
  Users, 
  GraduationCap, 
  BookOpen, 
  AlertTriangle, 
  Settings, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  conflictCount: number;
  totalTeachers: number;
  totalClasses: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  conflictCount,
  totalTeachers,
  totalClasses,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      labelKh: 'ផ្ទាំងគ្រប់គ្រង',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'timetable',
      labelKh: 'កាលវិភាគបង្រៀន',
      labelEn: 'Schedule Matrix',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'teachers',
      labelKh: 'គ្រូបង្រៀន',
      labelEn: 'Teachers',
      icon: Users,
      badge: totalTeachers,
    },
    {
      id: 'classes',
      labelKh: 'ថ្នាក់រៀន',
      labelEn: 'Classes',
      icon: GraduationCap,
      badge: totalClasses,
    },
    {
      id: 'subjects',
      labelKh: 'មុខវិជ្ជា',
      labelEn: 'Subjects',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'conflicts',
      labelKh: 'ការជាន់គ្នានៃម៉ោង',
      labelEn: 'Conflicts',
      icon: AlertTriangle,
      badge: conflictCount > 0 ? conflictCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'settings',
      labelKh: 'ការកំណត់ទូទៅ',
      labelEn: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800 no-print">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <div className="text-base font-bold text-white tracking-wide">កាលវិភាគគ្រូ</div>
          <div className="text-xs text-blue-400 font-medium">Teacher Timetable</div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          ម៉ឺនុយចម្បង (Main Menu)
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left truncate">
                  <div className="leading-tight truncate">{item.labelKh}</div>
                  <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.labelEn}
                  </div>
                </div>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                    item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Help Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-gradient-to-br from-indigo-950/60 to-blue-950/40 border border-blue-800/40 rounded-xl p-3.5 text-xs text-slate-300">
          <div className="flex items-center space-x-2 text-blue-300 font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ប្រព័ន្ធឆ្លាតវៃ</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            រៀបចំកាលវិភាគស្វ័យប្រវត្តិដោយគ្មានការជាន់គ្នាម៉ោងបង្រៀន និងបន្ទប់រៀន។
          </p>
        </div>
      </div>
    </aside>
  );
};
