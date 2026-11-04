import React, { useState } from "react";
import { apiRequest } from "../api";
import { T, bodyFont, displayFont, inputStyle, primaryBtn } from "../theme";
import { Lock, Mail, User, ShieldCheck } from "lucide-react";

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };

      const res = await apiRequest(endpoint, "POST", payload);

      // Token aur user details local storage me save karein
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res));

      alert(isRegister ? "Account ban gaya! Welcome 🎉" : "Login safal raha! 🚀");
      onLoginSuccess(res);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: T.bg,
      padding: 16
    }}>
      <div style={{
        background: T.surface,
        borderRadius: 20,
        padding: 32,
        width: "100%",
        maxWidth: 420,
        boxShadow: T.shadowLg,
        border: `1px solid ${T.border}`
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.primary}, ${T.sky})`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            marginBottom: 12
          }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>
            {isRegister ? "Naya Account Banayein" : "Portal Login"}
          </h2>
          <p style={{ fontFamily: bodyFont, fontSize: 13, color: T.textFaint, marginTop: 4 }}>
            Digital Whopper Employee & Admin Portal
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: "10px 14px",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
            fontFamily: bodyFont
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
                <User size={16} color={T.textFaint} style={{ position: "absolute", left: 12, top: 12 }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingLeft: 36 }}
                type="email"
                placeholder="rahul@company.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
              <Mail size={16} color={T.textFaint} style={{ position: "absolute", left: 12, top: 12 }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingLeft: 36 }}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
              <Lock size={16} color={T.textFaint} style={{ position: "absolute", left: 12, top: 12 }} />
            </div>
          </div>

          <button
            type="submit"
            style={{ ...primaryBtn, width: "100%", justifyContent: "center", padding: "12px", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Rukiye..." : isRegister ? "Account Banayein 🚀" : "Login Karein 🔑"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg("");
            }}
            style={{
              background: "none",
              border: "none",
              color: T.primary,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: bodyFont
            }}
          >
            {isRegister
              ? "Pehle se account hai? Login karein"
              : "Naye employee hain? Yahan se account banayein"}
          </button>
        </div>
      </div>
    </div>
  );
}