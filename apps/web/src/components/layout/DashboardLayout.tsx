import { Outlet } from "react-router-dom";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { MobileHeader } from "./MobileHeader";

export function DashboardLayout() {
    return (
        <SidebarProvider defaultOpen={true}>
            <DashboardSidebar />
            <SidebarInset className="flex flex-col">
                {/* Mobile Header - visible only on mobile */}
                <MobileHeader />
                {/* Desktop Header - visible only on desktop */}
                <DashboardHeader />
                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
