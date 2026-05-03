import { useEffect, useState } from "react";
import { Briefcase, Search, Building2, Calendar, Plus, X, Loader, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Centralized theme for easy customization
const theme = {
  bg: "#0f172a",         // Slate 900
  card: "#1e293b",       // Slate 800
  border: "#334155",     // Slate 700
  textPrimary: "#f8fafc",// Slate 50
  textMuted: "#94a3b8",  // Slate 400
  primary: "#3b82f6",    // Blue 500
  primaryHover: "#2563eb",
  success: "#00cc66",    
  danger: "#ef4444",     // Red 500
  inputBg: "#0f172a"
};

function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newJob, setNewJob] = useState({
    company: "",
    role: "",
    status: "Interview"
  });

  useEffect(() => {
    if (selectedJob) {
      setEditedStatus(selectedJob.status);
    }
  }, [selectedJob]);

  const fetchJobs = () => {
    setIsLoading(true);
    const cacheBuster = new Date().getTime(); 
    fetch(`https://docs.google.com/spreadsheets/d/1qKtCO_Rjl9u5iDccyF2d6qwlANTBffO0V15W_Jna0Ig/gviz/tq?tqx=out:json&t=${cacheBuster}`)
      .then(res => res.text())
      .then(data => {
        const json = JSON.parse(data.substring(47).slice(0, -2));
        const rows = json.table.rows.slice(1).filter(row => row.c[0] != null);

        const formatted = rows.map((row, index) => ({
          row_number: index + 2,
          company: row.c[0]?.v,
          role: row.c[1]?.v,
          status: row.c[2]?.v,
          notes: row.c[3]?.v,
          date: row.c[4]?.v,
        }));
        setJobs(formatted);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setTimeout(() => {
      fetchJobs();
    }, 2000);
  }, []);

  const updateStatus = async (rowNumber, status) => {
    await fetch("http://localhost:5678/webhook-test/update-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row_number: rowNumber, status: status })
    });
  };

  const addJob = async () => {
    if (!newJob.company || !newJob.role) {
      alert("Please fill in both the Company and Role fields.");
      return;
    }
    setIsAdding(true);
    const now = new Date();

    const utcDay = now.getUTCDate();
    const utcMonth = now.getUTCMonth();
    const utcYear = now.getUTCFullYear();
    const future = new Date(Date.UTC(utcYear, utcMonth, utcDay + 3));

    const formattedDate =
      String(future.getUTCDate()).padStart(2, "0") + "-" +
      String(future.getUTCMonth() + 1).padStart(2, "0") + "-" +
      future.getUTCFullYear();

    const newJobEntry = {
      row_number: jobs.length > 0 ? Math.max(...jobs.map(j => j.row_number)) + 1 : 2,
      company: newJob.company,
      role: newJob.role,
      status: newJob.status,
      notes: "",
      date: formattedDate,
    };

    setJobs([...jobs, newJobEntry]);
    const tempJob = newJob;

    setNewJob({ company: "", role: "", status: "Interview" });

    await fetch("http://localhost:5678/webhook/add-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempJob)
    });

    setTimeout(() => {
      fetchJobs();
      setIsAdding(false);
    }, 2000);
  };

  const filteredJobs = jobs.filter(job => {
    const matchFilter = filter === "All" || job.status === filter;
    const matchSearch = job.company?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalJobs = jobs.length;
  const interviewCount = jobs.filter(j => j.status === "Interview").length;
  const offerCount = jobs.filter(j => j.status === "Offer").length;
  const rejectedCount = jobs.filter(j => j.status === "Rejected").length;

  // Chart Data Preparation
  const chartData = [
    { name: "Interview", count: interviewCount, color: "#60a5fa" },
    { name: "Offer", count: offerCount, color: "#34d399" },
    { name: "Rejected", count: rejectedCount, color: "#f87171" }
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case "Interview": return { bg: "#1f3b57", text: "#60a5fa" };
      case "Offer": return { bg: "#145c2c", text: "#34d399" };    
      case "Rejected": return { bg: "#6b1c1c", text: "#f87171" };  
      default: return { bg: "#333", text: "#cbd5e1" };          
    }
  };

  const inputStyles = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1px solid ${theme.border}`,
    background: theme.inputBg,
    color: theme.textPrimary,
    outline: "none",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box"
  };

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  };

  const statTitleStyle = { margin: 0, fontSize: "14px", color: theme.textMuted, fontWeight: "500", cursor: "default" };
  const statValueStyle = { margin: 0, fontSize: "24px", fontWeight: "700", color: theme.textPrimary, cursor: "default" };

  return (
    <div style={{
      padding: "20px", 
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      background: theme.bg,
      minHeight: "100vh",
      color: theme.textPrimary,
      cursor: "default",
      boxSizing: "border-box"
    }}>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        
        /* Custom Tooltip Styling for Recharts */
        .custom-tooltip {
          background: ${theme.card};
          border: 1px solid ${theme.border};
          padding: 10px 15px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "30px", marginTop: "20px" }}>
          <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "10px", fontSize: "clamp(24px, 5vw, 32px)", fontWeight: "700", margin: "0 0 10px 0" }}>
            <Briefcase size={36} color={theme.primary} />
            Job Tracker Dashboard
          </h1>
          <p style={{ color: theme.textMuted, margin: 0 }}>Manage and track your job applications seamlessly.</p>
        </div>

        {/* STATS BLOCK */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}>
          <div style={cardStyle}>
            <h3 style={statTitleStyle}>Total</h3>
            <p style={statValueStyle}>{totalJobs}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={statTitleStyle}>Interview</h3>
            <p style={{...statValueStyle, color: "#60a5fa"}}>{interviewCount}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={statTitleStyle}>Offer</h3>
            <p style={{...statValueStyle, color: "#34d399"}}>{offerCount}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={statTitleStyle}>Rejected</h3>
            <p style={{...statValueStyle, color: "#f87171"}}>{rejectedCount}</p>
          </div>
        </div>

        {/* ANALYTICS CHART */}
        {!isLoading && totalJobs > 0 && (
          <div style={{ 
            background: theme.card, 
            padding: "20px", 
            borderRadius: "12px", 
            border: `1px solid ${theme.border}`,
            marginBottom: "30px",
            height: "280px",
            display: "flex",
            flexDirection: "column"
          }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: theme.textMuted, display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart3 size={18} />
              Application Overview
            </h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke={theme.textMuted} 
                    tick={{ fill: theme.textMuted, fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke={theme.textMuted} 
                    tick={{ fill: theme.textMuted, fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p style={{ margin: 0, fontWeight: "600", color: payload[0].payload.color }}>
                              {payload[0].payload.name}: {payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TOP CONTROLS */}
        <div style={{ 
          background: theme.card, 
          padding: "20px", 
          borderRadius: "12px", 
          border: `1px solid ${theme.border}`,
          marginBottom: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          
          {/* ADD JOB FORM */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 200px" }}>
              <input
                placeholder="Company Name"
                value={newJob.company}
                onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                style={inputStyles}
              />
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <input
                placeholder="Role (e.g. Frontend Developer)"
                value={newJob.role}
                onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                style={inputStyles}
              />
            </div>
            <div style={{ flex: "1 1 120px" }}>
              <select
                value={newJob.status}
                onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                style={inputStyles}
              >
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>
            
            <button
              onClick={addJob}
              disabled={isAdding}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              style={{
                flex: "1 1 120px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                background: isAdding ? theme.border : theme.success,
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "5px",
                fontWeight: "600",
                cursor: isAdding ? "not-allowed" : "pointer",
                transition: "0.2s",
                height: "40px"
              }}
            >
              {isAdding ? <Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={18} />}
              {isAdding ? "Adding..." : "Add Job"}
            </button>
          </div>

          <div style={{ height: "1px", background: theme.border, width: "100%" }}></div>

          {/* SEARCH & FILTERS */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "15px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: "1 1 300px" }}>
              {["All", "Interview", "Offer", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "none",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flex: "1 1 auto", 
                    background: filter === f ? theme.primary : theme.inputBg,
                    color: filter === f ? "#fff" : theme.textMuted,
                    border: `1px solid ${filter === f ? theme.primary : theme.border}`
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{
              display: "flex", alignItems: "center", background: theme.inputBg,
              padding: "8px 16px", borderRadius: "20px", border: `1px solid ${theme.border}`, 
              flex: "1 1 250px", maxWidth: "100%"
            }}>
              <Search size={16} color={theme.textMuted} />
              <input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  color: theme.textPrimary, marginLeft: "10px", width: "100%", fontSize: "14px"
                }}
              />
            </div>
          </div>
        </div>

        {/* JOB CARDS GRID OR LOADER */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 20px", color: theme.primary }}>
            <Loader size={48} style={{ animation: "spin 1s linear infinite", marginBottom: "16px" }} />
            <p style={{ color: theme.textMuted, margin: 0, fontSize: "16px", fontWeight: "500" }}>Fetching your applications...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: theme.textMuted }}>
            <p style={{ fontSize: "18px", color: "#888" }}>No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {filteredJobs.map((job, index) => {
              const statusStyle = getStatusStyles(job.status);
              return (
                <div
                  key={index}
                  onClick={() => setSelectedJob(job)}
                  style={{
                    background: theme.card,
                    borderRadius: "10px",
                    padding: "20px",
                    cursor: "pointer",
                    border: `1px solid ${theme.border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.7)";
                    e.currentTarget.style.borderColor = theme.primary; 
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";
                    e.currentTarget.style.borderColor = theme.border; 
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building2 size={18} color={theme.primary} />
                      {job.company}
                    </h3>
                  </div>

                  <p style={{ fontSize: "15px", color: theme.textMuted, margin: "0 0 16px 0" }}>
                    {job.role}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: statusStyle.bg,
                      color: statusStyle.text
                    }}>
                      {job.status}
                    </span>

                    <span style={{ fontSize: "12px", color: theme.textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} />
                      {job.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL */}
        {selectedJob && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50, padding: "20px", boxSizing: "border-box",
            transition: "0.3s"
          }}>
            <div style={{
              background: theme.card,
              padding: "30px",
              borderRadius: "16px",
              width: "100%", 
              maxWidth: "400px", 
              border: `1px solid ${theme.border}`,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: "0 0 5px 0", fontSize: "24px" }}>{selectedJob.company}</h2>
                  <p style={{ margin: 0, color: theme.textMuted }}>{selectedJob.role}</p>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", padding: "4px" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.textMuted }}>
                  Update Application Status
                </label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  style={{ ...inputStyles, width: "100%" }}
                >
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setSelectedJob(null)}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  style={{
                    flex: "1 1 120px", padding: "12px", background: "transparent", border: `1px solid ${theme.border}`,
                    borderRadius: "8px", color: theme.textPrimary, fontWeight: "600", cursor: "pointer", transition: "0.2s"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await updateStatus(selectedJob.row_number, editedStatus);
                    const updatedJobs = jobs.map(job =>
                      job.row_number === selectedJob.row_number ? { ...job, status: editedStatus } : job
                    );
                    setJobs(updatedJobs);
                    setSelectedJob(null);
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  style={{
                    flex: "1 1 120px", padding: "12px", background: theme.primary, border: "none",
                    borderRadius: "8px", color: "white", fontWeight: "600", cursor: "pointer", transition: "0.2s"
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;