import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Welcome = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredStat, setHoveredStat] = useState(null);
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: isMobile ? '40px 20px' : '60px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '400px'
      }}
    >
      {/* Animated decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        opacity: 0.5,
        transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        transition: 'transform 0.3s ease-out',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '150px',
        height: '150px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        opacity: 0.5,
        transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
        transition: 'transform 0.3s ease-out',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      {/* Additional floating circles */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '10%',
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontSize: isMobile ? '28px' : '42px',
          margin: '0 0 15px 0',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          animation: 'fadeInDown 0.8s ease-out'
        }}>
          {gpName} वर
        </h1>

        {/* Marathi Welcome Message */}
        <p style={{
          fontSize: isMobile ? '18px' : '24px',
          margin: '0 0 20px 0',
          fontWeight: '600',
          color: '#fff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          animation: 'fadeInDown 0.8s ease-out 0.2s backwards'
        }}>
          स्वागत आहे
        </p>

        <p style={{
          fontSize: isMobile ? '15px' : '18px',
          margin: '0 0 25px 0',
          opacity: 0.95,
          maxWidth: '700px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6',
          animation: 'fadeInUp 0.8s ease-out 0.4s backwards'
        }}>
          आमच्या गावाची डिजिटल सेवा आणि माहिती एका ठिकाणी
        </p>

        {/* Interactive Quick Stats */}
        {loading ? (
          <p style={{ marginTop: '24px' }}>लोड होत आहे...</p>
        ) : (fetchedStats && fetchedStats.length > 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '15px' : '30px',
            marginTop: '30px',
            flexWrap: 'wrap'
          }}>
            {fetchedStats.map((item, i) => (
              <div 
                key={i}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                style={{
                  background: hoveredStat === i 
                    ? 'rgba(255,255,255,0.3)' 
                    : 'rgba(255,255,255,0.2)',
                  padding: isMobile ? '12px 18px' : '15px 25px',
                  borderRadius: '25px',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transform: hoveredStat === i ? 'translateY(-5px) scale(1.05)' : 'translateY(0)',
                  transition: 'all 0.3s ease',
                  opacity: statsVisible ? 1 : 0,
                  animation: `fadeInUp 0.5s ease-out ${0.6 + i * 0.1}s backwards`,
                  boxShadow: hoveredStat === i 
                    ? '0 8px 20px rgba(0,0,0,0.2)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  minWidth: isMobile ? '120px' : '140px'
                }}
              >
                <span style={{ 
                  fontSize: isMobile ? '24px' : '28px',
                  transform: hoveredStat === i ? 'scale(1.2) rotate(10deg)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                  display: 'inline-block'
                }}>
                  {item.icon}
                </span>
                <span>{item.text}</span>
                <span style={{
                  fontSize: '11px',
                  opacity: hoveredStat === i ? 1 : 0,
                  maxHeight: hoveredStat === i ? '20px' : '0',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  color: '#f0f0f0'
                }}>
                  {item.detail}
                </span>
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
