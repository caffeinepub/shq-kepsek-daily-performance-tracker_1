import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useAuthRole } from './hooks/useAuthRole';
import LoginGate from './components/auth/LoginGate';
import DashboardShell from './components/layout/DashboardShell';
import KepsekDashboardPage from './pages/kepsek/KepsekDashboardPage';
import DirectorDashboardPage from './pages/director/DirectorDashboardPage';
import PrincipalManagementPage from './pages/director/PrincipalManagementPage';
import PrincipalDetailPage from './pages/director/PrincipalDetailPage';
import AccessDenied from './components/auth/AccessDenied';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { role, isLoading } = useAuthRole();

  if (!identity) {
    return <LoginGate />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}

function IndexRouteComponent() {
  const { role } = useAuthRole();
  if (role === 'admin') {
    return <DirectorDashboardPage />;
  }
  if (role === 'user') {
    return <KepsekDashboardPage />;
  }
  return <AccessDenied />;
}

function DirectorDashboardRouteComponent() {
  const { role } = useAuthRole();
  if (role !== 'admin') {
    return <AccessDenied />;
  }
  return <DirectorDashboardPage />;
}

function PrincipalManagementRouteComponent() {
  const { role } = useAuthRole();
  if (role !== 'admin') {
    return <AccessDenied />;
  }
  return <PrincipalManagementPage />;
}

function PrincipalDetailRouteComponent() {
  const { role } = useAuthRole();
  if (role !== 'admin') {
    return <AccessDenied />;
  }
  return <PrincipalDetailPage />;
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const kepsekDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRouteComponent,
});

const directorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/director',
  component: DirectorDashboardRouteComponent,
});

const principalManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/director/principals',
  component: PrincipalManagementRouteComponent,
});

const principalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/director/principal/$schoolId',
  component: PrincipalDetailRouteComponent,
});

const routeTree = rootRoute.addChildren([
  kepsekDashboardRoute,
  directorDashboardRoute,
  principalManagementRoute,
  principalDetailRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
