import {
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserRound
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useConfirm } from "../context/ConfirmContext.jsx";

const studentLinks = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/profile", label: "Profile", icon: UserRound },
  { to: "/student/jobs", label: "Available Jobs", icon: BriefcaseBusiness },
  { to: "/student/applications", label: "Applications", icon: ClipboardList }
];

const recruiterLinks = [
  { to: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/recruiter/jobs", label: "My Jobs", icon: BriefcaseBusiness },
  { to: "/recruiter/jobs/new", label: "Create Job", icon: ClipboardList }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { confirmAction } = useConfirm();
  const navigate = useNavigate();
  const links = user?.role === "RECRUITER" ? recruiterLinks : studentLinks;

  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: "Log out?",
      message: "You will be signed out and returned to the login page.",
      confirmText: "Logout",
      tone: "logout"
    });

    if (!confirmed) return;

    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/">
          <GraduationCap size={28} />
          <span>Campus Placement</span>
        </NavLink>

        <nav className="side-nav">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to}>
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
          {user?.role === "RECRUITER" ? (
            <NavLink to="/recruiter/jobs">
              <CalendarClock size={18} />
              <span>Slots</span>
            </NavLink>
          ) : null}
        </nav>

        <div className="sidebar-footer">
          <div className="user-block">
            <strong>{user?.fullName}</strong>
            <span>{user?.role}</span>
          </div>
          <button
            className="button ghost full"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, actions, children }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {children ? <p>{children}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function StatCard({ label, value, tone = "neutral" }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
