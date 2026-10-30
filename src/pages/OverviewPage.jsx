import React, { useState, useEffect } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, Clock, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, XCircle, MoreHorizontal, Users, FileText, Search } from "lucide-react";
import { T, bodyFont, displayFont, monoFont, cardStyle, StatusPill } from "../theme";

function KPICard({ label, value, unit, delta, positive, Icon, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={cardStyle({ 
        padding: "18px 20px", 
        display: "flex", 
        flexDirection: "column", 
        gap: 10, 
        minWidth: 0,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease"
      })}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: T.textSoft, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, ${T.sky})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(47,92,255,0.32)", flexShrink: 0 }}>
          <Icon size={15} color="#fff" strokeWidth={2.4} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 600, color: T.text }}>{value}</span>
        {unit && <span style={{ fontFamily: bodyFont, fontSize: 13, color: T.textSoft }}>{unit}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {positive ? <ArrowUpRight size={13} color={T.good} strokeWidth={2.5} /> : <ArrowDownRight size={13} color={T.bad} strokeWidth={2.5} />}
        <span style={{ fontFamily: monoFont, fontSize: 12, color: positive ? T.good : T.bad, fontWeight: 600 }}>{delta}</span>
        <span style={{ fontFamily: bodyFont, fontSize: 12, color: T.textFaint }}>vs last month</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, suffix }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: T.navy, borderRadius: 10, padding: "9px 13px", fontFamily: monoFont, fontSize: 11.5, color: "#fff", border: `1px solid ${T.navyMid}`, boxShadow: T.shadowLg }}>
      <div style={{ color: T.sky, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          <span style={{ opacity: 0.7 }}>{p.name}</span>
          <span>{p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

const fleetStatusMap = {
  online: { label: "Online", color: T.good, soft: T.goodSoft, Icon: CheckCircle2 },
  degraded: { label: "Degraded", color: T.warn, soft: T.warnSoft, Icon: AlertTriangle },
  offline: { label: "Offline", color: T.bad, soft: T.badSoft, Icon: XCircle },
};

const priorityColor = { High: T.bad, Medium: T.warn, Low: T.textSoft };
const prioritySoft = { High: T.badSoft, Medium: T.warnSoft, Low: T.bg };

export default function OverviewPage({ traffic, latency, fleet, tickets, totalIn, range, setRange, goto }) {
  const [employeeList, setEmployeeList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const scriptURL = 'https://script.google.com/macros/s/AKfycbw9bEufFnegV2BN74ZUaCl5Q2QGtuYtVcbpgUf2EE2ZQ4qa6Q0_9XOMJrkLFeW76C-c/exec';

  const formatImageSrc = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim().replace(/^['"]|['"]$/g, '');
    if (cleanUrl.includes("cloudinary.com")) return cleanUrl;
    if (cleanUrl.includes("drive.google.com") || cleanUrl.includes("googleusercontent.com")) {
      const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
      }
    }
    return cleanUrl.startsWith("http") ? cleanUrl : null;
  };

  useEffect(() => {
    setLoadingEmployees(true);
    fetch(scriptURL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEmployeeList(data);
        }
      })
      .catch(err => console.error("Error fetching employees on overview:", err))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const filteredEmployees = employeeList.filter(emp => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (emp.name || "").toLowerCase().includes(term);
    const deptMatch = (emp.department || "").toLowerCase().includes(term);
    const roleMatch = (emp.role || "").toLowerCase().includes(term);
    return nameMatch || deptMatch || roleMatch;
  });

  return (
    <>
      {/* Top Search Bar */}
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8, 
          background: T.surface, 
          border: `1px solid ${T.border}`, 
          borderRadius: 10, 
          padding: "8px 14px", 
          width: "100%", 
          maxWidth: 340,
          boxShadow: T.shadowSm 
        }}>
          <Search size={16} color={T.textFaint} />
          <input 
            type="text" 
            placeholder="Search employee by name, dept, role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              border: "none", 
              outline: "none", 
              background: "transparent", 
              fontFamily: bodyFont, 
              fontSize: 13, 
              color: T.text, 
              width: "100%" 
            }}
          />
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard 
          label="Total Employees" 
          value={employeeList.length < 10 ? `0${employeeList.length}` : employeeList.length} 
          unit="team members" 
          delta="+Live" 
          positive 
          Icon={Users} 
          onClick={() => goto && goto("Employees")}
        />
        <KPICard 
          label="Total Blogs" 
          value="24" 
          unit="published" 
          delta="+Live" 
          positive 
          Icon={FileText} 
        />
        <KPICard 
          label="Uptime (30d)" 
          value="99.97" 
          unit="%" 
          delta="+0.04%" 
          positive 
          Icon={Activity} 
        />
        <KPICard 
          label="Avg Response" 
          value="38" 
          unit="ms" 
          delta="-5ms" 
          positive 
          Icon={Clock} 
        />
      </div>

      <div className="charts-grid">
        <div style={cardStyle({ padding: "18px 20px" })}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600, color: T.text }}>Network Traffic</div>
              <div style={{ fontFamily: monoFont, fontSize: 11, color: T.textFaint, marginTop: 2 }}>{totalIn.toLocaleString()} GB inbound today</div>
            </div>
            <div style={{ display: "flex", gap: 4, background: T.bg, borderRadius: 9, padding: 3 }}>
              {["24h", "7d", "30d"].map((r) => (
                <button key={r} onClick={() => setRange(r)} style={{ border: "none", cursor: "pointer", padding: "5px 11px", borderRadius: 7, fontFamily: bodyFont, fontSize: 11.5, fontWeight: 700, background: range === r ? `linear-gradient(135deg, ${T.primary}, ${T.accent})` : "transparent", color: range === r ? "#fff" : T.textFaint, boxShadow: range === r ? "0 4px 10px rgba(47,92,255,0.35)" : "none" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={traffic} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.primary} stopOpacity={0.38} />
                  <stop offset="100%" stopColor={T.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.sky} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={T.sky} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="t" tick={{ fontFamily: monoFont, fontSize: 10.5, fill: T.textFaint }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fontFamily: monoFont, fontSize: 10.5, fill: T.textFaint }} axisLine={false} tickLine={false} width={34} />
              <Tooltip content={<CustomTooltip suffix=" GB" />} />
              <Area type="monotone" dataKey="in" name="Inbound" stroke={T.primary} strokeWidth={2} fill="url(#inGrad)" />
              <Area type="monotone" dataKey="out" name="Outbound" stroke={T.sky} strokeWidth={2} fill="url(#outGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Active Employees List with Images */}
        <div style={cardStyle({ padding: "18px 20px", display: "flex", flexDirection: "column" })}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600, color: T.text }}>Active Employees</div>
              <div style={{ fontFamily: monoFont, fontSize: 11, color: T.textFaint, marginTop: 2 }}>
                {filteredEmployees.length} of {employeeList.length} members shown
              </div>
            </div>
            <button 
              onClick={() => goto && goto("Employees")}
              style={{ border: "none", background: "none", color: T.primary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: bodyFont }}
            >
              View Directory →
            </button>
          </div>

          <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
            {loadingEmployees ? (
              <div style={{ textAlign: "center", padding: "30px 0", fontFamily: bodyFont, fontSize: 12.5, color: T.textFaint }}>
                Loading active employees...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", fontFamily: bodyFont, fontSize: 12.5, color: T.textFaint }}>
                Koi employee record nahi mila.
              </div>
            ) : (
              filteredEmployees.map((emp, index) => {
                const photoSrc = formatImageSrc(emp.photoUrl || emp.photo);
                return (
                  <div 
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: T.bg,
                      borderRadius: 9,
                      border: `1px solid ${T.border}`
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: "50%", 
                        background: `linear-gradient(135deg, ${T.primary}, ${T.sky})`, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        color: "#fff", 
                        fontSize: 11, 
                        fontWeight: 700, 
                        overflow: "hidden", 
                        flexShrink: 0 
                      }}>
                        {photoSrc ? (
                          <img 
                            src={photoSrc} 
                            alt={emp.name} 
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.target.style.display = 'none'; }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                        ) : (
                          emp.name ? emp.name.slice(0, 2).toUpperCase() : "EM"
                        )}
                      </div>
                      <div>
                        <div style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: T.text }}>{emp.name}</div>
                        <div style={{ fontFamily: monoFont, fontSize: 10.5, color: T.textFaint }}>{emp.department || "General"}</div>
                      </div>
                    </div>

                    <span style={{ 
                      fontFamily: monoFont, 
                      fontSize: 10, 
                      fontWeight: 700, 
                      color: T.good, 
                      background: T.goodSoft, 
                      padding: "3px 8px", 
                      borderRadius: 999 
                    }}>
                      Active
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Avg Latency Section */}
      <div style={{ marginTop: 16 }}>
        <div style={cardStyle({ padding: "18px 20px" })}>
          <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>Avg Latency</div>
          <div style={{ fontFamily: monoFont, fontSize: 11, color: T.textFaint, marginBottom: 14 }}>7-day trend, milliseconds</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={latency} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="t" tick={{ fontFamily: monoFont, fontSize: 10.5, fill: T.textFaint }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fontFamily: monoFont, fontSize: 10.5, fill: T.textFaint }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip suffix="ms" />} />
              <Line type="monotone" dataKey="ms" name="Latency" stroke={T.sky} strokeWidth={2.6} dot={{ r: 3.5, fill: T.sky, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5, fill: T.primary }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-grid" style={{ marginTop: 16 }}>
        <div style={cardStyle({ padding: "18px 20px" })}>
          <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 14 }}>Server Fleet</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {fleet.map((s) => (
              <div key={s.name} className="fleet-row">
                <div style={{ width: 34, height: 34, borderRadius: 10, background: fleetStatusMap[s.status].soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <s.icon size={15} color={fleetStatusMap[s.status].color} />
                </div>
                <div className="fleet-info">
                  <div style={{ fontFamily: monoFont, fontSize: 12.5, fontWeight: 600, color: T.text }}>{s.name}</div>
                  <div style={{ fontFamily: bodyFont, fontSize: 11, color: T.textFaint }}>{s.region}</div>
                </div>
                <div className="fleet-meta">
                  <div style={{ fontFamily: monoFont, fontSize: 11.5, color: T.textSoft }}>{s.load}% load</div>
                  <StatusPill status={s.status} map={fleetStatusMap} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle({ padding: "18px 20px" })}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600, color: T.text }}>Recent Tickets</div>
            <span style={{ fontFamily: bodyFont, fontSize: 12, color: T.primary, fontWeight: 600, cursor: "pointer" }}>View all</span>
          </div>
          <div className="table-wrap">
            <table className="ticket-table">
              <thead>
                <tr>
                  {["ID", "Subject", "Client", "Priority", "Age", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700, color: T.textFaint, letterSpacing: 0.4, textTransform: "uppercase", padding: "0 4px 8px", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((tk) => (
                  <tr key={tk.id}>
                    <td data-label="ID" style={{ padding: "10px 4px", borderBottom: `1px solid ${T.border}`, fontFamily: monoFont, fontSize: 11.5, color: T.primary, fontWeight: 600 }}>{tk.id}</td>
                    <td data-label="Subject" style={{ padding: "10px 4px", borderBottom: `1px solid ${T.border}`, fontFamily: bodyFont, fontSize: 12.5, color: T.text, maxWidth: 200 }}>{tk.subject}</td>
                    <td data-label="Client" style={{ padding: "10px 4px", borderBottom: `1px solid ${T.border}`, fontFamily: bodyFont, fontSize: 12, color: T.textSoft }}>{tk.client}</td>
                    <td data-label="Priority" style={{ padding: "10px 4px", borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700, color: priorityColor[tk.priority], background: prioritySoft[tk.priority], padding: "3px 8px", borderRadius: 999, display: "inline-block" }}>{tk.priority}</span>
                    </td>
                    <td data-label="Age" style={{ padding: "10px 4px", borderBottom: `1px solid ${T.border}`, fontFamily: monoFont, fontSize: 11.5, color: T.textFaint }}>{tk.age}</td>
                    <td className="no-label" style={{ padding: "10px 4px", borderBottom: `1px solid ${T.border}`, textAlign: "right" }}>
                      <MoreHorizontal size={14} color={T.textFaint} style={{ cursor: "pointer" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}