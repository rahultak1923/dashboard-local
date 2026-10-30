import React, { useState } from "react";
import { CheckCircle2, ArrowLeft, Upload, Image as ImageIcon, FileText, Landmark } from "lucide-react";
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
    // Bank Details
    accHolderName: "",
    bankName: "",
    accNumber: "",
    ifscCode: "",
    // Documents
    aadharDoc: null,
    panDoc: null,
    marksheet10: null,
    marksheet12: null,
    graduationDoc: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [docNames, setDocNames] = useState({});
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 200 * 1024; // 200 KB limit

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Helper: File Size Validator (Max 200 KB)
  const validateAndGetFile = (e, label) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        const sizeInKb = (file.size / 1024).toFixed(1);
        alert(`⚠️ ${label} ka size ${sizeInKb} KB hai! Kripya 200 KB se choti file select karein.`);
        e.target.value = "";
        return null;
      }
      return file;
    }
    return null;
  };

  const handleImageChange = (e) => {
    const file = validateAndGetFile(e, "Profile Image");
    if (file) {
      setForm((f) => ({ ...f, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e) => {
    const file = validateAndGetFile(e, "Resume");
    if (file) {
      setForm((f) => ({ ...f, resume: file }));
      setResumeName(file.name);
    }
  };

  const handleDocChange = (key, label) => (e) => {
    const file = validateAndGetFile(e, label);
    if (file) {
      setForm((f) => ({ ...f, [key]: file }));
      setDocNames((prev) => ({ ...prev, [key]: file.name }));
    }
  };

  // Cloudinary Direct Upload Function
  const uploadToCloudinary = async (file) => {
    if (!file) return "";
    const cloudName = "ywjdugiz";
    const uploadPreset = "my_cloud_team";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error ? data.error.message : "Document upload failed");
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      if (!file) return resolve({ data: '', name: '' });
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve({ data: reader.result, name: file.name });
      reader.onerror = () => resolve({ data: '', name: '' });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Kripya Name aur Email zaroor bharein!");
      return;
    }

    if (form.aadhar && form.aadhar.length !== 12) {
      alert("⚠️ Aadhaar number poore 12 digits ka hona chahiye!");
      return;
    }

    if (form.pan && form.pan.length !== 10) {
      alert("⚠️ PAN number poore 10 characters ka hona chahiye!");
      return;
    }

    setLoading(true);

    try {
      // Cloudinary par saari images ek sath upload
      const [
        photoUrl,
        aadharDocUrl,
        panDocUrl,
        marksheet10Url,
        marksheet12Url,
        graduationDocUrl,
        resumeObj
      ] = await Promise.all([
        uploadToCloudinary(form.image),
        uploadToCloudinary(form.aadharDoc),
        uploadToCloudinary(form.panDoc),
        uploadToCloudinary(form.marksheet10),
        uploadToCloudinary(form.marksheet12),
        uploadToCloudinary(form.graduationDoc),
        fileToBase64(form.resume)
      ]);

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
        photoUrl: photoUrl,
        resumeData: resumeObj.data,
        resumeName: resumeObj.name,
        aadharDocUrl: aadharDocUrl,
        panDocUrl: panDocUrl,
        marksheet10Url: marksheet10Url,
        marksheet12Url: marksheet12Url,
        graduationDocUrl: graduationDocUrl,
        accHolderName: form.accHolderName,
        bankName: form.bankName,
        accNumber: form.accNumber,
        ifscCode: form.ifscCode
      };

      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      setLoading(false);
      alert("🎉 Employee details, documents aur bank record safalpurvak save ho gaye!");

      if (onAddSuccess) {
        onAddSuccess({
          ...form,
          _id: Date.now().toString(),
          status: "Active",
          image: photoUrl || previewImage,
          resume: resumeObj.data ? "uploaded" : null,
          aadharDocUrl,
          panDocUrl,
          marksheet10Url,
          marksheet12Url,
          graduationDocUrl
        });
      }
      if (onBack) onBack();

    } catch (error) {
      setLoading(false);
      console.error("Error saving data:", error);
      alert("Data upload karne me dikkat aayi: " + error.message);
    }
  };

  return (
    <div style={{ width: "100%", padding: "0 10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <PageHeader title="Add New Employee" subtitle="Saari details, verification docs aur bank details ke sath register karein" />
        {onBack && (
          <button onClick={onBack} style={{ ...primaryBtn, background: T.surface, color: T.text, border: `1px solid ${T.border}` }}>
            <ArrowLeft size={15} /> Back to Directory
          </button>
        )}
      </div>

      <div style={{ width: "100%", background: "transparent" }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32, alignItems: "start" }}>
          
          {/* Left Column: Profile Photo, Resume & Verification Docs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Profile Photo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: T.surface, padding: 18, borderRadius: 16, border: `1px solid ${T.border}` }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: T.bg, border: `3px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {previewImage ? <img src={previewImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={38} color={T.textFaint} />}
              </div>
              <div style={{ fontSize: 11, color: T.textFaint }}>Profile Photo (Max 200 KB)</div>
              <label style={{ ...primaryBtn, padding: "8px 14px", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }}>
                <Upload size={13} /> Upload Image
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </label>
            </div>

            {/* Resume Upload */}
            <div style={{ background: T.surface, padding: 18, borderRadius: 16, border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <FileText size={16} color={T.primary} />
                <span style={{ fontFamily: displayFont, fontSize: 13.5, fontWeight: 600 }}>Resume / CV</span>
              </div>
              <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 10 }}>
                {resumeName ? `Selected: ${resumeName}` : "PDF, DOCX (Max 200 KB)"}
              </div>
              <label style={{ ...primaryBtn, background: T.navy, padding: "8px 14px", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }}>
                <Upload size={13} /> Upload Resume
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} style={{ display: "none" }} />
              </label>
            </div>

            {/* Document Uploads (Max 200 KB each) */}
            <div style={{ background: T.surface, padding: 18, borderRadius: 16, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: displayFont, fontSize: 13.5, fontWeight: 700, color: T.text }}>
                Verification Documents
              </div>
              <div style={{ fontSize: 11, color: T.textFaint }}>Images format only (Max 200 KB each)</div>

              {[
                { id: "aadharDoc", label: "Aadhaar Card Photo" },
                { id: "panDoc", label: "PAN Card Photo" },
                { id: "marksheet10", label: "10th Marksheet" },
                { id: "marksheet12", label: "12th Marksheet" },
                { id: "graduationDoc", label: "Graduation Degree" },
              ].map((doc) => (
                <div key={doc.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: T.textSoft }}>{doc.label}</div>
                  <label style={{ 
                    border: `1px dashed ${T.border}`, 
                    padding: "7px 10px", 
                    borderRadius: 8, 
                    cursor: "pointer", 
                    fontSize: 11.5, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    background: T.bg
                  }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                      {docNames[doc.id] || "Choose file..."}
                    </span>
                    <Upload size={12} color={T.primary} />
                    <input type="file" accept="image/*" onChange={handleDocChange(doc.id, doc.label)} style={{ display: "none" }} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form Information & Bank Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, background: T.surface, padding: 26, borderRadius: 16, border: `1px solid ${T.border}` }}>
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
              <Field label="Aadhaar Number (12 Digits)">
                <input 
                  style={inputStyle} 
                  placeholder="12 digit Aadhaar number" 
                  maxLength={12}
                  value={form.aadhar} 
                  onChange={(e) => update("aadhar", e.target.value.replace(/\D/g, '').slice(0, 12))} 
                />
              </Field>
              <Field label="PAN Number (10 Characters)">
                <input 
                  style={inputStyle} 
                  placeholder="ABCDE1234F" 
                  maxLength={10}
                  value={form.pan} 
                  onChange={(e) => update("pan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} 
                />
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

            {/* Bank Details Section */}
            <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 18, marginTop: 6, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Landmark size={17} color={T.primary} />
                <span style={{ fontFamily: displayFont, fontSize: 14, fontWeight: 700, color: T.text }}>
                  Bank Details (Salary Account)
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Account Holder Name">
                  <input style={inputStyle} placeholder="Account holder name" value={form.accHolderName} onChange={(e) => update("accHolderName", e.target.value)} />
                </Field>
                <Field label="Bank Name">
                  <input style={inputStyle} placeholder="e.g. State Bank of India" value={form.bankName} onChange={(e) => update("bankName", e.target.value)} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Account Number">
                  <input 
                    style={inputStyle} 
                    placeholder="Account number" 
                    maxLength={18}
                    value={form.accNumber} 
                    onChange={(e) => update("accNumber", e.target.value.replace(/\D/g, '').slice(0, 18))} 
                  />
                </Field>
                <Field label="IFSC Code">
                  <input 
                    style={inputStyle} 
                    placeholder="e.g. SBIN0001234" 
                    maxLength={11}
                    value={form.ifscCode} 
                    onChange={(e) => update("ifscCode", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))} 
                  />
                </Field>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button type="submit" style={{ ...primaryBtn, padding: "12px 24px" }} disabled={loading}>
                <CheckCircle2 size={16} /> {loading ? "Uploading & Saving..." : "Save Employee"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}