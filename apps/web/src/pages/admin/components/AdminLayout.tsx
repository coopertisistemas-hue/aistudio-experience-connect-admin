import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import GlobalSearchOverlay from '@/pages/admin/search/GlobalSearchOverlay';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open, openSearch, closeSearch } = useGlobalSearch();

  return (
    <div className="flex h-screen bg-sand-50 overflow-hidden">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopbar
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed((v) => !v)}
          onMobileMenuToggle={() => setMobileOpen((v) => !v)}
          onSearchOpen={openSearch}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {open && <GlobalSearchOverlay onClose={closeSearch} />}
    </div>
  );
}