import React, { useState, useEffect } from "react";
import { Typography, Box, CircularProgress, Paper, ImageList, ImageListItem, Dialog, IconButton } from "@mui/material";
import { Close, ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import Layout from "../components/Layout";

// Firebase imports
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const GrampanchayatMahiti = () => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch combined info from 'home/grampanchayat-info'
                const infoRef = doc(db, 'home', 'grampanchayat-info');
                const infoSnap = await getDoc(infoRef);
                const data = infoSnap.exists()
                  ? infoSnap.data()
                  : { gpName: 'ग्रामपंचायत', details: "माहिती उपलब्ध नाही. कृपया Admin Panel मधून माहिती अपडेट करा.", photo: "", photos: [] };

                const photosArray = Array.isArray(data.photos)
                  ? data.photos
                  : (data.photo ? [data.photo] : []);

                setInfo({
                    title: data.gpName || 'ग्रामपंचायत',
                    details: data.details || '',
                    photos: photosArray,
                });

            } catch (error) {
                console.error("Error fetching Gram Panchayat data: ", error);
                setInfo({
                    title: "माहिती लोड करण्यात अयशस्वी",
                    details: "कृपया आपले इंटरनेट कनेक्शन तपासा आणि पेज रिफ्रेश करा.",
                    photos: [],
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    if (loading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>माहिती लोड होत आहे...</Typography>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Paper elevation={2} sx={{ 
                p: { xs: 2, md: 4 }, 
                overflow: 'hidden', 
                borderRadius: 2, 
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
                    textAlign: 'center', 
                    color: '#1976d2', 
                    mb: 3,
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    borderBottom: '3px solid #FFD700',
                    paddingBottom: 2
                }}>
                    {info.title}
                </Typography>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ 
                        mb: 2, 
                        fontWeight: 600, 
                        color: '#1976d2',
                        fontFamily: '"Roboto", "Arial", sans-serif',
                        borderLeft: '4px solid #1a237e',
                        paddingLeft: 2
                    }}>
                        ग्रामपंचायत विषयी
                    </Typography>
                    <Typography variant="body1" sx={{ 
                        lineHeight: 1.9, 
                        whiteSpace: 'pre-line', 
                        color: '#212121',
                        fontSize: '1.1rem',
                        fontFamily: '"Roboto", "Arial", sans-serif'
                    }}>
                        {info.details || "माहिती उपलब्ध नाही."}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ 
                        mb: 2, 
                        fontWeight: 600, 
                        color: '#1976d2',
                        fontFamily: '"Roboto", "Arial", sans-serif',
                        borderLeft: '4px solid #1a237e',
                        paddingLeft: 2
                    }}>
                        सर्व फोटो
                    </Typography>
                    {info.photos && info.photos.length > 0 ? (
                        <ImageList variant="masonry" cols={3} gap={10} sx={{ m: 0 }}>
                            {info.photos.map((url, idx) => (
                                <ImageListItem key={url + idx} sx={{ cursor: 'pointer', borderRadius: 2, overflow: 'hidden', '&:hover img': { transform: 'scale(1.05)' } }} onClick={() => openLightbox(idx)}>
                                    <img
                                        src={`${url}`}
                                        alt={`photo-${idx}`}
                                        loading="lazy"
                                        style={{
                                            width: '100%',
                                            display: 'block',
                                            transition: 'transform 0.3s ease',
                                        }}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    ) : (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 8, border: '2px dashed #ddd', borderRadius: 2 }}>
                            <Typography>फोटो उपलब्ध नाहीत</Typography>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Lightbox Dialog for viewing images */}
            <Dialog open={lightboxOpen} onClose={() => setLightboxOpen(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { background: 'rgba(0,0,0,0.85)' } }}>
                <Box sx={{ position: 'relative' }}>
                    <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 2, background: 'rgba(0,0,0,0.3)' }}>
                        <Close />
                    </IconButton>
                    <IconButton onClick={() => setLightboxIndex((i) => Math.max(0, i - 1))} disabled={lightboxIndex === 0} sx={{ position: 'absolute', top: '50%', left: 8, color: 'white', zIndex: 2, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)' }}>
                        <ArrowBackIosNew />
                    </IconButton>
                    <IconButton onClick={() => setLightboxIndex((i) => Math.min(info.photos.length - 1, i + 1))} disabled={lightboxIndex >= info.photos.length - 1} sx={{ position: 'absolute', top: '50%', right: 8, color: 'white', zIndex: 2, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)' }}>
                        <ArrowForwardIos />
                    </IconButton>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
                        <Box component="img" src={info.photos[lightboxIndex]} alt={`lightbox-${lightboxIndex}`} sx={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
                    </Box>
                </Box>
            </Dialog>
        </Layout>
    );
};

export default GrampanchayatMahiti;