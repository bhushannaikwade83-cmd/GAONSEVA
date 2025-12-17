import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

function Batmya() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, "extra", "batmya", "items");
    const q = query(col, orderBy("date", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setNews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>बातम्या</h2>
      {loading ? (
        <div>लोड होत आहे...</div>
      ) : news.length === 0 ? (
        <div>बातम्या उपलब्ध नाहीत.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {news.map((n) => (
            <div key={n.id} style={{ border: "1px solidrgba(224, 224, 224, 0.96)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
              {n.imageUrl ? (
                <img src={n.imageUrl} alt={n.title} style={{ width: "99%", height: 180, objectFit: "cover" }} />
              ) : null}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{n.date}</div>
                <h3 style={{ margin: "0 0 8px" }}>{n.title}</h3>
                {n.content ? <p style={{ margin: 0, color: "#444" }}>{n.content}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Batmya;


