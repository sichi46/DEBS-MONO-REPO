import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminMobileHeader } from "./AdminMobileHeader";

export function AdminLayout() {
    return (
        <SidebarProvider defaultOpen={true}>
            <AdminSidebar />
            <SidebarInset className="flex flex-col">
                <AdminMobileHeader />
                <AdminHeader />
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
