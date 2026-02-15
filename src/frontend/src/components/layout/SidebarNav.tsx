import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAuthRole } from '../../hooks/useAuthRole';
import { useQueryClient } from '@tanstack/react-query';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { School, LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function SidebarNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear } = useInternetIdentity();
  const { role } = useAuthRole();
  const queryClient = useQueryClient();

  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">SHQ Tracker</h2>
            <p className="text-xs text-muted-foreground">Performance Monitor</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {role === 'user' && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate({ to: '/' })}
                isActive={isActive('/')}
                className="w-full"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {role === 'admin' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate({ to: '/director' })}
                  isActive={isActive('/director')}
                  className="w-full"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate({ to: '/director/principals' })}
                  isActive={isActive('/director/principals')}
                  className="w-full"
                >
                  <Users className="w-4 h-4" />
                  <span>Manage Principals</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
