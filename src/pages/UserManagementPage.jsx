import { useState } from 'react';
import { initialUsers, RolePermissions, RoleColors } from '../mock/users';

export default function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', role: '观察员', phone: '' });
  const [log, setLog] = useState([]);

  const addLog = (action) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setLog(prev => [{ id: Date.now(), action, time: timeStr, operator: 'admin' }, ...prev].slice(0, 20));
  };

  const handleAdd = () => {
    if (!form.username.trim() || !form.phone.trim()) return;
    const newUser = {
      userId: `U${String(users.length + 1).padStart(3, '0')}`,
      username: form.username,
      role: form.role,
      phone: form.phone,
      status: '启用',
      permissions: RolePermissions[form.role] || [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers(prev => [...prev, newUser]);
    addLog(`新增用户 ${newUser.username}（${newUser.role}）`);
    setForm({ username: '', role: '观察员', phone: '' });
    setShowModal(false);
  };

  const toggleStatus = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.userId !== userId) return u;
      const newStatus = u.status === '启用' ? '禁用' : '启用';
      addLog(`${newStatus}用户 ${u.username}`);
      return { ...u, status: newStatus };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">共 {users.length} 个用户，{users.filter(u=>u.status==='启用').length} 个已启用</div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + 新增用户
        </button>
      </div>

      {/* 用户表格 */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">用户ID</th>
              <th className="p-3 text-left">用户名</th>
              <th className="p-3 text-left">角色</th>
              <th className="p-3 text-left">手机号</th>
              <th className="p-3 text-left">权限</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-left">创建时间</th>
              <th className="p-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.userId} className="border-t">
                <td className="p-3">{u.userId}</td>
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${RoleColors[u.role] || 'bg-gray-100 text-gray-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3">{u.phone}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {u.permissions.map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${u.status === '启用' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{u.createdAt}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleStatus(u.userId)}
                    className={`px-2 py-1 rounded text-xs text-white ${u.status === '启用' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {u.status === '启用' ? '禁用' : '启用'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 运行日志 */}
      {log.length > 0 && (
        <div className="bg-white rounded shadow p-5">
          <h2 className="text-lg font-semibold mb-3">📝 用户操作日志</h2>
          <div className="space-y-2 max-h-48 overflow-auto">
            {log.map(l => (
              <div key={l.id} className="flex justify-between text-sm border-b pb-1">
                <span>{l.action}</span>
                <span className="text-gray-400">{l.time} · {l.operator}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新增用户弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">新增用户</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">用户名</label>
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">角色</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  {Object.keys(RolePermissions).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">手机号</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="请输入手机号"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded text-sm">取消</button>
              <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
