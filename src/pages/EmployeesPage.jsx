import React, { useState, useEffect } from "react";
import { RefreshCw, Plus, Mail, Phone, Briefcase, X, ExternalLink } from "lucide-react";
import { T, bodyFont, displayFont, cardStyle, primaryBtn, PageHeader } from "../theme";

export default function EmployeesPage({ onNavigateToAdd, employeesList }) {
  const [employees, setEmployees] = useState(employeesList || []);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const scriptURL = 'https://script.google.com/macros/s/AKfycbw9bEufFnegV2BN74ZUaCl5Q2QGtuYtVcbpgUf2EE2ZQ4qa6Q0_9XOMJrkLFeW76C-c/exec';

  // Helper to ensure direct viewable image URLs
  const formatImageSrc = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim().replace(/^['"]|['"]$/g, '');

    // Cloudinary direct links
    if (cleanUrl.includes("cloudinary.com")) {
      return cleanUrl;
    }

    // Google Drive direct export/thumbnail conversion
    if (cleanUrl.includes("drive.google.com") || cleanUrl.includes("googleusercontent.com")) {
      const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
      }
    }

    return cleanUrl.startsWith("http") ? cleanUrl : null;
  };

 const fetchSheetData = () => {
    setLoading(true);
    setSyncMsg("");

    fetch(scriptURL)
      .then(response => {
        if (!response.ok) throw new Error("Network response not ok");
        return response.json(); // Direct JSON parse karein
      })
      .then(data => {
        console.log("Sheet data received:", data);

        if (Array.isArray(data) && data.length > 0) {
          const formattedData = data.map((item, index) => ({
            _id: index.toString(),
            name: item.name || "Unknown",
            email: item.email || "N/A",
            phone: item.phone || "N/A",
            address: item.address || "N/A",
            aadhar: item.aadhar || "N/A",
            pan: item.pan || "N/A",
            department: item.department || "General",
            role: item.role || "Team Member",
            image: item.photoUrl && item.photoUrl.startsWith("http") ? item.photoUrl : null,
            resume: item.resumeUrl && item.resumeUrl.startsWith("http") ? item.resumeUrl : null,
            status: "Active"
          }));

          setEmployees(formattedData.reverse());
          setSyncMsg("Live data synced successfully from Google Sheet! 🎉");
        } else {
          setEmployees([]);
          setSyncMsg("Google Sheet me abhi koi data nahi mila.");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch Error:", error);
        setSyncMsg("Data load karne me problem aayi. Console check karein.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  return (
    <div style={{ width: "100%", padding: "0 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <PageHeader title="Employee Details" subtitle="Dashboard se live view aur sync karein" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={{ ...primaryBtn, background: T.navy }} onClick={fetchSheetData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            {loading ? "Syncing..." : "Sync Sheet"}
          </button>
          
          <button style={primaryBtn} onClick={onNavigateToAdd}>
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {syncMsg && (
        <div style={{ padding: "10px 14px", background: T.goodSoft, color: T.good, borderRadius: 8, marginBottom: 16, fontFamily: bodyFont, fontSize: 13, fontWeight: 600 }}>
          {syncMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {employees.map((emp) => (
          <div 
            key={emp._id} 
            onClick={() => setSelectedEmployee(emp)}
            style={{ ...cardStyle({ padding: 18, display: "flex", flexDirection: "column", gap: 12 }), cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${T.primary}, ${T.sky})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, overflow: "hidden", flexShrink: 0 }}>
                  {emp.image ? (
                    <img 
                      src={emp.image} 
                      alt={emp.name} 
                      referrerPolicy="no-referrer"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    emp.name ? emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "EM"
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600, color: T.text }}>{emp.name}</div>
                  <div style={{ fontFamily: bodyFont, fontSize: 11.5, color: T.textFaint }}>{emp.role}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: `1px solid ${T.border}`, paddingTop: 10, fontFamily: bodyFont, fontSize: 12.5, color: T.textSoft }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={13} color={T.primary} /> {emp.email}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={13} color={T.primary} /> {emp.phone}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Briefcase size={13} color={T.primary} /> {emp.department}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedEmployee && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 15 }}>
          <div style={{ background: T.surface, borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: T.shadowLg, position: "relative", overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.navy})`, height: 80, padding: 16, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedEmployee(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "0 24px 24px 24px", position: "relative", marginTop: -40, textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.surface, border: `4px solid ${T.surface}`, margin: "0 auto 10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selectedEmployee.image ? (
                  <img 
                    src={selectedEmployee.image} 
                    alt={selectedEmployee.name} 
                    referrerPolicy="no-referrer"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {selectedEmployee.name ? selectedEmployee.name.slice(0, 2).toUpperCase() : "EM"}
                  </div>
                )}
              </div>

              <div style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 600 }}>{selectedEmployee.name}</div>
              <div style={{ color: T.primary, fontSize: 13, fontWeight: 600 }}>{selectedEmployee.role} ({selectedEmployee.department})</div>

              <div style={{ background: T.bg, padding: 14, borderRadius: 10, marginTop: 16, textAlign: "left", fontSize: 13, display: "flex", flexDirection: "column", gap: 8 }}>
                <div><b>Email:</b> {selectedEmployee.email}</div>
                <div><b>Mobile:</b> {selectedEmployee.phone}</div>
                <div><b>Address:</b> {selectedEmployee.address}</div>
                <div><b>Aadhaar:</b> {selectedEmployee.aadhar}</div>
                <div><b>PAN:</b> {selectedEmployee.pan}</div>
                
                {selectedEmployee.resume && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <b>Resume:</b>
                    <a href={selectedEmployee.resume} target="_blank" rel="noreferrer" style={{ color: T.primary, display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 600 }}>
                      View Resume <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setSelectedEmployee(null)} style={{ ...primaryBtn, flex: 1, justifyContent: "center" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}