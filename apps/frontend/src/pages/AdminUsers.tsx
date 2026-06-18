import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Modal, notification } from 'antd';
import {
  Users,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface UserItem {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states for editing
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Refs for modal focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (editingUser) {
      triggerRef.current = document.activeElement as HTMLElement;

      setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([-1])'
        );
        if (focusable && focusable.length > 0) {
          (focusable[0] as HTMLElement).focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setEditingUser(null);
          return;
        }

        if (e.key === 'Tab') {
          if (!modalRef.current) return;
          const elements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([-1])'
          );
          if (elements.length === 0) return;

          const firstEl = elements[0];
          const lastEl = elements[elements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              lastEl.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastEl) {
              firstEl.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (triggerRef.current) {
          setTimeout(() => triggerRef.current?.focus(), 0);
        }
      };
    }
  }, [editingUser]);

  const fetchUsers = async (page: number = currentPage, search: string = searchQuery) => {
    setLoading(true);
    setActionError(null);
    try {
      const url = search
        ? `/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`
        : `/users?page=${page}&limit=10`;
      const res: any = await api.get(url);
      setUsers(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setActionError('Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'Quản trị viên') return;
    fetchUsers(currentPage);
  }, [user, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  // Status Toggles using Antd Confirm
  const handleToggleStatus = (targetUser: UserItem) => {
    const nextStatus = targetUser.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';

    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc muốn chuyển trạng thái tài khoản của ${targetUser.fullName} thành [${nextStatus}]?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { style: { backgroundColor: '#00b14f', borderColor: '#00b14f' } },
      onOk: async () => {
        try {
          await api.patch(`/users/${targetUser.id}`, { status: nextStatus });
          setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, status: nextStatus } : u));
          notification.success({
            message: 'Cập nhật thành công',
            description: `Đã thay đổi trạng thái của tài khoản ${targetUser.fullName} thành [${nextStatus}].`
          });
        } catch (err: any) {
          console.error(err);
          notification.error({
            message: 'Lỗi cập nhật',
            description: err.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản.'
          });
        }
      }
    });
  };

  // User Deletion using Antd Confirm
  const handleDeleteUser = (targetUser: UserItem) => {
    if (targetUser.id === user?.id) {
      notification.warning({
        message: 'Không thể thực hiện',
        description: 'Bạn không thể tự xóa tài khoản quản trị của chính mình!'
      });
      return;
    }

    Modal.confirm({
      title: 'Cảnh báo xóa tài khoản',
      content: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của ${targetUser.fullName} (${targetUser.email})? Thao tác này không thể hoàn tác!`,
      okText: 'Xóa tài khoản',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.delete(`/users/${targetUser.id}`);
          setUsers(prev => prev.filter(u => u.id !== targetUser.id));
          notification.success({
            message: 'Xóa tài khoản thành công',
            description: `Tài khoản ${targetUser.fullName} đã được gỡ khỏi hệ thống.`
          });
        } catch (err: any) {
          console.error(err);
          notification.error({
            message: 'Lỗi xóa tài khoản',
            description: err.response?.data?.message || 'Lỗi khi xóa tài khoản người dùng.'
          });
        }
      }
    });
  };

  // Edit User Handler
  const openEditModal = (targetUser: UserItem) => {
    setEditingUser(targetUser);
    setEditName(targetUser.fullName);
    setEditPhone(targetUser.phone || '');
    setEditRole(targetUser.role);
    setEditStatus(targetUser.status);
    setActionError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    setActionError(null);
    try {
      await api.patch(`/users/${editingUser.id}`, {
        fullName: editName,
        phone: editPhone || null,
        role: editRole,
        status: editStatus
      });
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        fullName: editName,
        phone: editPhone || null,
        role: editRole,
        status: editStatus
      } : u));
      setEditingUser(null);
      notification.success({
        message: 'Cập nhật thành công',
        description: `Tài khoản ${editName} đã được cập nhật.`
      });
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài khoản.');
      notification.error({
        message: 'Lỗi cập nhật',
        description: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài khoản.'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!user || user.role !== 'Quản trị viên') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm mt-8">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-gray-900">Từ chối truy cập</h1>
        <p className="text-gray-600 mt-2 text-sm">Vui lòng sử dụng tài khoản Admin để truy cập trang này.</p>
        <Link to="/" className="btn-primary mt-6">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans text-gray-800 text-left">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-700 w-8 h-8" />
            Quản Lý Người Dùng
          </h1>
          <p className="text-gray-500 text-sm font-medium">Danh sách ứng viên, nhà tuyển dụng và quản trị viên hệ thống</p>
        </div>
        <Link to="/admin/dashboard" className="text-emerald-700 hover:text-emerald-800 font-bold text-sm">
          &larr; Quay lại dashboard
        </Link>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <label htmlFor="search-input" className="sr-only">Tìm kiếm người dùng</label>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên hoặc email người dùng..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0 py-2.5 px-5 text-sm">Tìm kiếm</button>
        </form>
        <span className="text-gray-500 text-sm font-bold">Trang {currentPage} / {totalPages}</span>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex gap-2.5" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm font-medium">Đang tải danh sách tài khoản...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">Không tìm thấy người dùng phù hợp.</p>
          </div>
        ) : (
          <>
            {/* Table layout for PC screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <caption className="sr-only">Danh sách tài khoản người dùng trên hệ thống</caption>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <th scope="col" className="px-6 py-4">Tên & Email</th>
                    <th scope="col" className="px-6 py-4">Số điện thoại</th>
                    <th scope="col" className="px-6 py-4">Vai trò</th>
                    <th scope="col" className="px-6 py-4">Trạng thái</th>
                    <th scope="col" className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{u.fullName}</div>
                        <div className="text-gray-500 text-xs">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{u.phone || 'Chưa cung cấp'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold ${u.role === 'Quản trị viên' ? 'bg-red-50 text-red-700 border border-red-100' :
                            u.role === 'Nhà tuyển dụng' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${u.status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${u.status === 'Hoạt động' ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                            title={u.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            {u.status === 'Hoạt động' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.id === user?.id}
                            className={`p-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${u.id === user?.id ? 'opacity-40 cursor-not-allowed' : ''}`}
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card list layout for mobile screens */}
            <div className="block md:hidden divide-y divide-gray-100">
              {users.map((u) => (
                <div 
                  key={u.id} 
                  className="p-5 space-y-4 hover:bg-gray-50/30 transition-colors text-left"
                >
                  {/* Header: Name and email, status badge */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-gray-900 text-base leading-snug truncate">
                        {u.fullName}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5 font-medium truncate">
                        {u.email}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${u.status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {u.status}
                      </span>
                    </div>
                  </div>

                  {/* Details info */}
                  <div className="space-y-2 text-xs font-semibold text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Số điện thoại:</span>
                      <span>{u.phone || 'Chưa cung cấp'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Vai trò:</span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold ${u.role === 'Quản trị viên' ? 'bg-red-50 text-red-700 border border-red-100' :
                          u.role === 'Nhà tuyển dụng' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="pt-2.5 border-t border-gray-50 flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      title="Sửa thông tin"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`p-2.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${u.status === 'Hoạt động' ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                      title={u.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                    >
                      {u.status === 'Hoạt động' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u)}
                      disabled={u.id === user?.id}
                      className={`p-2.5 rounded-xl border border-red-200 text-red-650 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${u.id === user?.id ? 'opacity-40 cursor-not-allowed' : ''}`}
                      title="Xóa tài khoản"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Toolbar */}
        {!loading && totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-150' : 'bg-white hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-sm text-gray-500 font-bold">Trang {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-150' : 'bg-white hover:bg-gray-50'}`}
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden relative animate-slide-up"
          >
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 id="edit-user-title" className="font-extrabold text-gray-900 text-base">Chỉnh Sửa Tài Khoản</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Đóng hộp thoại chỉnh sửa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit-email" className="label-text">Địa chỉ Email</label>
                <input id="edit-email" type="text" readOnly disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" value={editingUser.email} />
              </div>

              <div>
                <label htmlFor="edit-name" className="label-text">Họ và Tên</label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  disabled={updating}
                />
              </div>

              <div>
                <label htmlFor="edit-phone" className="label-text">Số điện thoại</label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="input-field"
                  disabled={updating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-role" className="label-text">Vai trò</label>
                  <select
                    id="edit-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="input-field"
                    disabled={updating}
                  >
                    <option value="Ứng viên">Ứng viên</option>
                    <option value="Nhà tuyển dụng">Nhà tuyển dụng</option>
                    <option value="Quản trị viên">Quản trị viên</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-status" className="label-text">Trạng thái</label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="input-field"
                    disabled={updating}
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa</option>
                    <option value="Bị cấm">Bị cấm</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary py-2.5 px-4 text-sm" disabled={updating}>Hủy</button>
                <button type="submit" className="btn-primary py-2.5 px-4 text-sm" disabled={updating}>
                  {updating ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
