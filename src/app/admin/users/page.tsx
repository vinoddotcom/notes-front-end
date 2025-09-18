'use client';

export const runtime = 'edge';

import AdminGuard from '@/components/AdminGuard';
import UsersManagement from './users-management';

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UsersManagement />
    </AdminGuard>
  );
}
