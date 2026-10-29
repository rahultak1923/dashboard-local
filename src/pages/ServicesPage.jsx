import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Plus, Pencil, Trash2, ArrowLeft, CheckCircle2, CalendarDays } from "lucide-react";
import { T, bodyFont, displayFont, cardStyle, inputStyle, primaryBtn, ghostBtn, iconBtn, PageHeader, StatusPill, Field, formatDate } from "../theme";
import api from "../services/api";

const serviceStatusMap = {
  Active: { color: T.good, soft: T.goodSoft, label: "Active" },
  Inactive: { color: T.textFaint, soft: T.bg, label: "Inactive" },
};

const themeOptions = [
  { id: 'sky', label: 'Sky Blue 🟦', bg: '#E0F2FE' },
  { id: 'lavender', label: 'Lavender 🟪', bg: '#E0E7FF' },
  { id: 'mint', label: 'Mint Green 🟩', bg: '#D1FAE5' },
  { id: 'pink', label: 'Soft Pink 🟥', bg: '#FFE4E6' },
  { id: 'purple', label: 'Light Purple 🟣', bg: '#F3E8FF' },
  { id: 'peach', label: 'Peach / Orange 🟧', bg: '#FEF3C7' },
  { id: 'aqua', label: 'Aqua Green 🟨', bg: '#CCFBF1' },
  { id: 'gray', label: 'Light Gray ⬛', bg: '#F1F5F9' },
  { id: 'custom', label: '🎨 Custom Picked Color', bg: '#FFFFFF' },
];

// Clean HTML & Entities Helper Function
function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || doc.body.innerText || "";
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

export default function ServicesPage({ serviceView, setServiceView, setConfirmDelete, searchQuery = "" }) {
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("Active");
  const [theme, setTheme] = useState("sky");
  const [customColor, setCustomColor] = useState("#E0F2FE");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  const handleOpenForm = (service = null) => {
    if (service) {
      setTitle(service.title || "");
      setDescription(service.description || "");
      setTags(service.tags ? (Array.isArray(service.tags) ? service.tags.join(", ") : service.tags) : "");
      setStatus(service.status || "Active");
      setTheme(service.theme || "sky");
      setCustomColor(service.customColor || "#E0F2FE");
      setServiceView({ mode: "form", id: service._id });
    } else {
      setTitle("");
      setDescription("");
      setTags("");
      setStatus("Active");
      setTheme("sky");
      setCustomColor("#E0F2FE");
      setServiceView({ mode: "form", id: null });
    }
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("status", status);
    formData.append("theme", theme);
    formData.append("customColor", theme === 'custom' ? customColor : "");
    if (imageFile) formData.append("image", imageFile);

    try {
      if (serviceView.id) {
        await api.put(`/services/${serviceView.id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      fetchServices();
      setServiceView({ mode: "list", id: null });
    } catch (err) {
      alert(err.response?.data?.message || "Error saving service");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
      setConfirmDelete(null);
      setServiceView({ mode: "list", id: null });
    } catch (err) {
      alert("Delete failed");
    }
  };

  // 🌟 FIX: Complete Multi-Field Live Search (Title, Clean Description, Date, Tags)
  const filteredServices = services.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.trim().toLowerCase();
    
    const titleMatch = s.title ? s.title.toLowerCase().includes(q) : false;
    const descClean = stripHtml(s.description).toLowerCase();
    const descMatch = descClean.includes(q);
    const dateStr = formatDate(s.createdAt) ? formatDate(s.createdAt).toLowerCase() : "";
    const dateMatch = dateStr.includes(q);
    const tagsStr = Array.isArray(s.tags) ? s.tags.join(" ").toLowerCase() : (s.tags || "").toLowerCase();
    const tagsMatch = tagsStr.includes(q);

    return titleMatch || descMatch || dateMatch || tagsMatch;
  });

  if (serviceView.mode === "form") {
    return (
      <>
        <button style={{ ...ghostBtn, marginBottom: 18 }} onClick={() => setServiceView({ mode: "list", id: null })}>
          <ArrowLeft size={14} />Cancel
        </button>
        <div className="form-card" style={cardStyle({ maxWidth: 800, width: "100%" })}>
          <div style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 20 }}>
            {serviceView.id ? "Edit Service" : "Add New Service"}
          </div>
          <form onSubmit={handleSubmit}>
            <Field label="Service Title">
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Website Development" />
            </Field>

            <div className="form-grid">
              <Field label="Card Color Theme">
                <select style={inputStyle} value={theme} onChange={(e) => setTheme(e.target.value)}>
                  {themeOptions.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </Field>

              {theme === 'custom' ? (
                <Field label="Pick Custom Color">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} style={{ width: 44, height: 38, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }} />
                    <input style={inputStyle} value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="#HEX Code" />
                  </div>
                </Field>
              ) : (
                <Field label="Status">
                  <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </Field>
              )}
            </div>

            {theme === 'custom' && (
              <Field label="Status">
                <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
            )}

            <Field label="Tags (Comma separated)">
              <input style={inputStyle} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. SEO, Marketing, Growth" />
            </Field>

            <Field label="Service Icon / Image">
              <input type="file" style={inputStyle} accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!serviceView.id} />
            </Field>

            <Field label="Description">
              <div style={{ background: "#ffffff", borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
                <ReactQuill theme="snow" value={description} onChange={setDescription} modules={quillModules} placeholder="Enter detailed description..." />
              </div>
            </Field>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="submit" style={primaryBtn}><CheckCircle2 size={15} />{serviceView.id ? "Save Changes" : "Create Service"}</button>
              <button type="button" style={ghostBtn} onClick={() => setServiceView({ mode: "list", id: null })}>Cancel</button>
            </div>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Services"
        subtitle={`${filteredServices.length} of ${services.length} services`}
        action={<button style={primaryBtn} onClick={() => handleOpenForm()}><Plus size={15} />Add Service</button>}
      />
      {filteredServices.length === 0 ? (
        <div style={cardStyle({ padding: 40, textAlign: "center", color: T.textFaint })}>
          No services found matching your search.
        </div>
      ) : (
        <div className="cards-grid">
          {filteredServices.map((s) => {
            const matchedTheme = s.theme === 'custom' 
              ? { bg: s.customColor || '#FFFFFF', label: 'Custom' }
              : (themeOptions.find((t) => t.id === s.theme) || themeOptions[0]);

            const cleanText = stripHtml(s.description);

            return (
              <div key={s._id} style={cardStyle({ padding: 20, display: "flex", flexDirection: "column", gap: 12, wordBreak: "break-word" })}>
                {s.image && <img src={`http://localhost:5000${s.image}`} alt={s.title} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10 }} />}
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 600, color: T.text }}>{s.title}</div>
                  <StatusPill status={s.status || "Active"} map={serviceStatusMap} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: T.textFaint }}>Card Color:</span>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: matchedTheme.bg, border: "1px solid #ccc", display: "inline-block" }}></span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.textSoft }}>
                    {s.theme === 'custom' ? (s.customColor || 'Custom') : matchedTheme.label.split(' ')[0]}
                  </span>
                </div>

                {/* 🌟 FIX: Ensured Plain Text Description renders reliably */}
                <p style={{
                  fontFamily: bodyFont,
                  fontSize: 12.5,
                  color: T.textSoft,
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.5',
                  maxHeight: '4.5em',
                  wordBreak: 'break-word'
                }}>
                  {cleanText || "No description provided."}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, paddingTop: 10, marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: bodyFont, fontSize: 11.5, color: T.textFaint }}>
                    <CalendarDays size={13} />
                    <span>{formatDate(s.createdAt)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={iconBtn(T.primarySoft, T.primary)} onClick={() => handleOpenForm(s)} title="Edit"><Pencil size={14} /></button>
                    <button style={iconBtn(T.badSoft, T.bad)} onClick={() => setConfirmDelete({ type: "service", id: s._id, title: s.title, onDelete: () => handleDelete(s._id) })} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}