import React, { useState, useEffect } from "react";
import { Box, IconButton, Paper, Typography, CircularProgress, Alert } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const GovLogosSection = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  // Fetch logos from Firebase
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const logosSnapshot = await getDocs(collection(db, "govLogos"));
        const logosData = logosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort by order if available, otherwise by creation order
        logosData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setLogos(logosData);
        console.log('Fetched logos:', logosData);
      } catch (error) {
        console.error('Error fetching logos:', error);
        setError('लोगो आणण्यात त्रुटी आली');
      } finally {
        setLoading(false);
      }
    };

    fetchLogos();
  }, []);

  // Auto-rotate logos
  useEffect(() => {
    if (!isAutoPlaying || logos.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === logos.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, logos.length]);

  const handlePrev = () => {
    if (logos.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? logos.length - 1 : prev - 1));
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleNext = () => {
    if (logos.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev === logos.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleImageError = (index) => {
    setImageLoadErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleLogoClick = (link) => {
    window.open(link, "_blank");
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: 200,
          background: "linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, lg: 6 },
          py: { xs: 4, lg: 6 },
          borderTop: '4px solid #FFD700',
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <CircularProgress sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ fontFamily: '"Roboto", "Arial", sans-serif', fontWeight: 500 }}>
            लोगो आणत आहे...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: 200,
          background: "linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, lg: 6 },
          py: { xs: 4, lg: 6 },
          borderTop: '4px solid #FFD700',
        }}
      >
        <Alert severity="error" sx={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // No logos state
  if (logos.length === 0) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: 200,
          background: "linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, lg: 6 },
          py: { xs: 4, lg: 6 },
          borderTop: '4px solid #FFD700',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            textAlign: 'center',
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 500
          }}
        >
          कोणतेही लोगो उपलब्ध नाहीत
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: 200,
        background: "linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 4, lg: 6 },
        py: { xs: 4, lg: 6 },
        boxSizing: "border-box",
        gap: 2,
        borderTop: '4px solid #FFD700',
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 10% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }
      }}
    >
      {/* Subtle animated particles */}
      {[...Array(10)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 6,
            height: 6,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
              "50%": { transform: "translateY(-15px) translateX(10px)" }
            }
          }}
        />
      ))}

      {/* Left Text */}
      <Box
        sx={{
          flexShrink: 0,
          zIndex: 1,
          display: { xs: 'none', lg: 'flex' },
          pointerEvents: "none",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "white",
            fontWeight: 700,
            fontSize: { lg: "3rem", xl: "4rem" },
            lineHeight: 1.2,
            textShadow: "0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)",
            fontFamily: '"Roboto", "Arial", sans-serif',
            whiteSpace: "nowrap",
            letterSpacing: 1,
          }}
        >
          शासकीय
        </Typography>
      </Box>

      {/* Center - Logo Carousel */}
      <Box 
        sx={{ 
          flex: "1 1 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 0,
          zIndex: 2,
          px: 2,
          position: "relative"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, lg: 4 } }}>
          
          {/* Previous Button */}
          <IconButton
            onClick={handlePrev}
            sx={{
              p: { xs: 1.5, lg: 2 },
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.3)",
              color: "white",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.25)",
                borderColor: "rgba(255,255,255,0.5)",
                transform: "scale(1.1) translateX(-4px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.25)"
              },
              "&:active": {
                transform: "scale(0.95)"
              }
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: { xs: 24, lg: 32 } }} />
          </IconButton>

          {/* Logo Container */}
          <Box sx={{ position: "relative", zIndex: 10 }}>
            <Paper
              elevation={0}
              onClick={() => handleLogoClick(logos[currentIndex].link)}
              sx={{
                position: "relative",
                p: { xs: 2, lg: 3 },
                width: { xs: 220, lg: 280 },
                height: { xs: 140, lg: 170 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backgroundColor: "white",
                borderRadius: 3,
                border: '2px solid rgba(25, 118, 210, 0.1)',
                boxShadow: "0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "scale(1.08) translateY(-4px)",
                  boxShadow: "0 16px 40px rgba(25, 118, 210, 0.25), 0 0 0 2px rgba(25, 118, 210, 0.2)",
                  borderColor: "rgba(25, 118, 210, 0.3)",
                  "&::after": {
                    opacity: 1
                  }
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(66, 165, 245, 0.05))",
                  borderRadius: 3,
                  opacity: 0,
                  transition: "opacity 0.3s ease"
                }
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: { xs: 90, lg: 110 },
                  backgroundColor: "#f8fafc",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                  position: "relative",
                  overflow: "hidden",
                  border: '1px solid #e0e0e0',
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.1), transparent)",
                    animation: "shimmer 3s ease-in-out infinite",
                    "@keyframes shimmer": {
                      "0%": { left: "-100%" },
                      "100%": { left: "100%" }
                    }
                  }
                }}
              >
                {imageLoadErrors[currentIndex] ? (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#1976d2",
                      fontSize: { xs: "10px", lg: "12px" },
                      fontWeight: 600,
                      textAlign: "center",
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      px: 1
                    }}
                  >
                    {logos[currentIndex].alt || logos[currentIndex].title}
                  </Typography>
                ) : (
                  <img
                    src={logos[currentIndex].src}
                    alt={logos[currentIndex].alt || logos[currentIndex].title}
                    style={{ 
                      maxWidth: "85%", 
                      maxHeight: "85%",
                      objectFit: "contain",
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                    onError={() => handleImageError(currentIndex)}
                  />
                )}
              </Box>
              
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: "11px", lg: "13px" },
                  fontWeight: 600,
                  color: "#1976d2",
                  textAlign: "center",
                  zIndex: 1,
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  textTransform: 'capitalize',
                  lineHeight: 1.3,
                  px: 1
                }}
              >
                {logos[currentIndex].title || logos[currentIndex].alt}
              </Typography>
            </Paper>

            {/* Progress indicators */}
            <Box
              sx={{
                position: "absolute",
                bottom: -28,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1.5,
                zIndex: 10,
                alignItems: 'center',
              }}
            >
              {logos.map((logo, index) => (
                <Box
                  key={logo.id || index}
                  component="button"
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 5000);
                  }}
                  sx={{
                    width: index === currentIndex ? 36 : 10,
                    height: 10,
                    borderRadius: 5,
                    border: index === currentIndex ? "2px solid white" : "2px solid rgba(255,255,255,0.5)",
                    backgroundColor: index === currentIndex ? "white" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: index === currentIndex ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.8)",
                      width: index === currentIndex ? 36 : 14,
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Next Button */}
          <IconButton
            onClick={handleNext}
            sx={{
              p: { xs: 1.5, lg: 2 },
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.3)",
              color: "white",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.25)",
                borderColor: "rgba(255,255,255,0.5)",
                transform: "scale(1.1) translateX(4px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.25)"
              },
              "&:active": {
                transform: "scale(0.95)"
              }
            }}
          >
            <ChevronRightIcon sx={{ fontSize: { xs: 24, lg: 32 } }} />
          </IconButton>
        </Box>
      </Box>

      {/* Right Text */}
      <Box
        sx={{
          flexShrink: 0,
          zIndex: 1,
          display: { xs: 'none', lg: 'flex' },
          pointerEvents: "none",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "white",
            fontWeight: 700,
            fontSize: { lg: "3rem", xl: "4rem" },
            lineHeight: 1.2,
            textShadow: "0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)",
            fontFamily: '"Roboto", "Arial", sans-serif',
            whiteSpace: "nowrap",
            letterSpacing: 1,
          }}
        >
          संकेतस्थळे
        </Typography>
      </Box>

      {/* Bottom decorative wave */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          overflow: "hidden",
          zIndex: 0,
          opacity: 0.6
        }}
      >
        <svg
          style={{ display: "block", width: "100%", height: 40 }}
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="rgba(255,255,255,0.15)"
          />
        </svg>
      </Box>
    </Box>
  );
};

export default GovLogosSection;
