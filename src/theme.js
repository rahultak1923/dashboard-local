import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
export const T = {
  bg: "#EEF3FF",
  surface: "#FFFFFF",
  border: "#DCE6FB",
  navy: "#0A1958",
  navyMid: "#132E8C",
  primary: "#2F5CFF",
  primarySoft: "#E3EBFF",
  accent: "#3D7BFF",
  sky: "#00C2FF",
  cyan: "#06E0D6",
  text: "#0B1230",
  textSoft: "#5C6690",
  textFaint: "#9AA5C7",
  good: "#12B76A",
  goodSoft: "#DEFBEC",
  warn: "#F79009",
  warnSoft: "#FEF0D6",
  bad: "#F04438",
  badSoft: "#FEE4E2",
  shadowSm: "0 1px 2px rgba(16,24,64,0.04), 0 2px 8px rgba(47,92,255,0.05)",
  shadowMd: "0 2px 4px rgba(16,24,64,0.04), 0 12px 28px rgba(47,92,255,0.10)",
  shadowLg: "0 8px 16px rgba(16,24,64,0.06), 0 24px 48px rgba(47,92,255,0.14)",
};

export const displayFont = "'Space Grotesk', 'Sora', sans-serif";
export const bodyFont = "'Inter', 'Helvetica Neue', sans-serif";
export const monoFont = "'JetBrains Mono', 'IBM Plex Mono', monospace";

export const responsiveCSS = `
  * { box-sizing: border-box; }
  
  body, html { margin: 0; padding: 0; overflow: hidden; height: 100%; }
  .app-shell { display: flex; height: 100vh; overflow: hidden; position: relative; }

  /* Fixed Sidebar */
  .sidebar { width: 232px; flex-shrink: 0; height: 100vh; display: flex; flex-direction: column; transition: transform 0.25s ease; }
  .sidebar-overlay { display: none; }
  .hamburger-btn { display: none; }

  /* Main Container */
  .main { 
    flex: 1; 
    min-width: 0; 
    height: 100vh; 
    overflow-y: auto; 
    padding: 0 32px 40px 32px; 
    display: flex; 
    flex-direction: column; 
  }
  
  /* FULL WIDTH STICKY TOPBAR WITH COMPLETE COVERAGE */
  .topbar { 
    position: sticky; 
    top: 0; 
    z-index: 20; 
    background: rgba(238, 243, 255, 0.92); 
    backdrop-filter: blur(12px); 
    -webkit-backdrop-filter: blur(12px);
    margin-left: -32px; 
    margin-right: -32px; 
    padding: 20px 32px 16px 32px; 
    margin-bottom: 24px; 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 12px; 
    border-bottom: 1px solid rgba(220, 230, 251, 0.7);
  }

  .topbar-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .search-box { display: flex; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
  .charts-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; margin-bottom: 20px; }
  .bottom-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 16px; }
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .ticket-table { width: 100%; border-collapse: collapse; min-width: 520px; }
  .detail-card { padding: 28px; max-width: 680px; }
  .form-card { padding: 28px; max-width: 680px; }
  .fleet-row { display: flex; align-items: center; gap: 12px; padding: 10px 4px; border-bottom: 1px solid ${T.border}; flex-wrap: nowrap; }
  .fleet-info { flex: 1; min-width: 90px; }
  .fleet-meta { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  @media (max-width: 1180px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .charts-grid { grid-template-columns: 1fr; }
    .bottom-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 860px) {
    .main { padding: 0 20px 32px 20px; }
    .topbar { margin-left: -20px; margin-right: -20px; padding: 16px 20px 14px 20px; }
    .sidebar { position: fixed; top: 0; left: 0; height: 100vh; z-index: 45; transform: translateX(-100%); box-shadow: 12px 0 32px rgba(10,25,88,0.28); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; position: fixed; inset: 0; background: rgba(11,18,48,0.45); backdrop-filter: blur(2px); z-index: 40; }
    .hamburger-btn { display: flex; }
    .search-box { display: none; }
    .form-grid { grid-template-columns: 1fr; }
    .detail-card, .form-card { padding: 22px; max-width: 100%; }
  }

  @media (max-width: 560px) {
    .kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    .cards-grid { grid-template-columns: 1fr; }
    .main { padding: 0 14px 28px 14px; }
    .topbar { margin-left: -14px; margin-right: -14px; padding: 14px 14px 12px 14px; margin-bottom: 18px; }
    .topbar-actions { gap: 8px; }
    .topbar-subtitle { display: none; }
    .profile-chevron { display: none; }
    .profile-btn { gap: 0; }
    .fleet-row { flex-wrap: wrap; align-items: flex-start; padding: 12px 4px; }
    .fleet-meta { width: 100%; justify-content: space-between; margin-left: 46px; margin-top: 2px; }
    .table-wrap { overflow-x: visible; }
    .ticket-table { min-width: 0; }
    .ticket-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .ticket-table tr { display: block; border: 1px solid ${T.border}; border-radius: 12px; padding: 10px 12px; margin-bottom: 10px; }
    .ticket-table td { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: none !important; padding: 6px 0 !important; }
    .ticket-table td::before { content: attr(data-label); font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; color: ${T.textFaint}; }
    .ticket-table td.no-label::before { content: none; }
    .ticket-table td.no-label { justify-content: flex-end; }
  }

  @media (max-width: 380px) {
    .kpi-grid { grid-template-columns: 1fr; }
    .topbar-title h1 { font-size: 17px; }
    .bell-btn { width: 32px; height: 32px; }
  }

  .auth-shell { display: flex; min-height: 100vh; }
  .auth-brand { flex: 1; display: flex; }
  .auth-form-side { width: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .auth-form-card { width: 100%; max-width: 360px; }

  @media (max-width: 900px) {
    .auth-brand { display: none; }
    .auth-form-side { width: 100%; }
  }

  .profile-menu { position: absolute; top: 46px; right: 0; width: 220px; z-index: 55; }
`;

export const cardStyle = (extra = {}) => ({
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 16,
  boxShadow: T.shadowMd,
  ...extra,
});

export const inputStyle = {
  width: "100%",
  fontFamily: bodyFont,
  fontSize: 13.5,
  color: T.text,
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: "10px 12px",
  outline: "none",
  boxSizing: "border-box",
};

export const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
  color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px",
  fontFamily: bodyFont, fontWeight: 700, fontSize: 13, cursor: "pointer",
  boxShadow: "0 4px 12px rgba(47,92,255,0.35)", whiteSpace: "nowrap",
};

export const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: T.surface, color: T.textSoft, border: `1px solid ${T.border}`,
  borderRadius: 10, padding: "10px 16px", fontFamily: bodyFont, fontWeight: 600,
  fontSize: 13, cursor: "pointer",
};

export const dangerBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: T.bad, color: "#fff", border: "none",
  borderRadius: 10, padding: "10px 16px", fontFamily: bodyFont, fontWeight: 700,
  fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(240,68,56,0.35)",
};

export const iconBtn = (bg, color) => ({
  width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
  background: bg, color, display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
});

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: bodyFont, fontSize: 12, fontWeight: 700, color: T.textSoft, marginBottom: 6, display: "block", letterSpacing: 0.2 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function StatusPill({ status, map }) {
  const s = (map && map[status]) || { color: T.good, soft: T.goodSoft, label: status };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.soft, color: s.color, fontFamily: bodyFont, fontWeight: 700, fontSize: 11.5, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 1px 2px rgba(16,24,64,0.04)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 0 4px ${s.soft}` }} />
      {s.label || status}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 600, margin: 0, color: T.text }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: bodyFont, fontSize: 13, color: T.textSoft, margin: "2px 0 0" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ConfirmDialog({ data, onCancel, onConfirm }) {
  if (!data) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,18,48,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}>
      <div style={cardStyle({ padding: 24, width: "100%", maxWidth: 360, boxShadow: T.shadowLg })}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.badSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <AlertTriangle size={18} color={T.bad} />
        </div>
        <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>
          Delete {data.type === "service" ? "service" : "blog post"}?
        </div>
        <p style={{ fontFamily: bodyFont, fontSize: 13, color: T.textSoft, margin: "0 0 20px" }}>
          "{data.title}" will be permanently removed. This can't be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button style={ghostBtn} onClick={onCancel}>Cancel</button>
          <button style={dangerBtn} onClick={onConfirm}><Trash2 size={14} />Delete</button>
        </div>
      </div>
    </div>
  );
}