import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import AuthPage from "../pages/auth/page";
import ProtectedRoute from "@/components/feature/ProtectedRoute";
import AdminLayout from "@/pages/admin/components/AdminLayout";
import DashboardPage from "@/pages/admin/dashboard/page";
import BookingsPage from "@/pages/admin/bookings/page";
import TransfersPage from "@/pages/admin/transfers/page";
import DriversPage from "@/pages/admin/drivers/page";
import VehiclesPage from "@/pages/admin/vehicles/page";
import ReportsPage from "@/pages/admin/reports/page";
import SearchPage from "@/pages/admin/search/page";
import PlaceholderPage from "@/pages/admin/placeholder/page";
import AgendaPage from "@/pages/admin/agenda/page";
import RoutesPage from "@/pages/admin/routes/page";
import CheckinsPage from "@/pages/admin/checkins/page";
import PaymentsPage from "@/pages/admin/payments/page";
import CustomersPage from "@/pages/admin/customers/page";
import SettingsPage from "@/pages/admin/settings/page";
import AvailabilityPage from "@/pages/admin/availability/page";
import ExperiencesPage from "@/pages/admin/experiences/page";
import PartnersPage from "@/pages/admin/partners/page";
import CategoriesPage from "@/pages/admin/categories/page";
import ReceivablesPage from "@/pages/admin/receivables/page";
import ReconciliationPage from "@/pages/admin/reconciliation/page";
import NotificationsPage from "@/pages/admin/notifications/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'operator']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "bookings",
        element: <BookingsPage />,
      },
      {
        path: "transfers",
        element: <TransfersPage />,
      },
      {
        path: "drivers",
        element: <DriversPage />,
      },
      {
        path: "vehicles",
        element: <VehiclesPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "agenda",
        element: <AgendaPage />,
      },
      {
        path: "routes",
        element: <RoutesPage />,
      },
      {
        path: "checkins",
        element: <CheckinsPage />,
      },
      {
        path: "availability",
        element: <AvailabilityPage />,
      },
      {
        path: "experiences",
        element: <ExperiencesPage />,
      },
      {
        path: "partners",
        element: <PartnersPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "payments",
        element: <PaymentsPage />,
      },
      {
        path: "receivables",
        element: <ReceivablesPage />,
      },
      {
        path: "reconciliation",
        element: <ReconciliationPage />,
      },
      {
        path: "clients",
        element: <CustomersPage />,
      },
      {
        path: "customers",
        element: <CustomersPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "settings/company",
        element: <SettingsPage />,
      },
      {
        path: "settings/team",
        element: <SettingsPage />,
      },
      {
        path: "settings/permissions",
        element: <SettingsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "settings/integrations",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;