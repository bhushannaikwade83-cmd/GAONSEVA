import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Welcome = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchedStats, setFetchedStats] = useState(null);
  const [gpName, setGpName] = useState("ग्रामपंचायत");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Trigger stats animation after mount
    setTimeout(() => setStatsVisible(true), 300);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch welcome stats
        const welcomeRef = doc(db, 'home', 'welcome');
        const welcomeSnap = await getDoc(welcomeRef);
        if (welcomeSnap.exists()) {
          const data = welcomeSnap.data();
          if (Array.isArray(data?.stats)) {
            setFetchedStats(data.stats);
          } else {
            setFetchedStats([]);
          }
        } else {
          setFetchedStats([]);
        }

        // Fetch Gram Panchayat name from profile
        const profileRef = doc(db, 'grampanchayat', 'profile');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          if (profileData.title) {
            setGpName(profileData.title);
          }
        }
      } catch (e) {
        console.error('Error fetching welcome data', e);
        setFetchedStats([]);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <section 
      onMouseMove={handleMouseMove}
      style={{
        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
        color: 'white',
        padding: isMobile ? '40px 16px' : '70px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: isMobile ? '350px' : '450px',
        borderBottom: '4px solid #0d47a1'
      }}
    >
      {/* Subtle decorative elements - Government style */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '300px',
        height: '300px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '50%',
        opacity: 0.6
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '250px',
        height: '250px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '50%',
        opacity: 0.6
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontSize: isMobile ? '32px' : '48px',
          margin: '0 0 20px 0',
          fontWeight: '700',
          color: '#FFFFFF',
          textShadow: '3px 3px 6px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)',
          animation: 'fadeInDown 0.8s ease-out',
          fontFamily: '"Roboto", "Arial", sans-serif',
          letterSpacing: '1px'
        }}>
          {gpName} वर
        </h1>

        {/* Marathi Welcome Message */}
        <div style={{
          width: '80px',
          height: '4px',
          background: '#FFD700',
          margin: '0 auto 25px auto',
          borderRadius: '2px'
        }} />
        
        <p style={{
          fontSize: isMobile ? '20px' : '28px',
          margin: '0 0 25px 0',
          fontWeight: '600',
          color: '#FFFFFF',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)',
          animation: 'fadeInDown 0.8s ease-out 0.2s backwards',
          fontFamily: '"Roboto", "Arial", sans-serif'
        }}>
          स्वागत आहे
        </p>

        <p style={{
          fontSize: isMobile ? '16px' : '20px',
          margin: '0 0 30px 0',
          color: '#FFFFFF',
          opacity: 1,
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.8',
          textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.8s ease-out 0.4s backwards',
          fontFamily: '"Roboto", "Arial", sans-serif'
        }}>
          आमच्या गावाची डिजिटल सेवा आणि माहिती एका ठिकाणी
        </p>

        {/* Interactive Quick Stats */}
        {loading ? (
          <p style={{ marginTop: isMobile ? '20px' : '24px', fontSize: isMobile ? '14px' : '16px' }}>
            लोड होत आहे...
          </p>
        ) : (fetchedStats && fetchedStats.length > 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '10px' : '30px',
            marginTop: isMobile ? '20px' : '30px',
            flexWrap: 'wrap',
            padding: isMobile ? '0 8px' : '0'
          }}>
            {fetchedStats.map((item, i) => (
              <div 
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: isMobile ? '12px 16px' : '18px 28px',
                  borderRadius: '4px',
                  fontSize: isMobile ? '13px' : '15px',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? '5px' : '6px',
                  cursor: 'default',
                  opacity: statsVisible ? 1 : 0,
                  animation: `fadeInUp 0.5s ease-out ${0.6 + i * 0.1}s backwards`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  minWidth: isMobile ? '110px' : '160px',
                  maxWidth: isMobile ? '140px' : 'none',
                  fontFamily: '"Roboto", "Arial", sans-serif'
                }}
              >
                <span style={{ 
                  fontSize: isMobile ? '24px' : '28px',
                  display: 'inline-block'
                }}>
                  {item.icon}
                </span>
                <span>{item.text}</span>
                {item.detail && (
                  <span style={{
                    fontSize: '11px',
                    opacity: 1,
                    color: '#f0f0f0',
                    textAlign: 'center'
                  }}>
                    {item.detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: '24px' }}>डेटा उपलब्ध नाही</p>
        ))}
      </div>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
      `}</style>
    </section>
  );
};

export default Welcome;
