import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

function Sampark() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, "extra", "sampark", "items");
    const q = query(col, orderBy("name", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>संपर्क</h2>
      {loading ? (
        <div>लोड होत आहे...</div>
      ) : contacts.length === 0 ? (
        <div>नोंदी उपलब्ध नाहीत.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {contacts.map((c) => (
            <div key={c.id} style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 16, background: "#fff" }}>
              <h3 style={{ margin: "0 0 8px" }}>{c.name}</h3>
              {c.phone ? <div style={{ color: "#444" }}>फोन: {c.phone}</div> : null}
              {c.email ? <div style={{ color: "#444" }}>ईमेल: {c.email}</div> : null}
              {c.message ? <p style={{ marginTop: 8, color: "#555" }}>{c.message}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sampark;


