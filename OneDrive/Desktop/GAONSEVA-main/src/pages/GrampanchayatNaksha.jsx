import React, { useState, useEffect } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import Layout from "../components/Layout";
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const GrampanchayatNaksha = () => {
  const [mapUrl, setMapUrl] = useState('');
  const [gpName, setGpName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Map URL
        const mapDocRef = doc(db, 'grampanchayat', 'map');
        const mapDocSnap = await getDoc(mapDocRef);
        if (mapDocSnap.exists() && mapDocSnap.data().url) {
          setMapUrl(mapDocSnap.data().url);
        } else {
          setMapUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54341.629057809354!2d76.61788526233583!3d19.83610522179175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd08819f1637b71%3A0x6bf6293dc668def3!2sKapadsingi%2C%20Maharashtra%20431542!5e0!3m2!1sen!2sin!4v1757271708585!5m2!1sen!2sin");
        }

        // Fetch Gram Panchayat Name
        const profileDocRef = doc(db, 'grampanchayat', 'profile');
        const profileDocSnap = await getDoc(profileDocRef);
        if (profileDocSnap.exists() && profileDocSnap.data().title) {
          setGpName(profileDocSnap.data().title);
        } else {
          setGpName("ग्रामपंचायत");
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        setMapUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54341.629057809354!2d76.61788526233583!3d19.83610522179175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd08819f1637b71%3A0x6bf6293dc668def3!2sKapadsingi%2C%20Maharashtra%20431542!5e0!3m2!1sen!2sin!4v1757271708585!5m2!1sen!2sin"); // Fallback URL
        setGpName("ग्रामपंचायत"); // Fallback Name
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {gpName ? `${gpName} - ग्रामपंचायत नकाशा` : 'ग्रामपंचायत नकाशा'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        येथे आपल्या ग्रामपंचायतीचा नकाशा दाखवला जाईल.
      </Typography>

      {/* Google Map iframe */}
      <Box sx={{ width: "100%", height: { xs: 300, md: 500 }, mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading Map...</Typography>
          </Box>
        ) : (
          <iframe
            title={`${gpName} Map`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          ></iframe>
        )}
      </Box>
    </Layout>
  );
};

export default GrampanchayatNaksha;