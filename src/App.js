import React, { useState, useEffect } from "react";
import { LayoutGrid, Users, Search, Bell, ChevronDown, Menu, X, LogOut } from "lucide-react";
import { T, bodyFont, displayFont, monoFont, responsiveCSS, cardStyle } from "./theme";
import OverviewPage from "./pages/OverviewPage";
import EmployeesPage from "./pages/EmployeesPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import LoginPage from "./pages/LoginPage";       // Login Page Import
import RegisterPage from "./pages/RegisterPage";   // Register Page Import

export default function ITDashboard() {
  // --- Auth States ---
  const [isAuthed, setIsAuthed] = useState(false);
  const [authView, setAuthView] = useState("login"); // 'login' ya 'register'
  const [currentUser, setCurrentUser] = useState(null);

  // --- Dashboard States ---
  const [page, setPage] = useState("Overview"); // 'Overview', 'Employees', ya 'AddEmployee'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [range, setRange] = useState("24h");

  // Employees List State
  const [employeesList, setEmployeesList] = useState([
    { _id: "1", name: "Loading", email: "loading@company.com", phone: "+91 XXXXX XXXXX", address: "Malviya Nagar, Jaipur", aadhar: "XXXX-XXXX-1234", pan: "ABCDE1234F", department: "Development", role: "Frontend Dev", location: "Jaipur Office", status: "Active", image: null },
  ]);

  // Check initial token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsAuthed(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthed(false);
    setAuthView("login");
    setProfileMenuOpen(false);
  };

  // Handle Login Success
  const handleLoginSuccess = (userData) => {
    setIsAuthed(true);
    setCurrentUser(userData);
    setPage("Overview");
  };

  // Handle New Employee Add
  const handleAddSuccess = (newEmp) => {
    setEmployeesList([newEmp, ...employeesList]);
    setPage("Employees");
  };

  // --- AGAR USER LOGGED-IN NAHI HAI, TOH LOGIN/REGISTER DIKHAO ---
  if (!isAuthed) {
    return (
      <div style={{ fontFamily: bodyFont, color: T.text }}>
        <style>{responsiveCSS}</style>
        {authView === "login" ? (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess} 
            onGoRegister={() => setAuthView("register")} 
          />
        ) : (
          <RegisterPage 
            onRegisterSuccess={() => setAuthView("login")} 
            onGoLogin={() => setAuthView("login")} 
          />
        )}
      </div>
    );
  }

  // --- AGAR USER LOGGED-IN HAI, TOH MAIN DASHBOARD DIKHAO ---
  const traffic = [
    { t: "00:00", in: 240, out: 180 }, { t: "02:00", in: 210, out: 160 },
    { t: "04:00", in: 190, out: 140 }, { t: "06:00", in: 260, out: 200 },
  ];
  const latency = [
    { t: "Mon", ms: 42 }, { t: "Tue", ms: 38 }, { t: "Wed", ms: 51 },
  ];
  const fleet = [
    { name: "api-gateway-01", region: "us-east-1", status: "online", load: 42, icon: LayoutGrid },
  ];
  const tickets = [
    { id: "TCK-2291", subject: "VPN drops for remote team", client: "Meridian", priority: "High", age: "2h" },
  ];
  const totalIn = 5400;

  const navItems = [
    { label: "Overview", icon: LayoutGrid },
    { label: "Employees", icon: Users },
  ];

  return (
    <div style={{ fontFamily: bodyFont, color: T.text, height: "100vh", overflow: "hidden" }}>
      <style>{`
        ${responsiveCSS}
        @media (min-width: 992px) {
          .hamburger-btn { display: none !important; }
        }
      `}</style>
      
      <div className="app-shell" style={{ background: `radial-gradient(1200px 600px at 100% -10%, #E1EEFF 0%, ${T.bg} 45%)` }}>
        <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <aside
          className={`sidebar ${sidebarOpen ? "open" : ""}`}
          style={{
            background: `linear-gradient(165deg, ${T.navyMid} 0%, ${T.navy} 60%, #060F38 100%)`,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
            <div>
              <div style={{ fontFamily: displayFont, fontWeight: 600, fontSize: 16, color: "#fff" }}>DW CRM</div>
              <div style={{ fontFamily: monoFont, fontSize: 9.5, color: T.sky, letterSpacing: 1.2 }}>Local Dashboard</div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="hamburger-btn"
              style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 30, height: 30, color: "#fff", cursor: "pointer" }}
            >
              <X size={16} />
            </button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map(({ label, icon: Icon }) => {
              const active = page === label || (page === "AddEmployee" && label === "Employees");
              return (
                <div
                  key={label}
                  onClick={() => { setPage(label); setSidebarOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 9,
                    cursor: "pointer",
                    background: active ? "rgba(0,194,255,0.14)" : "transparent",
                    borderLeft: active ? `2px solid ${T.sky}` : "2px solid transparent",
                  }}
                >
                  <Icon size={16} color={active ? T.sky : "#8CA0D0"} strokeWidth={2} />
                  <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? "#fff" : "#8CA0D0" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-title" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
              <button
                onClick={() => setSidebarOpen(true)}
                className="hamburger-btn"
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, width: 36, height: 36, cursor: "pointer" }}
              >
                <Menu size={16} />
              </button>
              <div>
                <h1 style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 600, margin: 0, color: T.text }}>
                  {page === "Overview" && "Operations Overview"}
                  {page === "Employees" && "Employee Directory & CRM"}
                  {page === "AddEmployee" && "Register New Employee"}
                </h1>
                <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: T.textSoft, margin: "2px 0 0" }}>
                  Local office management system
                </p>
              </div>
            </div>

            <div className="topbar-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#ffffff",
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "6px 12px",
                  width: 250,
                }}
              >
                <Search size={15} color={T.textFaint} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 13, fontFamily: bodyFont, color: T.text }}
                />
              </div>

              <div style={{ position: "relative" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  onClick={() => setProfileMenuOpen((v) => !v)}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.primary}, ${T.sky})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontFamily: displayFont,
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {currentUser?.username ? currentUser.username.slice(0, 2).toUpperCase() : "AD"}
                  </div>
                  <ChevronDown size={14} color={T.textSoft} style={{ transform: profileMenuOpen ? "rotate(180deg)" : "none" }} />
                </div>

                {profileMenuOpen && (
                  <div className="profile-menu" style={cardStyle({ padding: 8, position: "absolute", right: 0, top: 45, width: 160, zIndex: 100 })}>
                    <div
                      onClick={handleLogout}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px", cursor: "pointer", color: T.bad, fontSize: 13, fontWeight: 600 }}
                    >
                      <LogOut size={14} /> Log Out
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PAGE ROUTING LOGIC */}
          {page === "Overview" && (
            <OverviewPage
              traffic={traffic}
              latency={latency}
              fleet={fleet}
              tickets={tickets}
              totalIn={totalIn}
              range={range}
              setRange={setRange}
              goto={(target) => setPage(target)}
            />
          )}

          {page === "Employees" && (
            <EmployeesPage 
              employeesList={employeesList}
              onNavigateToAdd={() => setPage("AddEmployee")} 
            />
          )}

          {page === "AddEmployee" && (
            <AddEmployeePage 
              onBack={() => setPage("Employees")} 
              onAddSuccess={handleAddSuccess} 
            />
          )}
        </main>
      </div>
    </div>
  );
}