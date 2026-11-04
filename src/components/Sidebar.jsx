import React from "react";
import { LayoutGrid, Users, LogOut, Network, User, X, FileSpreadsheet, Database, Star } from "lucide-react";

export default function Sidebar({ currentPage, setPage, onLogout, currentUser, sidebarOpen, setSidebarOpen }) {
  const isAdmin = currentUser?.role === "admin";

  const navItems = [
    { label: "Overview", displayLabel: "Overview", icon: LayoutGrid },
  ];

  // Sirf Admin ke liye Sheet aur Database directory tabs
  if (isAdmin) {
    navItems.push({ label: "Employees", displayLabel: "Employees (Sheet)", icon: FileSpreadsheet });
    navItems.push({ label: "EmployeeDetails", displayLabel: "Employee Details (DB)", icon: Database });
  }

  // Performance & Ratings tab (Sabhi ke liye)
  navItems.push({ label: "Ratings", displayLabel: "Performance & Ratings", icon: Star });

  // My Profile option
  navItems.push({ label: "Profile", displayLabel: "My Profile", icon: User });

  return (
    <aside
      className={`sidebar ${sidebarOpen ? "open" : ""}`}
      style={{
        width: 240,
        background: "linear-gradient(165deg, #132E8C 0%, #0A1958 60%, #060F38 100%)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        minHeight: "100vh",
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #00C2FF, #06E0D6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Network size={18} color="#071238" strokeWidth={2.6} />
          </div>
          <div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 15, color: "#fff" }}>DW CRM</div>
            <div style={{ fontFamily: "monospace", fontSize: 9.5, color: "#00C2FF" }}>
              {isAdmin ? "ADMIN PORTAL" : "EMPLOYEE PORTAL"}
            </div>
          </div>
        </div>

        {setSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="hamburger-btn"
            style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 30, height: 30, color: "#fff", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {navItems.map(({ label, displayLabel, icon: Icon }) => {
          const active = currentPage === label || (currentPage === "AddEmployee" && label === "Employees");
          return (
            <div
              key={label}
              onClick={() => {
                setPage(label);
                if (setSidebarOpen) setSidebarOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 9,
                cursor: "pointer",
                background: active ? "rgba(0,194,255,0.14)" : "transparent",
                color: active ? "#fff" : "#8CA0D0",
                fontWeight: active ? 600 : 500,
                borderLeft: active ? "3px solid #00C2FF" : "3px solid transparent",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={16} color={active ? "#00C2FF" : "#8CA0D0"} />
              <span style={{ fontSize: 13.5 }}>{displayLabel}</span>
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div style={{ marginTop: "auto" }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            background: "rgba(240,68,56,0.15)",
            color: "#F04438",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13
          }}
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
}