import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Landmark, FileText, 
  Upload, Edit2, Save, X, ExternalLink, ShieldCheck, ArrowLeft 
} from "lucide-react";
import { T, bodyFont, displayFont, inputStyle, primaryBtn, cardStyle, PageHeader } from "../theme";
import { apiRequest } from "../api";

export default function ProfilePage({ onBack, onProfileUpdated }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    aadharNumber: "",
    panNumber: "",
    photoUrl: "",
    bankDetails: {
      accHolderName: "",
      bankName: "",
      accNumber: "",
      ifscCode: ""
    },
    documents: {
      aadharDocUrl: "",
      panDocUrl: "",
      marksheet10Url: "",
      marksheet12Url: "",
      graduationDocUrl: ""
    }
  });

  const MAX_FILE_SIZE = 200 * 1024; // 200 KB

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/auth/me");
      setProfile(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        aadharNumber: data.aadharNumber || "",
        panNumber: data.panNumber || "",
        photoUrl: data.photoUrl || "",
        bankDetails: {
          accHolderName: data.bankDetails?.accHolderName || "",
          bankName: data.bankDetails?.bankName || "",
          accNumber: data.bankDetails?.accNumber || "",
          ifscCode: data.bankDetails?.ifscCode || ""
        },
        documents: {
          aadharDocUrl: data.documents?.aadharDocUrl || "",
          panDocUrl: data.documents?.panDocUrl || "",
          marksheet10Url: data.documents?.marksheet10Url || "",
          marksheet12Url: data.documents?.marksheet12Url || "",
          graduationDocUrl: data.documents?.graduationDocUrl || ""
        }
      });
    } catch (err) {
      alert("Profile load nahi ho paayi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Direct Cloudinary Upload Function
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
      throw new Error(data.error ? data.error.message : "Upload fail hua");
    }
  };

  // File Change & Validation Handler
  const handleFileChange = async (key, file, label) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      const sizeInKb = (file.size / 1024).toFixed(1);
      alert(`⚠️ ${label} ka size ${sizeInKb} KB hai! Kripya 200 KB se choti file upload karein.`);
      return;
    }

    try {
      setSaving(true);
      const uploadedUrl = await uploadToCloudinary(file);
      if (key === "photoUrl") {
        setForm((prev) => ({ ...prev, photoUrl: uploadedUrl }));
      } else {
        setForm((prev) => ({
          ...prev,
          documents: { ...prev.documents, [key]: uploadedUrl }
        }));
      }
      alert(`✓ ${label} upload ho gaya! Neeche "Save Profile" par click karein.`);
    } catch (err) {
      alert("Upload error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.aadharNumber && form.aadharNumber.length !== 12) {
      alert("⚠️ Aadhaar number poore 12 digits ka hona chahiye!");
      return;
    }

    if (form.panNumber && form.panNumber.length !== 10) {
      alert("⚠️ PAN number poore 10 characters ka hona chahiye!");
      return;
    }

    try {
      setSaving(true);
      const res = await apiRequest("/auth/profile", "PUT", form);
      alert(res.message || "Profile successfully update ho gayi! 🎉");
      setProfile(res.user);
      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated(res.user);
    } catch (err) {
      alert("Profile save karne me dikkat aayi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: T.textFaint, fontFamily: bodyFont }}>
        Profile data load ho raha hai...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", padding: "0 10px 40px 10px", fontFamily: bodyFont }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {onBack && (
            <button 
              onClick={onBack} 
              style={{ ...primaryBtn, background: T.surface, color: T.text, border: `1px solid ${T.border}`, padding: "8px 12px" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <PageHeader 
            title="My Account Profile" 
            subtitle="Apni personal information, bank account aur uploaded documents manage karein" 
          />
        </div>

        <div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ ...primaryBtn, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px" }}
            >
              <Edit2 size={15} /> Edit Profile
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(false)} 
              style={{ ...primaryBtn, background: T.surface, color: T.text, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}
            >
              <X size={15} /> Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>
        
        {/* Left Column: Avatar & Quick Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={cardStyle({ padding: 26, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" })}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.primary}, ${T.sky})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 36,
              fontWeight: 700,
              overflow: "hidden",
              border: `4px solid ${T.surface}`,
              boxShadow: T.shadowSm,
              marginBottom: 14
            }}>
              {(isEditing ? form.photoUrl : profile?.photoUrl) ? (
                <img 
                  src={isEditing ? form.photoUrl : profile?.photoUrl} 
                  alt="Profile" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              ) : (
                profile?.name ? profile.name.slice(0, 2).toUpperCase() : "DW"
              )}
            </div>

            {isEditing && (
              <label style={{ ...primaryBtn, padding: "7px 12px", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Upload size={12} /> Change Photo (200 KB)
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }} 
                  onChange={(e) => handleFileChange("photoUrl", e.target.files[0], "Profile Photo")}
                />
              </label>
            )}

            <h2 style={{ fontFamily: displayFont, fontSize: 19, fontWeight: 700, color: T.text, margin: 0 }}>
              {profile?.name}
            </h2>
            <div style={{ fontSize: 13, color: T.primary, fontWeight: 600, marginTop: 4 }}>
              {profile?.designation || "Team Member"} ({profile?.department || "General"})
            </div>
            <div style={{ fontSize: 12, color: T.textFaint, marginTop: 4 }}>
              Role: <span style={{ textTransform: "capitalize", fontWeight: 600, color: T.text }}>{profile?.role}</span>
            </div>
          </div>

          {/* Quick Contact Box */}
          <div style={cardStyle({ padding: 20, display: "flex", flexDirection: "column", gap: 12, fontSize: 13 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.textSoft }}>
              <Mail size={15} color={T.primary} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.email}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.textSoft }}>
              <Phone size={15} color={T.primary} />
              <span>{profile?.phone || "No phone added"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.textSoft }}>
              <MapPin size={15} color={T.primary} />
              <span>{profile?.address || "No address added"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Full Details / Edit Form */}
        <div style={cardStyle({ padding: 30 })}>
          {isEditing ? (
            /* --- EDIT FORM --- */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, color: T.text, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
                Personal & Identity Details
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 5, display: "block" }}>Full Name *</label>
                  <input 
                    style={inputStyle} 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 5, display: "block" }}>Mobile Number</label>
                  <input 
                    style={inputStyle} 
                    value={form.phone} 
                    placeholder="+91 98765 43210" 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 5, display: "block" }}>Residential Address</label>
                <input 
                  style={inputStyle} 
                  value={form.address} 
                  placeholder="House No, Street, City, State" 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 5, display: "block" }}>Aadhaar Number (Exact 12 Digits)</label>
                  <input 
                    style={inputStyle} 
                    maxLength={12} 
                    placeholder="12 digit Aadhaar" 
                    value={form.aadharNumber} 
                    onChange={(e) => setForm({ ...form, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 5, display: "block" }}>PAN Number (10 Characters)</label>
                  <input 
                    style={inputStyle} 
                    maxLength={10} 
                    placeholder="ABCDE1234F" 
                    value={form.panNumber} 
                    onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) })} 
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 16 }}>
                <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Landmark size={17} color={T.primary} /> Bank Details (Salary Account)
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>Account Holder Name</label>
                    <input 
                      style={inputStyle} 
                      placeholder="Passbook ke anusar" 
                      value={form.bankDetails.accHolderName} 
                      onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, accHolderName: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>Bank Name</label>
                    <input 
                      style={inputStyle} 
                      placeholder="e.g. State Bank of India" 
                      value={form.bankDetails.bankName} 
                      onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>Account Number</label>
                    <input 
                      style={inputStyle} 
                      maxLength={18} 
                      placeholder="Account number" 
                      value={form.bankDetails.accNumber} 
                      onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, accNumber: e.target.value.replace(/\D/g, '').slice(0, 18) } })} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textSoft, marginBottom: 4, display: "block" }}>IFSC Code</label>
                    <input 
                      style={inputStyle} 
                      maxLength={11} 
                      placeholder="e.g. SBIN0001234" 
                      value={form.bankDetails.ifscCode} 
                      onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: e.target.value.toUpperCase().slice(0, 11) } })} 
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 16 }}>
                <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                  Verification Documents Upload (Max 200 KB Each)
                </div>
                <p style={{ fontSize: 12, color: T.textFaint, marginBottom: 12 }}>File select karte hi automatically upload hokar preview add ho jayega.</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
                  {[
                    { key: "aadharDocUrl", label: "Aadhaar Card Photo" },
                    { key: "panDocUrl", label: "PAN Card Photo" },
                    { key: "marksheet10Url", label: "10th Marksheet" },
                    { key: "marksheet12Url", label: "12th Marksheet" },
                    { key: "graduationDocUrl", label: "Graduation Degree" },
                  ].map((doc) => (
                    <div key={doc.key} style={{ background: T.bg, padding: 12, borderRadius: 10, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: T.textSoft, marginBottom: 6 }}>{doc.label}</div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11.5, color: form.documents[doc.key] ? T.good : T.textFaint, fontWeight: 600 }}>
                          {form.documents[doc.key] ? "Uploaded ✓" : "Not Uploaded"}
                        </span>
                        
                        <label style={{ cursor: "pointer", color: T.primary, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}>
                          <Upload size={13} /> {form.documents[doc.key] ? "Re-upload" : "Upload"}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(doc.key, e.target.files[0], doc.label)} 
                            style={{ display: "none" }} 
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                <button type="submit" style={{ ...primaryBtn, padding: "12px 28px" }} disabled={saving}>
                  <Save size={16} /> {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} style={{ ...primaryBtn, background: T.bg, color: T.text, border: `1px solid ${T.border}` }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* --- VIEW FULL PROFILE --- */
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Identity & Basic Info */}
              <div>
                <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12, borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                  Personal Information
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, fontSize: 13.5 }}>
                  <div><span style={{ color: T.textFaint }}>Full Name:</span> <b>{profile?.name}</b></div>
                  <div><span style={{ color: T.textFaint }}>Email:</span> <b>{profile?.email}</b></div>
                  <div><span style={{ color: T.textFaint }}>Phone:</span> <b>{profile?.phone || "N/A"}</b></div>
                  <div><span style={{ color: T.textFaint }}>Address:</span> <b>{profile?.address || "N/A"}</b></div>
                  <div><span style={{ color: T.textFaint }}>Aadhaar Number:</span> <b>{profile?.aadharNumber ? String(profile.aadharNumber).replace(/^'/, '') : "N/A"}</b></div>
                  <div><span style={{ color: T.textFaint }}>PAN Number:</span> <b>{profile?.panNumber || "N/A"}</b></div>
                </div>
              </div>

              {/* Bank Details */}
              <div style={{ background: T.bg, padding: 18, borderRadius: 12, border: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <Landmark size={17} color={T.primary} /> Bank Details (Salary Account)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, fontSize: 13 }}>
                  <div><span style={{ color: T.textFaint }}>Account Holder:</span> <br /><b>{profile?.bankDetails?.accHolderName || "N/A"}</b></div>
                  <div><span style={{ color: T.textFaint }}>Bank Name:</span> <br /><b>{profile?.bankDetails?.bankName || "N/A"}</b></div>
                  <div><span style={{ color: T.textFaint }}>Account Number:</span> <br /><b>{profile?.bankDetails?.accNumber || "N/A"}</b></div>
                  <div><span style={{ color: T.textFaint }}>IFSC Code:</span> <br /><b>{profile?.bankDetails?.ifscCode || "N/A"}</b></div>
                </div>
              </div>

              {/* Documents Grid */}
              <div>
                <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>
                  Uploaded Verification Documents
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14 }}>
                  {[
                    { label: "Aadhaar Card", url: profile?.documents?.aadharDocUrl },
                    { label: "PAN Card", url: profile?.documents?.panDocUrl },
                    { label: "10th Marksheet", url: profile?.documents?.marksheet10Url },
                    { label: "12th Marksheet", url: profile?.documents?.marksheet12Url },
                    { label: "Graduation", url: profile?.documents?.graduationDocUrl },
                  ].map((doc, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        border: `1px solid ${T.border}`, 
                        borderRadius: 12, 
                        padding: 10, 
                        background: T.bg, 
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        minHeight: 130
                      }}
                    >
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.textSoft, marginBottom: 6 }}>
                        {doc.label}
                      </div>

                      {doc.url && doc.url.startsWith("http") ? (
                        <>
                          <div style={{ width: "100%", height: 65, borderRadius: 6, overflow: "hidden", background: "#e2e8f0", marginBottom: 6 }}>
                            <img src={doc.url} alt={doc.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ fontSize: 11.5, color: T.primary, textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
                          >
                            Open <ExternalLink size={12} />
                          </a>
                        </>
                      ) : (
                        <div style={{ fontSize: 11, color: T.textFaint, margin: "auto 0" }}>
                          Not Uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}