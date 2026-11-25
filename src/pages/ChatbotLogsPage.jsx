import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  RefreshCw,
  PhoneCall,
  Flame,
  HelpCircle,
  Smartphone,
  Monitor,
} from "lucide-react";
import { T, bodyFont, displayFont, monoFont, cardStyle, primaryBtn, PageHeader } from "../theme";

// Yahan apna DW_Chatbot_Logs Web App URL paste karein:
const CHATBOT_LOGS_URL = "https://script.google.com/macros/s/AKfycbwF9wDx3kECpGoMTlD1AVBCk1OMcH5KerkQ5BYcmL_KEg5CRr9b3PjAZOOo0krsPNvb/exec";

export default function ChatbotLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); // All | Hot Lead | Unmatched

// fetchLogs function ko isse replace karein:
const fetchLogs = async () => {
  if (!CHATBOT_LOGS_URL || !CHATBOT_LOGS_URL.startsWith("http")) {
    alert("⚠️ CHATBOT_LOGS_URL paste nahi kiya gaya hai!");
    setLoading(false);
    return;
  }
  try {
    setLoading(true);
    const res = await fetch(`${CHATBOT_LOGS_URL}?t=${Date.now()}`, {
      method: "GET",
      redirect: "follow",
    });
    const data = await res.json();
    const rawLogs = Array.isArray(data) ? data : data.logs || [];

    // Case-insensitive normalization taaki kisi bhi header naam se data dikh jaye
    const normalized = rawLogs.map((raw, idx) => {
      const getCol = (...keys) => {
        for (const k of keys) {
          if (raw[k] !== undefined && raw[k] !== "") return raw[k];
          const found = Object.keys(raw).find((rk) =>
            rk.trim().toLowerCase().includes(k.toLowerCase())
          );
          if (found && raw[found] !== undefined && raw[found] !== "") return raw[found];
        }
        return "";
      };

      return {
        rowNumber: raw.rowNumber || idx + 2,
        Timestamp: getCol("timestamp", "time", "date"),
        "Session ID": getCol("session", "visitor", "id") || "VISITOR",
        "User Query": getCol("user query", "query", "message", "question", "text"),
        "Matched Category": getCol("matched category", "category", "topic") || "unmatched",
        "Detected Lead (Phone/Email)": getCol("detected lead", "lead", "phone", "email", "contact"),
        "Page URL": getCol("page url", "page", "url") || "/",
        Device: getCol("device") || "Desktop",
        Status: getCol("status") || "New",
      };
    });

    setLogs(normalized);
  } catch (err) {
    console.error("Chatbot logs fetch error:", err);
    alert("Logs load karne me error: " + err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleStatusChange = async (rowNumber, newStatus) => {
    setLogs((prev) => prev.map((l) => (l.rowNumber === rowNumber ? { ...l, Status: newStatus } : l)));
    try {
      await fetch(CHATBOT_LOGS_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "updateStatus", rowNumber, status: newStatus }),
      });
    } catch (err) {}
  };

  // Top Asked Categories Summary
  const topTopics = useMemo(() => {
    const counts = {};
    logs.forEach((l) => {
      const cat = String(l["Matched Category"] || "unmatched");
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = String(l["User Query"] || "").toLowerCase();
      const lead = String(l["Detected Lead (Phone/Email)"] || "").toLowerCase();
      const cat = String(l["Matched Category"] || "").toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = q.includes(term) || lead.includes(term) || cat.includes(term);
      if (filterType === "Hot Lead") return matchesSearch && lead.trim() !== "";
      if (filterType === "Unmatched") return matchesSearch && cat === "unmatched";
      return matchesSearch;
    });
  }, [logs, searchTerm, filterType]);

  return (
    <div style={{ width: "100%", padding: "0 10px 40px 10px", fontFamily: bodyFont }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <PageHeader
          title={`Chotu AI Chat Logs (${logs.length})`}
          subtitle="Website visitors Chotu chatbot par kya search kar rahe hain aur kaunse phone numbers/leads mile hain"
        />

        <button
          onClick={fetchLogs}
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
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Logs
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <MessageSquare size={22} color={T.primary} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Total Questions Asked</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700 }}>{logs.length}</div>
          </div>
        </div>

        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <Flame size={22} color={T.good} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Hot Leads (Phone/Email)</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: T.good }}>
              {logs.filter((l) => String(l["Detected Lead (Phone/Email)"] || "").trim() !== "").length}
            </div>
          </div>
        </div>

        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <HelpCircle size={22} color={T.warn} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Unanswered / New Queries</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: T.warn }}>
              {logs.filter((l) => String(l["Matched Category"] || "") === "unmatched").length}
            </div>
          </div>
        </div>
      </div>

      {/* Top Searched Topics Pills */}
      {topTopics.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.textSoft }}>Most Searched Topics:</span>
          {topTopics.map(([topic, count]) => (
            <span
              key={topic}
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                padding: "4px 11px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
              }}
            >
              {topic.replace("_", " ").toUpperCase()} ({count})
            </span>
          ))}
        </div>
      )}

      {/* Filter & Search Bar */}
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
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Hot Lead", "Unmatched"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "6px 13px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                background: filterType === tab ? T.primary : T.bg,
                color: filterType === tab ? "#fff" : T.textSoft,
              }}
            >
              {tab}
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
            placeholder="Search user question or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 13 }}
          />
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ padding: 50, textAlign: "center", color: T.textFaint }}>Chotu chat logs load ho rahe hain...</div>
      ) : filteredLogs.length === 0 ? (
        <div style={cardStyle({ padding: 50, textAlign: "center", color: T.textFaint })}>
          Abhi tak koi chat query record nahi hui hai.
        </div>
      ) : (
        <div style={cardStyle({ overflowX: "auto", border: `1px solid ${T.border}` })}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: T.bg, textAlign: "left", color: T.textSoft }}>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Time & Visitor</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>User Question / Search</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Topic</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Lead Contact</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Page</th>
                <th style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => {
                const lead = String(log["Detected Lead (Phone/Email)"] || "").trim();
                const cat = String(log["Matched Category"] || "unmatched");
                const isMobile = String(log.Device || "").toLowerCase() === "mobile";

                return (
                  <tr key={log.rowNumber || idx} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: "12px 16px", fontSize: 12 }}>
                      <div style={{ fontFamily: monoFont, color: T.text, fontWeight: 600 }}>
                        {log.Timestamp
                          ? new Date(log.Timestamp).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recent"}
                      </div>
                      <div style={{ color: T.textFaint, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        {isMobile ? <Smartphone size={11} /> : <Monitor size={11} />}
                        {log["Session ID"]}
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", fontWeight: 600, color: T.text, maxWidth: 320 }}>
                      "{log["User Query"]}"
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 9px",
                          borderRadius: 7,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: cat === "unmatched" ? T.warnSoft : "rgba(0, 82, 255, 0.08)",
                          color: cat === "unmatched" ? T.warn : T.primary,
                        }}
                      >
                        {cat}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      {lead ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: T.goodSoft,
                            color: T.good,
                            padding: "4px 10px",
                            borderRadius: 7,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          <PhoneCall size={12} /> {lead}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: T.textFaint }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: "12px 16px", fontFamily: monoFont, fontSize: 12, color: T.textSoft }}>
                      {log["Page URL"] || "/"}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <select
                        value={log.Status || "New"}
                        onChange={(e) => handleStatusChange(log.rowNumber, e.target.value)}
                        style={{
                          padding: "5px 9px",
                          borderRadius: 8,
                          border: `1px solid ${T.border}`,
                          fontSize: 12,
                          fontWeight: 600,
                          background: T.surface,
                        }}
                      >
                        <option value="New">New</option>
                        <option value="Hot Lead">Hot Lead</option>
                        <option value="Followed Up">Followed Up</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}