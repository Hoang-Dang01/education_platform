import React, { useMemo, useState } from 'react';
import { Users, ShieldCheck, UserCog, Ban, CheckCircle2, Search } from 'lucide-react';
import { mockUsers } from '../lib/mockData';
import type { MockUser } from '../lib/mockData';
import type { UserRole } from '../lib/roles';
import { ROLE_META, roleLabel } from '../lib/roles';
import './Pages.css';

const ALL_ROLES: UserRole[] = ['admin', 'manager', 'teacher', 'student'];

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const changeRole = (id: string, role: UserRole) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, role } : u)));
  };

  const toggleStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      )
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      const matchQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

  const counts = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      instructors: users.filter(u => u.role === 'teacher' || u.role === 'manager').length,
      admins: users.filter(u => u.role === 'admin').length,
    };
  }, [users]);

  return (
    <div className="page-container admin-page animate-fade-in">
      {/* KPI tổng quan */}
      <section className="kpi-grid">
        <div className="kpi-card glass-panel accent-indigo">
          <div className="kpi-header">
            <span className="kpi-title">Tổng người dùng</span>
            <div className="kpi-icon-wrapper"><Users size={20} /></div>
          </div>
          <div className="kpi-body"><h3>{counts.total}</h3><p>Tài khoản trong hệ thống</p></div>
        </div>
        <div className="kpi-card glass-panel accent-green">
          <div className="kpi-header">
            <span className="kpi-title">Đang hoạt động</span>
            <div className="kpi-icon-wrapper"><CheckCircle2 size={20} /></div>
          </div>
          <div className="kpi-body"><h3>{counts.active}</h3><p>Tài khoản chưa bị khóa</p></div>
        </div>
        <div className="kpi-card glass-panel accent-cyan">
          <div className="kpi-header">
            <span className="kpi-title">Giảng dạy & Điều phối</span>
            <div className="kpi-icon-wrapper"><UserCog size={20} /></div>
          </div>
          <div className="kpi-body"><h3>{counts.instructors}</h3><p>Giáo viên + Quản lý</p></div>
        </div>
        <div className="kpi-card glass-panel accent-indigo">
          <div className="kpi-header">
            <span className="kpi-title">Quản trị viên</span>
            <div className="kpi-icon-wrapper"><ShieldCheck size={20} /></div>
          </div>
          <div className="kpi-body"><h3>{counts.admins}</h3><p>Quyền cao nhất hệ thống</p></div>
        </div>
      </section>

      <section className="reports-section glass-panel">
        <div className="reports-section-header">
          <h3>Quản lý tài khoản & phân quyền</h3>
          <div className="admin-toolbar">
            <div className="admin-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <select
              className="admin-filter-select"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
            >
              <option value="all">Tất cả vai trò</option>
              {ALL_ROLES.map(r => (
                <option key={r} value={r}>{roleLabel(r)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hoạt động cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="font-bold">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className={`role-select role-${u.role}`}
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value as UserRole)}
                      title={ROLE_META[u.role].description}
                    >
                      {ALL_ROLES.map(r => (
                        <option key={r} value={r}>{roleLabel(r)}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status}`}>
                      {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td>{u.lastActive}</td>
                  <td>
                    <button
                      className={`row-action-btn ${u.status === 'active' ? 'danger' : 'success'}`}
                      onClick={() => toggleStatus(u.id)}
                      title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {u.status === 'active' ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                      <span>{u.status === 'active' ? 'Khóa' : 'Mở khóa'}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-row">Không tìm thấy người dùng phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
