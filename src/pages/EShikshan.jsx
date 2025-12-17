import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

function EShikshan() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, "extra", "e-shikshan", "items");
    const q = query(col, orderBy("title", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setResources(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>ई-शिक्षण</h2>
      {loading ? (
        <div>लोड होत आहे...</div>
      ) : resources.length === 0 ? (
        <div>साधने उपलब्ध नाहीत.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {resources.map((r) => (
            <a key={r.id} href={r.resourceLink || "#"} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                ) : null}
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: "0 0 8px" }}>{r.title}</h3>
                  {r.description ? <p style={{ margin: 0, color: "#444" }}>{r.description}</p> : null}
                  {r.resourceLink ? <div style={{ marginTop: 8, color: "#1a73e8" }}>लिंक उघडा →</div> : null}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default EShikshan;


