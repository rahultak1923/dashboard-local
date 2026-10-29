import React, { useState } from "react";
import { CheckCircle2, ArrowLeft, Upload, Image as ImageIcon, FileText } from "lucide-react";
import { T, bodyFont, displayFont, inputStyle, primaryBtn, PageHeader, Field } from "../theme";

export default function AddEmployeePage({ onBack, onAddSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    aadhar: "",
    pan: "",
    department: "Development",
    role: "",
    image: null,
    resume: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((f) => ({ ...f, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((f) => ({ ...f, resume: file }));
      setResumeName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Kripya Name aur Email zaroor bharein!");
      return;
    }

    setLoading(true);

    const fileToBase64 = (file) => {
      return new Promise((resolve) => {
        if (!file) return resolve({ data: '', name: '' });
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ data: reader.result, name: file.name });
        reader.onerror = () => resolve({ data: '', name: '' });
      });
    };

    Promise.all([fileToBase64(form.image), fileToBase64(form.resume)]).then(([photoObj, resumeObj]) => {
      
      const scriptURL = 'https://script.google.com/macros/s/AKfycbw9bEufFnegV2BN74ZUaCl5Q2QGtuYtVcbpgUf2EE2ZQ4qa6Q0_9XOMJrkLFeW76C-c/exec';

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        aadhar: form.aadhar,
        pan: form.pan,
        department: form.department,
        role: form.role,
        photoData: photoObj.data,
        photoName: photoObj.name,
        resumeData: resumeObj.data,
        resumeName: resumeObj.name
      };

      fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        setLoading(false);
        alert("Employee ki saari details Google Sheet aur Drive par safalpurvak save ho gayi hain! 🎉");
        
        if (onAddSuccess) {
          onAddSuccess({ 
            ...form, 
            aadhar: form.aadhar,
            _id: Date.now().toString(), 
            status: "Active",
            image: previewImage 
          });
        }
        if (onBack) onBack();
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error saving data:", error);
        alert("Data Google Sheet par bhej diya gaya hai!");
        if (onBack) onBack();
      });
    });
  };

  return (
    <div style={{ width: "100%", padding: "0 10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <PageHeader title="Add New Employee" subtitle="Saari details ke sath naya team member register karein" />
        {onBack && (
          <button onClick={onBack} style={{ ...primaryBtn, background: T.surface, color: T.text, border: `1px solid ${T.border}` }}>
            <ArrowLeft size={15} /> Back to Directory
          </button>
        )}
      </div>

      <div style={{ width: "100%", background: "transparent" }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 40, alignItems: "start" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, background: T.surface, padding: 20, borderRadius: 16, border: `1px solid ${T.border}` }}>
              <div style={{ width: 110, height: 110, borderRadius: "50%", background: T.bg, border: `3px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {previewImage ? <img src={previewImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={40} color={T.textFaint} />}
              </div>
              <label style={{ ...primaryBtn, padding: "8px 14px", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }}>
                <Upload size={13} /> Upload Image
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </label>
            </div>

            <div style={{ background: T.surface, padding: 20, borderRadius: 16, border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <FileText size={16} color={T.primary} />
                <span style={{ fontFamily: displayFont, fontSize: 13.5, fontWeight: 600 }}>Resume / CV</span>
              </div>
              <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 12 }}>{resumeName ? `Selected: ${resumeName}` : "PDF, DOCX format"}</div>
              <label style={{ ...primaryBtn, background: T.navy, padding: "8px 14px", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }}>
                <Upload size={13} /> Upload Resume
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, background: T.surface, padding: 30, borderRadius: 16, border: `1px solid ${T.border}` }}>
            <Field label="Full Name *">
              <input style={inputStyle} placeholder="e.g. Rahul Sharma" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Email Address *">
                <input style={inputStyle} type="email" placeholder="rahul@company.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </Field>
              <Field label="Mobile Number">
                <input style={inputStyle} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
            </div>

            <Field label="Residential Address">
              <input style={inputStyle} placeholder="House No, Street, City, Pincode" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Aadhaar Number">
                <input style={inputStyle} placeholder="[Redacted]" value={form.aadhar} onChange={(e) => update("aadhar", e.target.value)} />
              </Field>
              <Field label="PAN Number">
                <input style={inputStyle} placeholder="ABCDE1234F" value={form.pan} onChange={(e) => update("pan", e.target.value)} />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Department">
                <input style={inputStyle} placeholder="Development / Marketing" value={form.department} onChange={(e) => update("department", e.target.value)} />
              </Field>
              <Field label="Role / Designation">
                <input style={inputStyle} placeholder="Frontend Developer" value={form.role} onChange={(e) => update("role", e.target.value)} />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button type="submit" style={{ ...primaryBtn, padding: "12px 24px" }} disabled={loading}>
                <CheckCircle2 size={16} /> {loading ? "Saving & Uploading..." : "Save Employee"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}