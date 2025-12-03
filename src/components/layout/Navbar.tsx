import { NavLink } from "react-router-dom";
import { Users, UserPlus, ClipboardCheck, Calendar, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/register", label: "Register Kid", icon: UserPlus },
  { to: "/kids", label: "Kids List", icon: Users },
  { to: "/attendance", label: "Mark Attendance", icon: ClipboardCheck },
  { to: "/history", label: "Attendance History", icon: Calendar },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Adarsh Nagar Mandal" className="h-10 w-10 rounded-xl shadow-soft object-cover" />
            <div className="hidden sm:block">
              <h1 className="font-heading text-lg font-bold text-foreground">
                Adarsh Nagar
              </h1>
              <p className="text-xs text-muted-foreground">Bal-Sabha</p>
            </div>
          </NavLink>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
