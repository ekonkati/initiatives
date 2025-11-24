
import {
  Briefcase,
  Home,
  KanbanSquare,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useUser as useAuthUser } from '@/firebase';
import { useUser } from '@/lib/data';

export function MainNav() {
  const { user: authUser } = useAuthUser();
  const { data: currentUser } = useUser(authUser?.uid);

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="flex-1 p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Home">
            <Link href="/dashboard">
              <Home />
              <span>Home</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Initiatives">
            <Link href="/initiatives">
              <Briefcase />
              <span>Initiatives</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="People">
            <Link href="/people">
              <Users />
              <span>People</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Prioritization">
            <Link href="/prioritization">
              <KanbanSquare />
              <span>Prioritization</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {isAdmin && (
            <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Admin">
                <Link href="/admin">
                <Settings />
                <span>Admin</span>
                </Link>
            </SidebarMenuButton>
            </SidebarMenuItem>
        )}
      </SidebarMenu>
    </div>
  );
}
