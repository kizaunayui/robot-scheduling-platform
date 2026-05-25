import { Bot, Settings, List, Map, BarChart3, FileText, Monitor } from 'lucide-react';

const icons = {
  robotStatus: Bot,
  robotConfig: Settings,
  taskQueue: List,
  taskPlan: Map,
  taskStatistics: BarChart3,
  operationLog: FileText,
  deviceMonitor: Monitor,
};

export default function Sidebar({ currentPage, setCurrentPage, pages }) {
  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-lg font-bold border-b border-gray-700">
        🤖 机器人调度平台
      </div>
      <nav className="flex-1 p-2">
        {Object.entries(pages).map(([key, { title }]) => {
          const Icon = icons[key];
          const active = currentPage === key;
          return (
            <button
              key={key}
              onClick={() => setCurrentPage(key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded mb-1 text-left text-sm ${
                active ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {title}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
