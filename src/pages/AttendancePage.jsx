import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { T, bodyFont, displayFont, monoFont, cardStyle, primaryBtn, PageHeader } from "../theme";

// Yahan apna DW_Attendance_DB Web App URL paste karein:
const ATTENDANCE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTebnF_YNwzq8dWEWC3AqiXuAvqS1PcoqiOcKUGmL6acujjZTanl77vdmZ0l8pXsfW/exec";

const MONTHS_LIST = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS_LIST = ["2025", "2026", "2027", "2028", "2029", "2030"];

export default function AttendancePage({ currentUser }) {
  const isAdmin = currentUser?.role === "admin";

  const [monthPart, setMonthPart] = useState("Nov");
  const [yearPart, setYearPart] = useState("2026");
  const selectedMonth = `${monthPart}_${yearPart}`;

  const [uploadedMonths, setUploadedMonths] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEmp, setExpandedEmp] = useState(null);

  const fetchMonthsAndData = async (targetMonth) => {
    if (!ATTENDANCE_SCRIPT_URL || !ATTENDANCE_SCRIPT_URL.startsWith("http")) return;
    try {
      setLoading(true);
      const mRes = await fetch(`${ATTENDANCE_SCRIPT_URL}?action=getMonths`);
      const mData = await mRes.json();
      if (mData.months && Array.isArray(mData.months)) {
        setUploadedMonths(mData.months);
      }

      const dRes = await fetch(
        `${ATTENDANCE_SCRIPT_URL}?action=getMonth&month=${encodeURIComponent(targetMonth)}`
      );
      const dData = await dRes.json();
      setRecords(Array.isArray(dData.records) ? dData.records : []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthsAndData(selectedMonth);
  }, [selectedMonth]);

  // Quick-jump chip click handler
  const handleSelectSavedMonth = (mStr) => {
    const parts = mStr.split("_");
    if (parts.length === 2) {
      setMonthPart(parts[0]);
      setYearPart(parts[1]);
    }
  };

  // Excel / CSV File Upload & Parse
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      const normalized = rawRows
        .map((row) => {
          const getCol = (...keys) => {
            for (const k of keys) {
              const found = Object.keys(row).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
              if (found && row[found] !== "") return String(row[found]).trim();
            }
            return "";
          };
          return {
            date: getCol("Date", "Day"),
            empCode: getCol("Emp Code", "EmpCode", "Code", "ID"),
            name: getCol("Employee Name", "Name", "Employee"),
            punchIn: getCol("Punch In", "In Time", "InTime", "In") || "00:00",
            punchOut: getCol("Punch Out", "Out Time", "OutTime", "Out") || "00:00",
            duration: getCol("Duration", "Work Duration", "WorkDur", "Total") || "00:00",
            timing: getCol("Timing", "Status", "Remark") || "On Time (Present)",
          };
        })
        .filter((r) => r.name && r.date);

      if (normalized.length === 0) {
        alert("Excel file mein valid columns (Date, Employee Name, Punch In, Punch Out, Duration, Timing) nahi mile.");
        return;
      }

      setRecords(normalized);

      if (!ATTENDANCE_SCRIPT_URL || !ATTENDANCE_SCRIPT_URL.startsWith("http")) {
        alert("⚠️ ATTENDANCE_SCRIPT_URL set nahi hai! AttendancePage.jsx mein apna Google Apps Script URL paste karein.");
        return;
      }

      const res = await fetch(ATTENDANCE_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          month: selectedMonth,
          records: normalized,
        }),
      });

      const rawText = await res.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Apps Script Raw Response:", rawText);
        alert("⚠️ Apps Script Response Error: Apps Script mein New Version deploy karein.");
        return;
      }

      if (result.success) {
        alert(`✅ ${selectedMonth} ki ${result.count} rows Google Sheet mein save ho gayi!`);
        fetchMonthsAndData(selectedMonth);
      } else {
        alert("❌ Google Sheet save error: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      alert("Excel read error: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Employee-wise grouping + Monthly Summary Calculation
  const employeeSummaries = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const name = String(r["Employee Name"] || r.name || "").trim();
      const code = String(r["Emp Code"] || r.empCode || "").trim();
      if (!name) return;

      // Employee role filter: Employee ko sirf apni attendance dikhegi
      if (!isAdmin && currentUser?.name) {
        if (!name.toLowerCase().includes(currentUser.name.trim().toLowerCase())) return;
      }

      const key = `${code}_${name}`;
      if (!map[key]) {
        map[key] = {
          empCode: code,
          name,
          days: [],
          present: 0,
          late: 0,
          halfDay: 0,
          absent: 0,
          weekOff: 0,
        };
      }

      const timing = String(r.Timing || r.timing || "");
      const lower = timing.toLowerCase();
      if (lower.includes("weekly") || lower.includes("wo")) map[key].weekOff += 1;
      else if (lower.includes("absent")) map[key].absent += 1;
      else if (lower.includes("half")) {
        map[key].halfDay += 1;
        map[key].present += 0.5;
      } else if (lower.includes("late")) {
        map[key].late += 1;
        map[key].present += 1;
      } else {
        map[key].present += 1;
      }

      map[key].days.push({
        date: r.Date || r.date,
        punchIn: r["Punch In"] || r.punchIn || "00:00",
        punchOut: r["Punch Out"] || r.punchOut || "00:00",
        duration: r.Duration || r.duration || "00:00",
        timing,
      });
    });

    return Object.values(map).filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, isAdmin, currentUser, searchTerm]);

  // 1. Download Single Employee Excel Sheet
  const handleDownloadEmployeeSheet = (e, emp) => {
    e.stopPropagation(); // Accordion open/close trigger rokne ke liye
    const sheetRows = emp.days.map((d) => ({
      Date: d.date,
      "Emp Code": emp.empCode,
      "Employee Name": emp.name,
      "Punch In": d.punchIn,
      "Punch Out": d.punchOut,
      Duration: d.duration,
      Timing: d.timing,
    }));

    // Bottom Summary Row
    sheetRows.push({});
    sheetRows.push({
      Date: "SUMMARY",
      "Emp Code": `Present: ${emp.present}`,
      "Employee Name": `Late: ${emp.late}`,
      "Punch In": `Half-Day: ${emp.halfDay}`,
      "Punch Out": `Absent: ${emp.absent}`,
      Duration: `Week Off: ${emp.weekOff}`,
      Timing: selectedMonth,
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedMonth);

    const safeName = emp.name.replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(workbook, `${safeName}_${selectedMonth}_Attendance.xlsx`);
  };

  // 2. Download Full Month Excel Sheet (All Employees)
  const handleDownloadFullMonthSheet = () => {
    if (employeeSummaries.length === 0) {
      alert("Download karne ke liye is mahine ka koi record nahi hai.");
      return;
    }

    const allRows = [];
    employeeSummaries.forEach((emp) => {
      emp.days.forEach((d) => {
        allRows.push({
          Date: d.date,
          "Emp Code": emp.empCode,
          "Employee Name": emp.name,
          "Punch In": d.punchIn,
          "Punch Out": d.punchOut,
          Duration: d.duration,
          Timing: d.timing,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(allRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedMonth);
    XLSX.writeFile(workbook, `DW_Full_Attendance_${selectedMonth}.xlsx`);
  };

  const getStatusBadgeStyle = (timing) => {
    const t = String(timing).toLowerCase();
    if (t.includes("absent")) return { bg: T.badSoft, color: T.bad };
    if (t.includes("late") || t.includes("half")) return { bg: T.warnSoft, color: T.warn };
    if (t.includes("weekly")) return { bg: T.bg, color: T.textFaint };
    return { bg: T.goodSoft, color: T.good };
  };

  return (
    <div style={{ width: "100%", padding: "0 10px 40px 10px", fontFamily: bodyFont }}>
      {/* Header & Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <PageHeader
          title="Biometric Attendance (eSSL)"
          subtitle="Kisi bhi month/year ki Excel upload karein aur individual ya full month sheet download karein"
        />

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* 12 Months Selector */}
          <select
            value={monthPart}
            onChange={(e) => setMonthPart(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: T.surface,
              fontWeight: 700,
              fontSize: 13.5,
              color: T.text,
            }}
          >
            {MONTHS_LIST.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Multi-Year Selector */}
          <select
            value={yearPart}
            onChange={(e) => setYearPart(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: T.surface,
              fontWeight: 700,
              fontSize: 13.5,
              color: T.text,
            }}
          >
            {YEARS_LIST.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchMonthsAndData(selectedMonth)}
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

          {employeeSummaries.length > 0 && (
            <button
              onClick={handleDownloadFullMonthSheet}
              style={{
                ...primaryBtn,
                background: T.good,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FileSpreadsheet size={15} /> Download Full Month
            </button>
          )}

          {isAdmin && (
            <label
              style={{
                ...primaryBtn,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
              }}
            >
              <Upload size={15} /> {uploading ? "Uploading..." : `Upload (${selectedMonth})`}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} style={{ display: "none" }} />
            </label>
          )}
        </div>
      </div>

      {/* Saved Months Quick-Switch Pills */}
      {uploadedMonths.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: T.textSoft }}>Uploaded Months:</span>
          {uploadedMonths.map((m) => {
            const isCurrent = m === selectedMonth;
            return (
              <button
                key={m}
                onClick={() => handleSelectSavedMonth(m)}
                style={{
                  border: `1px solid ${isCurrent ? T.primary : T.border}`,
                  background: isCurrent ? T.primary : T.surface,
                  color: isCurrent ? "#fff" : T.text,
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {m.replace("_", " ")}
              </button>
            );
          })}
        </div>
      )}

      {/* Top KPI Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <Users size={22} color={T.primary} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Total Employees</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700 }}>{employeeSummaries.length}</div>
          </div>
        </div>

        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <CheckCircle2 size={22} color={T.good} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Total Present Days</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: T.good }}>
              {employeeSummaries.reduce((acc, e) => acc + e.present, 0)}
            </div>
          </div>
        </div>

        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <Clock size={22} color={T.warn} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Late Marks</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: T.warn }}>
              {employeeSummaries.reduce((acc, e) => acc + e.late, 0)}
            </div>
          </div>
        </div>

        <div style={cardStyle({ padding: 16, display: "flex", alignItems: "center", gap: 12 })}>
          <XCircle size={22} color={T.bad} />
          <div>
            <div style={{ fontSize: 12, color: T.textFaint }}>Total Absents</div>
            <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, color: T.bad }}>
              {employeeSummaries.reduce((acc, e) => acc + e.absent, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isAdmin && (
        <div style={cardStyle({ padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 })}>
          <Search size={15} color={T.textFaint} />
          <input
            type="text"
            placeholder="Search employee name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: 13.5, background: "transparent" }}
          />
        </div>
      )}

      {/* Employee Monthly Summary & Expandable 1–30 Days Record */}
      {loading ? (
        <div style={{ padding: 50, textAlign: "center", color: T.textFaint }}>Attendance load ho rahi hai...</div>
      ) : employeeSummaries.length === 0 ? (
        <div style={cardStyle({ padding: 50, textAlign: "center", color: T.textFaint })}>
          <b>{selectedMonth.replace("_", " ")}</b> ka koi record nahi mila. Upar Month/Year select karke{" "}
          <b>"Upload ({selectedMonth})"</b> button se Excel upload karein!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {employeeSummaries.map((emp) => {
            const isOpen = expandedEmp === emp.name;
            return (
              <div key={emp.name} style={cardStyle({ overflow: "hidden", border: `1px solid ${T.border}` })}>
                {/* Summary Row */}
                <div
                  onClick={() => setExpandedEmp(isOpen ? null : emp.name)}
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    background: isOpen ? T.bg : T.surface,
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <span style={{ fontFamily: monoFont, fontSize: 11.5, color: T.primary, fontWeight: 700 }}>
                      {emp.empCode || "EMP"}
                    </span>
                    <h3 style={{ fontFamily: displayFont, fontSize: 16.5, margin: "2px 0 0", color: T.text }}>
                      {emp.name}
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: T.good, background: T.goodSoft, padding: "4px 10px", borderRadius: 8 }}>
                      Present: {emp.present}
                    </span>
                    <span style={{ color: T.warn, background: T.warnSoft, padding: "4px 10px", borderRadius: 8 }}>
                      Late: {emp.late}
                    </span>
                    <span style={{ color: T.warn, background: T.warnSoft, padding: "4px 10px", borderRadius: 8 }}>
                      Half-Day: {emp.halfDay}
                    </span>
                    <span style={{ color: T.bad, background: T.badSoft, padding: "4px 10px", borderRadius: 8 }}>
                      Absent: {emp.absent}
                    </span>
                    <span style={{ color: T.textSoft, background: T.bg, padding: "4px 10px", borderRadius: 8 }}>
                      WO: {emp.weekOff}
                    </span>

                    {/* Individual Employee Sheet Download Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDownloadEmployeeSheet(e, emp)}
                      title={`${emp.name} ki Excel Sheet download karein`}
                      style={{
                        border: `1px solid ${T.primary}`,
                        background: T.surface,
                        color: T.primary,
                        borderRadius: 8,
                        padding: "5px 11px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Download size={13} /> Download Sheet
                    </button>

                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expandable 1 to 30 Days Detailed Table */}
                {isOpen && (
                  <div style={{ overflowX: "auto", borderTop: `1px solid ${T.border}` }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: T.bg, textAlign: "left", color: T.textSoft }}>
                          <th style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>Date (1–30)</th>
                          <th style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>Employee Name</th>
                          <th style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>Punch In</th>
                          <th style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>Punch Out</th>
                          <th style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>Duration</th>
                          <th style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>Timing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emp.days.map((d, i) => {
                          const badge = getStatusBadgeStyle(d.timing);
                          return (
                            <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                              <td style={{ padding: "9px 14px", fontFamily: monoFont, fontWeight: 700 }}>
                                Day {d.date}
                              </td>
                              <td style={{ padding: "9px 14px", fontWeight: 600 }}>{emp.name}</td>
                              <td style={{ padding: "9px 14px", fontFamily: monoFont }}>{d.punchIn}</td>
                              <td style={{ padding: "9px 14px", fontFamily: monoFont }}>{d.punchOut}</td>
                              <td style={{ padding: "9px 14px", fontFamily: monoFont }}>{d.duration}</td>
                              <td style={{ padding: "9px 14px" }}>
                                <span
                                  style={{
                                    padding: "3px 10px",
                                    borderRadius: 999,
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    background: badge.bg,
                                    color: badge.color,
                                  }}
                                >
                                  {d.timing}
                                </span>
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
          })}
        </div>
      )}
    </div>
  );
}