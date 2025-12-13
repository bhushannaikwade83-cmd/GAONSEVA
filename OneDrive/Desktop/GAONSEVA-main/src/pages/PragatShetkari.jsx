import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

function PragatShetkari() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, "extra", "pragat-shetkari", "items");
    const q = query(col, orderBy("name", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFarmers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: "16px" }}>प्रगत शेतकरी</h2>
      {loading ? (
        <div>लोड होत आहे...</div>
      ) : farmers.length === 0 ? (
        <div>नोंदी उपलब्ध नाहीत.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {farmers.map((f) => (
            <div key={f.id} style={{ border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
              {f.imageUrl ? (
                <img src={f.imageUrl} alt={f.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              ) : null}
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 6px" }}>{f.name}</h3>
                <div style={{ color: "#555", marginBottom: 6 }}>{f.village}</div>
                {f.achievement ? <div style={{ fontWeight: 600, marginBottom: 6 }}>{f.achievement}</div> : null}
                {f.description ? <p style={{ margin: 0, color: "#444" }}>{f.description}</p> : null}
                {f.contact ? <div style={{ marginTop: 8, color: "#666" }}>संपर्क: {f.contact}</div> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PragatShetkari;


