import React, { useState, useEffect } from "react";
import { Users, Mail, Phone, MapPin, Landmark, ExternalLink, RefreshCw, Eye, X } from "lucide-react";
import { T, bodyFont, displayFont, monoFont, cardStyle, primaryBtn, PageHeader } from "../theme";
import { apiRequest } from "../api";

export default function EmployeeDetailsPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const fetchEmployeesFromDB = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/employees");
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("Database se employees load karne me error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesFromDB();
  }, []);

  return (
    <div style={{ width: "100%", padding: "0 10px 40px 10px", fontFamily: bodyFont }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <PageHeader 
          title="Database Employee Details" 
          subtitle="MongoDB me registered sabhi employees aur unki complete profile details" 
        />
        <button 
          onClick={fetchEmployeesFromDB} 
          style={{ ...primaryBtn, background: T.surface, color: T.text, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: T.textFaint }}>
          MongoDB Database se employees load ho rahe hain...
        </div>
      ) : employees.length === 0 ? (
        <div style={cardStyle({ padding: 40, textAlign: "center", color: T.textFaint })}>
          Database me abhi koi employee record nahi mila.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
          {employees.map((emp) => (
            <div 
              key={emp._id} 
              style={cardStyle({ 
                padding: 18, 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between",
                gap: 14,
                border: `1px solid ${T.border}`
              })}
            >
              {/* Profile Top */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${T.primary}, ${T.sky})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  {emp.photoUrl ? (
                    <img src={emp.photoUrl} alt={emp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    emp.name ? emp.name.slice(0, 2).toUpperCase() : "DW"
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, margin: 0, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {emp.name}
                  </h3>
                  <div style={{ fontSize: 12, color: T.primary, fontWeight: 600 }}>
                    {emp.designation || "Team Member"} • {emp.department || "General"}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.textFaint }}>
                    {emp.email}
                  </div>
                </div>
              </div>

              {/* Quick Details */}
              <div style={{ fontSize: 12, color: T.textSoft, display: "flex", flexDirection: "column", gap: 4, background: T.bg, padding: 10, borderRadius: 8 }}>
                <div><b>Phone:</b> {emp.phone || "N/A"}</div>
                <div><b>PAN:</b> {emp.panNumber || "N/A"}</div>
                <div><b>Bank:</b> {emp.bankDetails?.bankName || "N/A"}</div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedEmp(emp)}
                style={{
                  ...primaryBtn,
                  width: "100%",
                  justifyContent: "center",
                  padding: "8px 12px",
                  fontSize: 12.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Eye size={14} /> Full Details & Docs Dekhein
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Full Details Modal */}
      {selectedEmp && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: T.surface,
            borderRadius: 18,
            width: "100%",
            maxWidth: 680,
            maxHeight: "88vh",
            overflowY: "auto",
            boxShadow: T.shadowLg,
            border: `1px solid ${T.border}`
          }}>
            {/* Modal Header */}
            <div style={{
              background: `linear-gradient(135deg, ${T.primary}, ${T.navy})`,
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#fff"
            }}>
              <span style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 700 }}>
                {selectedEmp.name} - Detailed Profile
              </span>
              <button 
                onClick={() => setSelectedEmp(null)} 
                style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Identity & Basic */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: T.bg, padding: 14, borderRadius: 10, fontSize: 13 }}>
                <div><b>Email:</b> {selectedEmp.email}</div>
                <div><b>Phone:</b> {selectedEmp.phone || "N/A"}</div>
                <div><b>Address:</b> {selectedEmp.address || "N/A"}</div>
                <div><b>Aadhaar Number:</b> {selectedEmp.aadharNumber ? String(selectedEmp.aadharNumber).replace(/^'/, '') : "N/A"}</div>
                <div><b>PAN Number:</b> {selectedEmp.panNumber || "N/A"}</div>
                <div><b>Department:</b> {selectedEmp.department || "General"}</div>
              </div>

              {/* Bank Details */}
              <div style={{ background: T.bg, padding: 14, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: T.text, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Landmark size={15} color={T.primary} /> Bank Details (Salary Account)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><b>Account Holder:</b> {selectedEmp.bankDetails?.accHolderName || "N/A"}</div>
                  <div><b>Bank Name:</b> {selectedEmp.bankDetails?.bankName || "N/A"}</div>
                  <div><b>Account Number:</b> {selectedEmp.bankDetails?.accNumber || "N/A"}</div>
                  <div><b>IFSC Code:</b> {selectedEmp.bankDetails?.ifscCode || "N/A"}</div>
                </div>
              </div>

              {/* Verification Documents */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: T.text, marginBottom: 10 }}>
                  Uploaded Verification Documents
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
                  {[
                    { label: "Aadhaar Card", url: selectedEmp.documents?.aadharDocUrl },
                    { label: "PAN Card", url: selectedEmp.documents?.panDocUrl },
                    { label: "10th Marksheet", url: selectedEmp.documents?.marksheet10Url },
                    { label: "12th Marksheet", url: selectedEmp.documents?.marksheet12Url },
                    { label: "Graduation", url: selectedEmp.documents?.graduationDocUrl },
                  ].map((doc, idx) => (
                    <div key={idx} style={{ background: T.bg, padding: 8, borderRadius: 8, border: `1px solid ${T.border}`, textAlign: "center", fontSize: 11 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{doc.label}</div>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: T.primary, textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                          View <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span style={{ color: T.textFaint }}>Not Uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}