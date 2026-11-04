import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Menu, LogOut, User, LayoutGrid } from "lucide-react";
import { T, bodyFont, displayFont, responsiveCSS, cardStyle, primaryBtn } from "./theme";
import OverviewPage from "./pages/OverviewPage";
import EmployeesPage from "./pages/EmployeesPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EmployeeDetailsPage from "./pages/EmployeeDetailsPage";
import Sidebar from "./components/Sidebar";
import RatingsPage from "./pages/RatingsPage";

export default function ITDashboard() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  const [page, setPage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [range, setRange] = useState("24h");

  const [employeesList, setEmployeesList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      try {
        setIsAuthed(true);
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((reg) => console.log("Service Worker Active!", reg))
          .catch((err) => console.error("Service Worker failed:", err));
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthed(false);
    setCurrentUser(null);
    setAuthView("login");
    setProfileMenuOpen(false);
    setPage("Overview");
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthed(true);
    setCurrentUser(userData);
    setPage("Overview");
  };

  const handleAddSuccess = (newEmp) => {
    setEmployeesList((prev) => [newEmp, ...prev]);
    setPage("Employees");
  };

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

        <Sidebar
          currentPage={page}
          setPage={setPage}
          onLogout={handleLogout}
          currentUser={currentUser}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="main" style={{ flex: 1, height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div className="topbar">
            <div className="topbar-title" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
              <button
                onClick={() => setSidebarOpen(true)}
                className="hamburger-btn"
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Menu size={16} />
              </button>
              <div>
                <h1 style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 600, margin: 0, color: T.text }}>
                  {page === "Overview" && "Operations Overview"}
                  {page === "Employees" && "Employee Directory & CRM"}
                  {page === "EmployeeDetails" && "Employee Details (Database)"}
                  {page === "AddEmployee" && "Register New Employee"}
                  {page === "Profile" && "My Account Profile"}
                  
                </h1>
                <p style={{ fontFamily: bodyFont, fontSize: 12.5, color: T.textSoft, margin: "2px 0 0" }}>
                  {currentUser?.role === "admin" ? "Admin Management Console" : "Employee Portal"}
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
                    {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "DW"}
                  </div>
                  <ChevronDown size={14} color={T.textSoft} style={{ transform: profileMenuOpen ? "rotate(180deg)" : "none" }} />
                </div>

                {profileMenuOpen && (
                  <div className="profile-menu" style={cardStyle({ padding: 6, position: "absolute", right: 0, top: 45, width: 170, zIndex: 100 })}>
                    <div
                      onClick={() => {
                        setPage("Profile");
                        setProfileMenuOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        cursor: "pointer",
                        color: T.text,
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        borderBottom: `1px solid ${T.border}`
                      }}
                    >
                      <User size={15} color={T.primary} /> My Profile
                    </div>

                    <div
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        cursor: "pointer",
                        color: T.bad,
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        marginTop: 4
                      }}
                    >
                      <LogOut size={15} /> Log Out
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PAGE ROUTING LOGIC - Full Width Padding */}
          <div style={{  width: "100%", boxSizing: "border-box" }}>
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
              currentUser?.role === "admin" ? (
                <EmployeesPage 
                  employeesList={employeesList}
                  onNavigateToAdd={() => setPage("AddEmployee")} 
                />
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: T.textFaint }}>
                  ⚠️ Access Denied
                </div>
              )
            )}

            {page === "EmployeeDetails" && (
              currentUser?.role === "admin" ? (
                <EmployeeDetailsPage />
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: T.textFaint }}>
                  ⚠️ Access Denied
                </div>
              )
            )}

            {page === "AddEmployee" && (
              currentUser?.role === "admin" ? (
                <AddEmployeePage 
                  onBack={() => setPage("Employees")} 
                  onAddSuccess={handleAddSuccess} 
                />
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: T.textFaint }}>
                  ⚠️ Access Denied
                </div>
              )
            )}

            {page === "Profile" && (
              <ProfilePage 
                onBack={() => setPage("Overview")} 
                onProfileUpdated={(updated) => setCurrentUser(updated)} 
              />
            )}
            {page === "Ratings" && (
  <RatingsPage currentUser={currentUser} />
)}
          </div>
        </main>
      </div>
    </div>
  );
}