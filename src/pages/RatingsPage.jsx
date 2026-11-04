import React, { useState, useEffect, useMemo } from "react";
import { Star, Trophy, Award, MessageSquare, Plus, CheckCircle2, TrendingUp, Calendar } from "lucide-react";
import { T, bodyFont, displayFont, cardStyle, primaryBtn, inputStyle, PageHeader } from "../theme";
import { apiRequest } from "../api";

export default function RatingsPage({ currentUser }) {
  const isAdmin = currentUser?.role === "admin";
  const [myRatings, setMyRatings] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State (Admin)
  const [form, setForm] = useState({
    employeeId: "",
    month: "November 2026",
    stars: 5,
    feedback: "",
  });
  const [saving, setSaving] = useState(false);

  const monthsList = [
    "January 2026", "February 2026", "March 2026", "April 2026",
    "May 2026", "June 2026", "July 2026", "August 2026",
    "September 2026", "October 2026", "November 2026", "December 2026"
  ];

 const loadData = async () => {
    try {
      setLoading(true);

      // 1. Sabhi employees ki ratings fetch karein (Dono Cards calculate karne ke liye)
      const allR = await apiRequest("/ratings/all");
      setAllRatings(allR || []);

      if (isAdmin) {
        // Admin ke liye employees list form dropdown ke liye
        const empData = await apiRequest("/employees");
        setEmployees(empData || []);
        if (empData && empData.length > 0) {
          setForm((prev) => ({ ...prev, employeeId: empData[0]._id }));
        }
      } else {
        // Employee ke liye uski personal history
        const myR = await apiRequest("/ratings/my");
        setMyRatings(myR || []);
      }
    } catch (err) {
      console.error("Ratings load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- CALCULATION LOGIC: Overall vs Strictly Previous Calendar Month ---
  const { overallTop, lastMonthTop, previousMonthName } = useMemo(() => {
const dataSource = allRatings;
    // 1. Current Date se Previous Month nikalna (e.g., November chal raha hai toh October 2026)
    const today = new Date();
    const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonthFormatted = prevDate.toLocaleString("en-US", { month: "long", year: "numeric" }); // "October 2026"

    if (!dataSource || dataSource.length === 0) {
      return { overallTop: null, lastMonthTop: null, previousMonthName: prevMonthFormatted };
    }

    // 2. OVERALL TOP PERFORMER (Across all months)
    const empAggregates = {};
    dataSource.forEach((r) => {
      const empId = r.employeeId?._id || r.employeeId || "unknown";
      const name = r.employeeId?.name || "Employee";
      const designation = r.employeeId?.designation || r.employeeId?.department || "Team Member";
      const photo = r.employeeId?.photoUrl || null;
      const stars = Number(r.stars || r.rating || 0);

      if (!empAggregates[empId]) {
        empAggregates[empId] = {
          id: empId,
          name,
          designation,
          photo,
          totalStars: 0,
          entries: 0,
        };
      }
      empAggregates[empId].totalStars += stars;
      empAggregates[empId].entries += 1;
    });

    const overallSorted = Object.values(empAggregates).sort((a, b) => {
      if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
      return (b.totalStars / b.entries) - (a.totalStars / a.entries);
    });

    const calcOverallTop = overallSorted[0] || null;

    // 3. STRICTLY PREVIOUS MONTH TOP PERFORMER (Only matching previousMonthName, e.g. "October 2026")
    const targetMonthStr = prevMonthFormatted.trim().toLowerCase();
    const prevMonthEntries = dataSource.filter(
      (r) => r.month && r.month.trim().toLowerCase() === targetMonthStr
    );

    const monthAggregates = {};
    prevMonthEntries.forEach((r) => {
      const empId = r.employeeId?._id || r.employeeId || "unknown";
      const name = r.employeeId?.name || "Employee";
      const designation = r.employeeId?.designation || r.employeeId?.department || "Team Member";
      const photo = r.employeeId?.photoUrl || null;
      const stars = Number(r.stars || r.rating || 0);

      if (!monthAggregates[empId]) {
        monthAggregates[empId] = {
          id: empId,
          name,
          designation,
          photo,
          stars: 0,
          entries: 0,
          feedback: r.feedback || "",
        };
      }
      monthAggregates[empId].stars += stars;
      monthAggregates[empId].entries += 1;
    });

    // Highest Stars in Previous Month first
    const lastMonthSorted = Object.values(monthAggregates).sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return (b.stars / b.entries) - (a.stars / a.entries);
    });

    const calcLastMonthTop = lastMonthSorted[0] || null;

    return {
      overallTop: calcOverallTop,
      lastMonthTop: calcLastMonthTop,
      previousMonthName: prevMonthFormatted,
    };
  }, [allRatings, myRatings]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await apiRequest("/ratings", "POST", form);
      alert(res.message || "Rating save ho gayi!");
      setForm((prev) => ({ ...prev, feedback: "" }));
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ width: "100%", padding: "0 10px 40px 10px", fontFamily: bodyFont }}>
      <PageHeader
        title="Performance & Rankings"
        subtitle="Monthly ratings, feedback aur company top performers"
      />

      {/* 1. TOP 2 CARDS: Overall Champion & Strictly Previous Calendar Month Winner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* LEFT CARD: All-Time Top Performer */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)",
            borderRadius: 18,
            padding: "22px 24px",
            color: "#fff",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid #fff",
                  flexShrink: 0,
                }}
              >
                {overallTop?.photo ? (
                  <img src={overallTop.photo} alt={overallTop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Trophy size={30} color="#78350f" />
                )}
              </div>
              <div>
                <span
                  style={{
                    background: "rgba(245, 158, 11, 0.25)",
                    color: "#fef3c7",
                    border: "1px solid #f59e0b",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 4,
                  }}
                >
                  <Award size={12} /> ALL-TIME CHAMPION
                </span>
                <h3 style={{ fontFamily: displayFont, fontSize: 18, margin: 0, fontWeight: 700 }}>
                  {overallTop?.name || "Evaluating..."}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#cbd5e1" }}>
                  {overallTop?.designation || "Digital Whopper Team"}
                </p>
              </div>
            </div>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={20} color="#38bdf8" />
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Total Stars Earned</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                {overallTop ? `${overallTop.totalStars} Stars` : "0"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Average Score</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#38bdf8" }}>
                {overallTop && overallTop.entries > 0
                  ? `${(overallTop.totalStars / overallTop.entries).toFixed(1)} / 5.0`
                  : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Strictly Last Calendar Month Top Performer */}
        <div
          style={{
            background: "linear-gradient(135deg, #0b132b 0%, #1c2541 60%, #3a506b 100%)",
            borderRadius: 18,
            padding: "22px 24px",
            color: "#fff",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid #fff",
                  flexShrink: 0,
                }}
              >
                {lastMonthTop?.photo ? (
                  <img src={lastMonthTop.photo} alt={lastMonthTop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Award size={30} color="#fff" />
                )}
              </div>
              <div>
                <span
                  style={{
                    background: "rgba(56, 189, 248, 0.2)",
                    color: "#bae6fd",
                    border: "1px solid #38bdf8",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 4,
                  }}
                >
                  <Calendar size={12} /> {previousMonthName.toUpperCase()} WINNER
                </span>
                <h3 style={{ fontFamily: displayFont, fontSize: 18, margin: 0, fontWeight: 700 }}>
                  {lastMonthTop ? lastMonthTop.name : "No Record Found"}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#cbd5e1" }}>
                  {lastMonthTop ? (lastMonthTop.designation || "Digital Whopper") : `No ratings submitted for ${previousMonthName}`}
                </p>
              </div>
            </div>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trophy size={20} color="#f59e0b" />
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Monthly Rating</div>
              <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < (lastMonthTop?.stars || 0) ? "#f59e0b" : "none"}
                    color={i < (lastMonthTop?.stars || 0) ? "#f59e0b" : "rgba(255,255,255,0.25)"}
                  />
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Total Stars</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>
                {lastMonthTop ? `${lastMonthTop.stars} Stars` : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADMIN SECTION: Give Rating Form */}
      {isAdmin && (
        <div style={cardStyle({ padding: 22, marginBottom: 24 })}>
          <h3
            style={{
              fontFamily: displayFont,
              fontSize: 17,
              fontWeight: 700,
              margin: "0 0 16px 0",
              color: T.text,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={18} color={T.primary} /> Give / Update Employee Rating
          </h3>

          <form onSubmit={handleRatingSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>
                Select Employee
              </label>
              <select
                style={inputStyle}
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.department || "Team"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>
                Evaluation Month
              </label>
              <select
                style={inputStyle}
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                required
              >
                {monthsList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>
                Rating Stars (1 to 5)
              </label>
              <select
                style={inputStyle}
                value={form.stars}
                onChange={(e) => setForm({ ...form, stars: Number(e.target.value) })}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Good)</option>
                <option value={2}>⭐⭐ (2 - Average)</option>
                <option value={1}>⭐ (1 - Needs Improvement)</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>
                Performance Feedback / Comment
              </label>
              <input
                style={inputStyle}
                placeholder="Work consistency, task completion ya positive comments yahan likhein..."
                value={form.feedback}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" style={{ ...primaryBtn, padding: "10px 24px" }} disabled={saving}>
                <CheckCircle2 size={16} /> {saving ? "Saving..." : "Submit Rating"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. RATINGS DISPLAY */}
      <div>
        <h3 style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 700, margin: "0 0 16px 0", color: T.text }}>
          {isAdmin ? "Company Rating History" : "My Monthly Ratings & Feedback"}
        </h3>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: T.textFaint }}>Ratings load ho rahi hain...</div>
        ) : (isAdmin ? allRatings : myRatings).length === 0 ? (
          <div style={cardStyle({ padding: 30, textAlign: "center", color: T.textFaint })}>
            Abhi tak koi rating record available nahi hai.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
            {(isAdmin ? allRatings : myRatings).map((r) => (
              <div key={r._id} style={cardStyle({ padding: 18, border: `1px solid ${T.border}` })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    {isAdmin && (
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 2 }}>
                        {r.employeeId?.name || "Employee"}
                      </div>
                    )}
                    <span style={{ fontSize: 12, color: T.textFaint, fontWeight: 600 }}>{r.month}</span>
                  </div>

                  <div style={{ display: "flex", gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        color={i < r.stars ? "#f59e0b" : "#cbd5e1"}
                        fill={i < r.stars ? "#f59e0b" : "none"}
                      />
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: T.bg,
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 12.5,
                    color: T.textSoft,
                    display: "flex",
                    gap: 6,
                  }}
                >
                  <MessageSquare size={14} color={T.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{r.feedback || "Good performance this month."}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}