"use client";

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { MainNav } from "@/components/main-nav";
import { Logo } from "./icons";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  // We can use a cookie to sync this state between server and client.
  const [open, setOpen] = React.useState(isMobile ? false : true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2.5 px-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-lg">InitiativeFlow</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}