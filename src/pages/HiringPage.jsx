import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Search,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Plus,
  Trash2,
  X,
  Link2,
} from "lucide-react";
import { T, bodyFont, displayFont, monoFont, cardStyle, primaryBtn, PageHeader } from "../theme";

// Yahan apna Master Hiring Apps Script Web App URL paste karein:
const HIRING_MASTER_URL = "https://script.google.com/macros/s/AKfycbwF8evx0g9p6uw25z4y_dRMZkBbUEQAWejXU_1DLje5KDtJw7yPcuNv1EPl-9HtbFDe/exec";

const normalizeApplicant = (raw) => {
  const getVal = (...keys) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== "") return raw[k];
      const foundKey = Object.keys(raw).find((rk) => rk.trim().toLowerCase().includes(k.toLowerCase()));
      if (foundKey && raw[foundKey] !== undefined && raw[foundKey] !== "") return raw[foundKey];
    }
    return "";
  };

  return {
    rowNumber: raw.rowNumber,
    sourceSheetId: raw._sourceSheetId || "",
    sourceType: raw._sourceType || "sheet",
    webappUrl: raw._webappUrl || "",
    roleLabel: raw._roleLabel || String(getVal("position", "role", "job", "profile") || "General"),
    name: String(getVal("full name", "name", "candidate", "applicant") || "Candidate"),
    email: String(getVal("email", "mail")),
    phone: String(getVal("phone", "whatsapp", "mobile", "contact", "number")),
    experience: String(getVal("total work experience", "experience", "exp", "years")),
    currentSalary: String(getVal("current salary", "current ctc")),
    expectedSalary: String(getVal("expected salary", "expected ctc")),
    location: String(getVal("current location", "city", "location")),
    noticePeriod: String(getVal("notice period", "joining", "availability")),
    portfolio: String(getVal("portfolio", "linkedin", "github", "website", "link")),
    resume: String(getVal("resume", "cv", "drive", "file", "document")),
    message: String(getVal("message", "cover", "note", "about", "skills")),
    status: String(getVal("status") || "New").trim(),
    appliedAt: getVal("timestamp", "date", "created", "time"),
  };
};

export default function HiringPage() {
  const [sources, setSources] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState("ALL");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingRow, setUpdatingRow] = useState(null);

  // Add New Sheet / URL Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newSheetUrl, setNewSheetUrl] = useState("");
  const [savingSource, setSavingSource] = useState(false);

  const fetchSourcesAndApplications = async (targetSourceId = selectedSourceId) => {
    if (!HIRING_MASTER_URL || !HIRING_MASTER_URL.startsWith("http")) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const sRes = await fetch(`${HIRING_MASTER_URL}?action=getSources`,{ redirect: "follow" });
      const sData = await sRes.json();
      const loadedSources = sData.sources || [];
      setSources(loadedSources);

      if (loadedSources.length === 0) {
        setApplicants([]);
        setLoading(false);
        return;
      }

      const aRes = await fetch(
        `${HIRING_MASTER_URL}?action=getApplications&sourceId=${encodeURIComponent(targetSourceId)}`
      );
      const aData = await aRes.json();
      const list = aData.applications || [];
      setApplicants(list.map(normalizeApplicant));
    } catch (err) {
      console.error("Error fetching hiring data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourcesAndApplications(selectedSourceId);
  }, [selectedSourceId]);

  const handleAddJobSource = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newSheetUrl.trim()) {
      alert("Role Name aur Google Sheet URL / Web App URL dono daalein.");
      return;
    }

    try {
      setSavingSource(true);
      const res = await fetch(HIRING_MASTER_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "addJobSource",
          roleName: newRoleName.trim(),
          sheetIdOrUrl: newSheetUrl.trim(),
        }),
      });
      const result = await res.json();
      if (result.success) {
        setNewRoleName("");
        setNewSheetUrl("");
        setShowAddModal(false);
        setSelectedSourceId(result.id);
        fetchSourcesAndApplications(result.id);
      } else {
        alert("❌ Error: " + (result.message || "Sheet access nahi ho payi. Check karein ki sheet aapke Google account se accessible ho."));
      }
    } catch (err) {
      alert("Error adding job source: " + err.message);
    } finally {
      setSavingSource(false);
    }
  };

  const handleDeleteSource = async (src) => {
    if (!window.confirm(`Kya aap "${src.roleName}" ko list se hatana chahte hain? (Original Google Sheet delete nahi hogi)`)) {
      return;
    }
    try {
      setSavingSource(true);
      const res = await fetch(HIRING_MASTER_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "deleteJobSource",
          id: src.id,
        }),
      });
      const result = await res.json();
      if (result.success) {
        const nextId = selectedSourceId === src.id ? "ALL" : selectedSourceId;
        setSelectedSourceId(nextId);
        fetchSourcesAndApplications(nextId);
      }
    } catch (err) {
      alert("Delete error: " + err.message);
    } finally {
      setSavingSource(false);
    }
  };

  const handleStatusChange = async (app, newStatus) => {
    const rowKey = `${app.sourceSheetId}_${app.rowNumber}`;
    try {
      setUpdatingRow(rowKey);
      setApplicants((prev) =>
        prev.map((item) =>
          item.sourceSheetId === app.sourceSheetId && item.rowNumber === app.rowNumber
            ? { ...item, status: newStatus }
            : item
        )
      );

      await fetch(HIRING_MASTER_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateHiringStatus",
          sourceType: app.sourceType,
          sourceSheetId: app.sourceSheetId,
          webappUrl: app.webappUrl,
          rowNumber: app.rowNumber,
          status: newStatus,
        }),
      });
    } catch (err) {
      alert("Status update error: " + err.message);
    } finally {
      setUpdatingRow(null);
    }
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.roleLabel.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || a.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [applicants, searchTerm, statusFilter]);

  const getStatusColors = (st) => {
    const s = st.toLowerCase();
    if (s === "hired" || s === "shortlisted") return { bg: T.goodSoft, color: T.good };
    if (s === "interview") return { bg: T.warnSoft, color: T.warn };
    if (s === "rejected") return { bg: T.badSoft, color: T.bad };
    return { bg: "rgba(0, 82, 255, 0.08)", color: T.primary };
  };

  return (
    <div style={{ width: "100%", padding: "0 10px 40px 10px", fontFamily: bodyFont }}>
      {/* Top Header & Role Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <PageHeader
          title={`Hiring & Resumes (${filteredApplicants.length})`}
          subtitle="Dropdown se kisi bhi job role (Video Editor, Graphic Designer, etc.) ki sheet switch karein"
        />

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Job Role Dropdown */}
          <select
            value={selectedSourceId}
            onChange={(e) => setSelectedSourceId(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: `1.5px solid ${T.primary}`,
              background: T.surface,
              fontWeight: 700,
              fontSize: 13.5,
              color: T.text,
              minWidth: 210,
            }}
          >
            <option value="ALL">All Job Roles ({sources.length} Sheets)</option>
            {sources.map((src) => (
              <option key={src.id} value={src.id}>
                {src.roleName}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchSourcesAndApplications(selectedSourceId)}
            style={{
              ...primaryBtn,
              background: T.surface,
              color: T.text,
              border: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              ...primaryBtn,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={16} /> Add Job Sheet / URL
          </button>
        </div>
      </div>

      {/* Connected Sheets Pills */}
      {sources.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.textSoft }}>Connected Roles:</span>
          {sources.map((src) => {
            const active = selectedSourceId === src.id;
            return (
              <div
                key={src.id}
                onClick={() => setSelectedSourceId(src.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 11px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: active ? T.primary : T.surface,
                  color: active ? "#fff" : T.text,
                  border: `1px solid ${active ? T.primary : T.border}`,
                }}
              >
                <span>{src.roleName}</span>
                <Trash2
                  size={12}
                  color={active ? "#fff" : T.bad}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSource(src);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <Users size={22} color={T.primary} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Total Applicants</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700 }}>{applicants.length}</div>
          </div>
        </div>

        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <Clock size={22} color={T.primary} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>New / Unreviewed</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: T.primary }}>
              {applicants.filter((a) => a.status.toLowerCase() === "new").length}
            </div>
          </div>
        </div>

        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <CheckCircle2 size={22} color={T.good} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Shortlisted / Hired</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: T.good }}>
              {applicants.filter((a) => ["shortlisted", "hired"].includes(a.status.toLowerCase())).length}
            </div>
          </div>
        </div>

        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <XCircle size={22} color={T.bad} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Rejected</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: T.bad }}>
              {applicants.filter((a) => a.status.toLowerCase() === "rejected").length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div
        style={cardStyle({
          padding: "14px 18px",
          marginBottom: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        })}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["All", "New", "Shortlisted", "Interview", "Hired", "Rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: statusFilter === st ? T.primary : T.bg,
                color: statusFilter === st ? "#fff" : T.textSoft,
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 9,
            padding: "7px 12px",
            width: 260,
          }}
        >
          <Search size={14} color={T.textFaint} />
          <input
            type="text"
            placeholder="Search candidate, phone, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 13 }}
          />
        </div>
      </div>

      {/* Applicants Table */}
      {loading ? (
        <div style={{ padding: 50, textAlign: "center", color: T.textFaint }}>
          Google Sheets se candidates load ho rahe hain...
        </div>
      ) : sources.length === 0 ? (
        <div style={cardStyle({ padding: 50, textAlign: "center", color: T.textFaint })}>
          Abhi koi Job Sheet connected nahi hai. Upar <b>"+ Add Job Sheet / URL"</b> par click karke Video Editor ya Graphic Designer ki Google Sheet link add karein!
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div style={cardStyle({ padding: 50, textAlign: "center", color: T.textFaint })}>
          Is filter mein koi candidate nahi mila.
        </div>
      ) : (
        <div style={cardStyle({ overflowX: "auto", border: `1px solid ${T.border}` })}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: T.bg, textAlign: "left", color: T.textSoft }}>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Candidate</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Job Role</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Contact</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Resume / Portfolio</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Date</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((app, idx) => {
                const badge = getStatusColors(app.status);
                const rowKey = `${app.sourceSheetId}_${app.rowNumber}`;
                return (
                  <tr key={rowKey || idx} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "12px 16px" }}>
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: T.bg,
      padding: "4px 10px",
      borderRadius: 7,
      fontWeight: 600,
      fontSize: 12.5,
    }}
  >
    <Briefcase size={12} color={T.primary} /> {app.roleLabel}
  </span>
  {app.experience && (
    <div style={{ fontSize: 11.5, color: T.textSoft, marginTop: 4 }}>
      Exp: <b>{app.experience}</b> {app.location ? `• ${app.location}` : ""}
    </div>
  )}
  {(app.currentSalary || app.expectedSalary) && (
    <div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 2 }}>
      CTC: {app.currentSalary || "-"} → Exp: {app.expectedSalary || "-"}
    </div>
  )}
  {app.noticePeriod && (
    <div style={{ fontSize: 11, color: T.primary, marginTop: 2 }}>
      Notice: {app.noticePeriod}
    </div>
  )}
</td>

                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          background: T.bg,
                          padding: "4px 10px",
                          borderRadius: 7,
                          fontWeight: 600,
                          fontSize: 12.5,
                        }}
                      >
                        <Briefcase size={12} color={T.primary} /> {app.roleLabel}
                      </span>
                      {app.experience && (
                        <div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 4 }}>Exp: {app.experience}</div>
                      )}
                    </td>

                    <td style={{ padding: "12px 16px", fontSize: 12.5 }}>
                      {app.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                          <Phone size={12} color={T.good} />
                          <a href={`tel:${app.phone}`} style={{ color: T.text, textDecoration: "none", fontWeight: 600 }}>
                            {app.phone}
                          </a>
                        </div>
                      )}
                      {app.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: T.textSoft }}>
                          <Mail size={12} /> {app.email}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {app.resume && app.resume.startsWith("http") ? (
                          <a
                            href={app.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 10px",
                              background: T.primary,
                              color: "#fff",
                              borderRadius: 7,
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <FileText size={12} /> Resume
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: T.textFaint }}>No link</span>
                        )}

                        {app.portfolio && app.portfolio.startsWith("http") && (
                          <a
                            href={app.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 9px",
                              border: `1px solid ${T.border}`,
                              color: T.text,
                              borderRadius: 7,
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <ExternalLink size={12} /> Portfolio
                          </a>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", fontFamily: monoFont, fontSize: 12, color: T.textSoft }}>
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent"}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <select
                        disabled={updatingRow === rowKey}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app, e.target.value)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 8,
                          border: "none",
                          fontWeight: 700,
                          fontSize: 12,
                          background: badge.bg,
                          color: badge.color,
                          cursor: "pointer",
                        }}
                      >
                        <option value="New">New</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add New Job Sheet / Web App URL */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: T.surface,
              borderRadius: 16,
              width: "100%",
              maxWidth: 480,
              padding: 24,
              boxShadow: T.shadowLg,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontFamily: displayFont, fontSize: 17, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Link2 size={18} color={T.primary} /> Connect Job Google Sheet / URL
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ border: "none", background: T.bg, borderRadius: "50%", width: 28, height: 28, cursor: "pointer" }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddJobSource} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                  Job Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Video Editor, Graphic Designer, SEO Executive"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 9,
                    border: `1px solid ${T.border}`,
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                  Google Sheet Link / Sheet ID / Web App URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={newSheetUrl}
                  onChange={(e) => setNewSheetUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 9,
                    border: `1px solid ${T.border}`,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: 11.5, color: T.textFaint, display: "block", marginTop: 5 }}>
                  Tip: Seedha browser se Google Sheet ka URL copy karke paste kar dein — alag Apps Script deploy karne ki zaroorat nahi!
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 9,
                    border: `1px solid ${T.border}`,
                    background: T.bg,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingSource} style={primaryBtn}>
                  {savingSource ? "Connecting..." : "Save & Connect Sheet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}