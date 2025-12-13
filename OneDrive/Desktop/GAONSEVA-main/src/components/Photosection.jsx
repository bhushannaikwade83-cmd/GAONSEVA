import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Photosection = () => {
  const [images, setImages] = useState(["/farmer1.jpg", "/farmer2.jpg"]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load images from Firestore
  useEffect(() => {
    const loadImages = async () => {
      try {
        const ref = doc(db, 'home', 'photos');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.images)) {
            setImages(data.images);
            setCurrentIndex(0);
          } else {
            setImages([]);
          }
        } else {
          setImages([]);
        }
      } catch (e) {
        console.error('Error fetching photos', e);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToSlide = (index) => setCurrentIndex(index);

  return (
    <div
      style={{
        width: "100%",
        height: isMobile ? 250 : 400, // responsive height
        position: "relative",
        marginTop: "0px", // below navbar
      }}
    >
      {loading ? (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "white" }}>
          लोड होत आहे...
        </div>
      ) : images.length === 0 ? (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "white" }}>
          कोणतीही फोटो उपलब्ध नाही
        </div>
      ) : (
        images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === currentIndex ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
          />
        ))
      )}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        style={{
          position: "absolute",
          left: isMobile ? "10px" : "20px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: isMobile ? "35px" : "45px",
          height: isMobile ? "35px" : "45px",
          fontSize: isMobile ? "16px" : "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        ❮
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: "absolute",
          right: isMobile ? "10px" : "20px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: isMobile ? "35px" : "45px",
          height: isMobile ? "35px" : "45px",
          fontSize: isMobile ? "16px" : "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        ❯
      </button>

      {/* Dots Indicator */}
      <div
        style={{
          position: "absolute",
          bottom: isMobile ? "15px" : "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: isMobile ? "8px" : "12px",
          zIndex: 10,
        }}
      >
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: isMobile ? "10px" : "12px",
              height: isMobile ? "10px" : "12px",
              borderRadius: "50%",
              border: "2px solid white",
              background: index === currentIndex ? "white" : "transparent",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Photosection;
