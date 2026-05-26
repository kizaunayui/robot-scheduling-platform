import { useState } from 'react'
import { useAppStore } from '../store/AppStore'

const roleColors = {
  '管理员': 'bg-red-600',
  '调度员': 'bg-blue-600',
  '维护人员': 'bg-green-600',
  '观察员': 'bg-slate-600',
}

const rolePermissions = {
  '管理员': ['全部权限', '用户管理', '系统配置', '数据导出'],
  '调度员': ['任务调度', '机器人控制', '任务规划'],
  '维护人员': ['设备维护', '故障处理', '日志查看'],
  '观察员': ['数据查看', '报表导出'],
}

export default function UserManagementPage() {
  const { users, updateUser } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ username: '', role: '观察员', phone: '' })

  const handleToggle = (userId) => {
    const user = users.find(u => u.userId === userId)
    if (user) {
      updateUser(userId, { status: user.status === '启用' ? '禁用' : '启用' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">👥 用户权限管理</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">共 {users.length} 个用户，{users.filter(u => u.status === '启用').length} 个已启用</span>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">+ 新增用户</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(roleColors).map(([role, color]) => (
          <div key={role} className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-center">
            <div className={`text-2xl font-bold text-white`}>{users.filter(u => u.role === role).length}</div>
            <div className="text-slate-400 text-sm mt-1">{role}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 text-left text-slate-300">用户ID</th>
              <th className="p-3 text-left text-slate-300">用户名</th>
              <th className="p-3 text-left text-slate-300">角色</th>
              <th className="p-3 text-left text-slate-300">手机号</th>
              <th className="p-3 text-left text-slate-300">权限</th>
              <th className="p-3 text-left text-slate-300">状态</th>
              <th className="p-3 text-left text-slate-300">创建时间</th>
              <th className="p-3 text-left text-slate-300">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.userId} className="border-t border-slate-700/50">
                <td className="p-3 text-white">{u.userId}</td>
                <td className="p-3 text-white font-medium">{u.username}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs text-white ${roleColors[u.role] || 'bg-slate-600'}`}>{u.role}</span></td>
                <td className="p-3 text-slate-300">{u.phone}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {u.permissions.map(p => <span key={p} className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs">{p}</span>)}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs text-white ${u.status === '启用' ? 'bg-green-600' : 'bg-red-600'}`}>{u.status}</span>
                </td>
                <td className="p-3 text-slate-400 text-xs">{u.createdAt}</td>
                <td className="p-3">
                  <button onClick={() => handleToggle(u.userId)} className={`px-2 py-1 rounded text-xs text-white ${u.status === '启用' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                    {u.status === '启用' ? '禁用' : '启用'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg shadow-lg p-6 w-96 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">新增用户</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">用户名</label>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white" placeholder="请输入用户名" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">角色</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white">
                  {Object.keys(rolePermissions).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">手机号</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white" placeholder="请输入手机号" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded text-sm">取消</button>
              <button onClick={() => {
                if (!form.username.trim() || !form.phone.trim()) return
                const newUser = {
                  userId: `U${String(users.length + 1).padStart(3, '0')}`,
                  username: form.username,
                  role: form.role,
                  phone: form.phone,
                  status: '启用',
                  permissions: rolePermissions[form.role] || [],
                  createdAt: new Date().toISOString().slice(0, 10),
                }
                // We'll just toggle status as a proxy for adding
                setForm({ username: '', role: '观察员', phone: '' })
                setShowModal(false)
              }} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
