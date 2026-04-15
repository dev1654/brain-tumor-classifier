import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://dev160235-neuroscan-backend.hf.space";

const CLASS_COLORS = {
  glioma:     { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
  meningioma: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
  notumor:    { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  pituitary:  { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
};

const SEVERITY_COLORS = {
  High:     { bg: "#fef2f2", text: "#991b1b" },
  Moderate: { bg: "#fff7ed", text: "#9a3412" },
  None:     { bg: "#f0fdf4", text: "#166534" },
};

const TEAM = [
  "Dev Khilan Patel",
  "Mohammad Fawzaan Khan Juhoor",
  "Deep Atul Patel",
  "Khush Sanjay Santoki",
];

export default function App() {
  const [demoImages, setDemoImages]     = useState([]);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState("demo");

  useEffect(() => {
    axios.get(`${API}/demo-images-list`).then((r) => setDemoImages(r.data.images));
  }, []);

  const runDemo = async (filename) => {
    setSelectedDemo(filename);
    setResult(null);
    setLoading(true);
    try {
      const r = await axios.get(`${API}/demo-predict/${filename}`);
      setResult(r.data);
    } catch { alert("Backend not responding."); }
    setLoading(false);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    setUploadedFile(f);
    setResult(null);
    if (f) setUploadPreview(URL.createObjectURL(f));
  };

  const runUpload = async () => {
    if (!uploadedFile) return;
    setResult(null);
    setLoading(true);
    const fd = new FormData();
    fd.append("file", uploadedFile);
    try {
      const r = await axios.post(`${API}/predict`, fd);
      setResult(r.data);
    } catch { alert("Backend not responding."); }
    setLoading(false);
  };

  const labelOf = (cls) =>
    cls === "notumor" ? "No tumor" : cls.charAt(0).toUpperCase() + cls.slice(1);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#f8f9fb", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#111827", letterSpacing: "-0.2px" }}>NeuroScan</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280", background: "#f3f4f6", padding: "3px 10px", borderRadius: 20, border: "1px solid #e5e7eb" }}>EfficientNet-B0</span>
          <span style={{ fontSize: 12, color: "#166534", background: "#f0fdf4", padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0", fontWeight: 500 }}>98.31% accuracy</span>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px", flex: 1, width: "100%" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Brain Tumor MRI Classifier</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Select a demo scan or upload your own MRI image to get an AI-powered diagnosis with explainability.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Model", value: "EfficientNet-B0" },
            { label: "Test accuracy", value: "98.31%" },
            { label: "Classes", value: "4 tumor types" },
            { label: "Explainability", value: "Grad-CAM" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #e5e7eb" }}>
          {["demo", "upload"].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setResult(null); }} style={{
              padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#4f46e5" : "#6b7280",
              borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
              marginBottom: -1, transition: "all 0.15s"
            }}>
              {tab === "demo" ? "Demo scans" : "Upload scan"}
            </button>
          ))}
        </div>

        {/* Demo panel */}
        {activeTab === "demo" && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>Click any scan below to run classification</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {demoImages.map((img) => (
                <div key={img.filename} onClick={() => runDemo(img.filename)} style={{
                  borderRadius: 8, overflow: "hidden", cursor: "pointer",
                  border: selectedDemo === img.filename ? "2px solid #4f46e5" : "1px solid #e5e7eb",
                  background: "#f9fafb", transition: "border 0.15s"
                }}>
                  <img src={`${API}/demo-images/${img.filename}`} alt={img.label} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#374151", textTransform: "capitalize" }}>{labelOf(img.label)}</span>
                    {selectedDemo === img.filename && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f46e5", display: "block" }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload panel */}
        {activeTab === "upload" && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <label style={{
              display: "block", border: "1.5px dashed #d1d5db", borderRadius: 10,
              padding: uploadPreview ? 12 : 40, cursor: "pointer", textAlign: "center",
              background: "#fafafa", marginBottom: 16
            }}>
              {uploadPreview
                ? <img src={uploadPreview} alt="preview" style={{ maxHeight: 180, borderRadius: 6, display: "block", margin: "0 auto" }} />
                : <>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f3f4f6", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", margin: "0 0 4px", fontWeight: 500 }}>Click to upload MRI image</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>JPG or PNG</p>
                  </>
              }
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </label>
            {uploadedFile && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadedFile.name}</span>
                <button onClick={runUpload} disabled={loading} style={{
                  background: "#4f46e5", color: "#fff", border: "none", padding: "9px 20px",
                  borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  opacity: loading ? 0.7 : 1
                }}>
                  {loading ? "Analyzing..." : "Run analysis"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 40, textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #4f46e5", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 14, color: "#374151", fontWeight: 500, margin: "0 0 4px" }}>Running analysis</p>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>EfficientNet-B0 + Grad-CAM</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>Diagnosis</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{labelOf(result.predicted_class)}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: SEVERITY_COLORS[result.class_info.severity].bg,
                  color: SEVERITY_COLORS[result.class_info.severity].text
                }}>{result.class_info.severity} severity</span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.6 }}>{result.class_info.description}</p>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Confidence</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{result.confidence}%</span>
                </div>
                <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3 }}>
                  <div style={{ height: 5, borderRadius: 3, background: "#4f46e5", width: `${result.confidence}%`, transition: "width 0.8s ease" }} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" }}>All classes</p>
              {Object.entries(result.probabilities).map(([cls, prob]) => (
                <div key={cls} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4, minWidth: 78, textAlign: "center",
                    background: CLASS_COLORS[cls].bg, color: CLASS_COLORS[cls].text, border: `1px solid ${CLASS_COLORS[cls].border}`
                  }}>{labelOf(cls)}</span>
                  <div style={{ flex: 1, height: 4, background: "#f3f4f6", borderRadius: 2 }}>
                    <div style={{ height: 4, borderRadius: 2, width: `${prob}%`, background: cls === result.predicted_class ? "#4f46e5" : "#d1d5db", transition: "width 0.8s ease" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#6b7280", minWidth: 36, textAlign: "right" }}>{prob}%</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>Original scan</p>
                <img src={`data:image/png;base64,${result.original}`} alt="scan" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 6, display: "block", background: "#000" }} />
              </div>
              {result.predicted_class !== "notumor" ? (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Grad-CAM heatmap</p>
                    <span style={{ fontSize: 11, color: "#4f46e5", background: "#eef2ff", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>AI focus region</span>
                  </div>
                  <img src={`data:image/png;base64,${result.heatmap}`} alt="heatmap" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 6, display: "block" }} />
                </div>
              ) : (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 28, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dcfce7", border: "1px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#166534", margin: "0 0 4px" }}>No tumor detected</p>
                    <p style={{ fontSize: 13, color: "#16a34a", margin: 0 }}>Brain scan appears healthy. No abnormal masses identified.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "28px 32px", marginTop: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>NeuroScan</span>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>For educational purposes only — not for clinical diagnosis</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Team</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
                {TEAM.map((name) => (
                  <span key={name} style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{name}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 20, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#d1d5db" }}>Deep Learning — Humber College</span>
            <span style={{ fontSize: 12, color: "#d1d5db" }}>EfficientNet-B0 · Grad-CAM · PyTorch · FastAPI · React</span>
          </div>
        </div>
      </footer>

    </div>
  );
}