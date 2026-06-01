import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  History,
  Settings,
} from "lucide-react";

const links = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Participants", path: "/participants", icon: Users },
  { name: "Attendance", path: "/attendance", icon: UserCheck },
  { name: "History", path: "/history", icon: History },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-24 shrink-0">
        <div className="h-screen sticky top-0 flex items-center justify-center p-5">
          <div className="glass-card w-full h-[92vh] rounded-4xl px-3 py-5 flex flex-col items-center">
            <Link
              to="/"
              className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center shadow-lg text-xl font-bold"
            >
              🍻
            </Link>

            <div className="mt-3 text-[11px] text-slate-700 font-bold text-center leading-tight">
              Tagay
              <br />
              Rank
            </div>

            <nav className="mt-8 flex flex-col gap-3 items-center">
              {links.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    title={link.name}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                      active
                        ? "bg-white text-orange-500 shadow-lg"
                        : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={20} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* MOBILE / TABLET BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50">
        <div className="glass-card rounded-[28px] px-3 py-3">
          <div className="grid grid-cols-5 gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition ${
                    active
                      ? "bg-white text-orange-500 shadow-md"
                      : "text-slate-600 hover:bg-white/40"
                  }`}
                >
                  <Icon size={20} />

                  <span className="text-[10px] font-bold leading-none">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}