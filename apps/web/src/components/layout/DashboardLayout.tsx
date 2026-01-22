import { Link, useLocation, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userAtom } from "../../features/auth/state/atoms";

export function DashboardLayout() {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function Sidebar() {
    const location = useLocation();
    const links = [
        { name: "Overview", path: "/dashboard", icon: "LayoutDashboard" },
        { name: "Policies", path: "/dashboard/policies", icon: "FileText" },
        { name: "Claims", path: "/dashboard/claims", icon: "AlertCircle" },
        { name: "Payments", path: "/dashboard/payments", icon: "CreditCard" },
    ];

    return (
        <div className="w-64 bg-card border-r border-border hidden md:flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                    <span className="text-primary">Debs</span> Insure
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        U
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-foreground">User Account</p>
                        <p className="text-xs text-muted-foreground">Manage profile</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Header() {
    const user = useRecoilValue(userAtom);

    return (
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
            <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Welcome, {user?.name || "User"}</span>
            </div>
        </header>
    )
}
