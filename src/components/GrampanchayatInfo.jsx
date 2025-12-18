import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import {
  Box,
  Paper,
  Typography,
  Container,
  Link,
  Grid,
  List,
  ListItem,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { db } from "../firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  addDoc
} from "firebase/firestore";

const GrampanchayatInfo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for dynamic data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState({
    area: '',
    population: '',
    literacy: '',
    schools: '',
    banks: '',
    hospitals: '',
    toilets: '',
    postOffice: '',
  });
  const [bankDetails, setBankDetails] = useState({
    name: '',
    accountNumber: '',
    IFSC: '',
    address: '',
  });
  const [weeklyMarkets, setWeeklyMarkets] = useState([]);
  const [tourismPlaces, setTourismPlaces] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [eServices, setEServices] = useState([]);
  const [howToReach, setHowToReach] = useState([]);
  const [healthyHabits, setHealthyHabits] = useState([]);
  const [mapUrl, setMapUrl] = useState('');

  // Custom Arrow Components
  const CustomPrevArrow = ({ onClick }) => (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        left: { xs: -30, md: -45 },
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        cursor: 'pointer',
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        borderRadius: '50%',
        width: { xs: 36, md: 44 },
        height: { xs: 36, md: 44 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: { xs: 18, md: 22 },
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: '#1565c0',
          transform: 'translateY(-50%) scale(1.15)',
          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
        },
        '&:active': {
          transform: 'translateY(-50%) scale(0.95)',
        }
      }}
    >
      ❮
    </Box>
  );

  const CustomNextArrow = ({ onClick }) => (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        right: { xs: -30, md: -45 },
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        cursor: 'pointer',
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        borderRadius: '50%',
        width: { xs: 36, md: 44 },
        height: { xs: 36, md: 44 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: { xs: 18, md: 22 },
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: '#1565c0',
          transform: 'translateY(-50%) scale(1.15)',
          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
        },
        '&:active': {
          transform: 'translateY(-50%) scale(0.95)',
        }
      }}
    >
      ❯
    </Box>
  );

  const sliderSettings = {
    dots: true,
    infinite: galleryImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: galleryImages.length > 1,
    autoplaySpeed: 4000,
    arrows: galleryImages.length > 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    dotsClass: "slick-dots custom-dots",
  };

  // Function to add default E-Services if none exist
  const addDefaultEServices = async () => {
    try {
      const defaultServices = [
        { serviceName: "पुरवठा", serviceUrl: "https://aaplesarkar.maharashtra.gov.in/en/", order: 1 },
        { serviceName: "न्यायालयीन", serviceUrl: "https://aaplesarkar.maharashtra.gov.in/en/", order: 2 },
        { serviceName: "महसूल", serviceUrl: "https://aaplesarkar.maharashtra.gov.in/en/", order: 3 },
        { serviceName: "देयक", serviceUrl: "https://aaplesarkar.maharashtra.gov.in/en/", order: 4 },
        { serviceName: "प्रमाणपत्रे", serviceUrl: "https://aaplesarkar.maharashtra.gov.in/en/", order: 5 }
      ];

      for (const service of defaultServices) {
        await addDoc(collection(db, "home", "grampanchayat-info", "eServices"), {
          ...service,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      console.log('Default E-Services added successfully');
    } catch (error) {
      console.error('Error adding default E-Services:', error);
    }
  };

  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview data
      try {
        const overviewDoc = await getDoc(doc(db, "home", "grampanchayat-info"));
        if (overviewDoc.exists()) {
          const data = overviewDoc.data();
          setOverview({
            area: data.area || '',
            population: data.population || '',
            literacy: data.literacy || '',
            schools: data.schools || '',
            banks: data.banks || '',
            hospitals: data.hospitals || '',
            toilets: data.toilets || '',
            postOffice: data.postOffice || '',
          });
        }
      } catch (overviewError) {
        console.error('Error fetching overview:', overviewError);
      }

      // Fetch bank details
      try {
        const bankDoc = await getDoc(doc(db, "home", "grampanchayat-info"));
        if (bankDoc.exists()) {
          const data = bankDoc.data();
          setBankDetails({
            name: data.bankName || '',
            accountNumber: data.accountNumber || '',
            IFSC: data.IFSC || '',
            address: data.bankAddress || '',
          });
        }
      } catch (bankError) {
        console.error('Error fetching bank details:', bankError);
      }

      // Fetch weekly markets
      try {
        const marketsSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "weeklyMarkets"));
        const marketsData = marketsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWeeklyMarkets(marketsData);
      } catch (marketsError) {
        console.error('Error fetching markets:', marketsError);
      }

      // Fetch tourism places
      try {
        const tourismSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "tourism"));
        const tourismData = tourismSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTourismPlaces(tourismData);
      } catch (tourismError) {
        console.error('Error fetching tourism places:', tourismError);
      }

      // Fetch gallery images
      try {
        const gallerySnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "gallery"));
        const galleryData = gallerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by order if available
        galleryData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setGalleryImages(galleryData);
      } catch (galleryError) {
        console.error('Error fetching gallery images:', galleryError);
      }

      // Fetch E-Services
      try {
        console.log('Fetching E-Services from Firebase...');
        const eServicesSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "eServices"));
        console.log('E-Services snapshot:', eServicesSnapshot);
        console.log('E-Services docs count:', eServicesSnapshot.docs.length);
        
        const eServicesData = eServicesSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('E-Service doc data:', data);
          return {
            id: doc.id,
            ...data,
          };
        });
        
        // Sort by order if available
        eServicesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        console.log('Final E-Services data:', eServicesData);
        
        // If no E-Services exist, add default ones
        if (eServicesData.length === 0) {
          console.log('No E-Services found, adding default ones...');
          await addDefaultEServices();
          // Fetch again after adding defaults
          const newSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "eServices"));
          const newData = newSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          newData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setEServices(newData);
        } else {
          setEServices(eServicesData);
        }
      } catch (eServicesError) {
        console.error('Error fetching E-Services:', eServicesError);
        // Set default E-Services if there's an error
        setEServices([]);
      }

      // Fetch How to Reach
      try {
        const howToReachSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "howToReach"));
        const howToReachData = howToReachSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by order if available
        howToReachData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setHowToReach(howToReachData);
      } catch (howToReachError) {
        console.error('Error fetching How to Reach:', howToReachError);
        setHowToReach([]);
      }

      // Fetch Healthy Habits
      try {
        const healthyHabitsSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "healthyHabits"));
        const healthyHabitsData = healthyHabitsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by order if available
        healthyHabitsData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setHealthyHabits(healthyHabitsData);
      } catch (healthyHabitsError) {
        console.error('Error fetching Healthy Habits:', healthyHabitsError);
        setHealthyHabits([]);
      }

      // Fetch Map URL
      try {
        const mapDoc = await getDoc(doc(db, "grampanchayat", "map"));
        if (mapDoc.exists()) {
          const mapData = mapDoc.data();
          setMapUrl(mapData.url || '');
          console.log('Map URL fetched:', mapData.url);
        } else {
          console.log('No map document found, using default URL');
          setMapUrl('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54341.629057809354!2d76.61788526233583!3d19.83610522179175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd08819f1637b71%3A0x6bf6293dc668def3!2sKapadsingi%2C%20Maharashtra%20431542!5e0!3m2!1sen!2sin!4v1757271708585!5m2!1sen!2sin');
        }
      } catch (mapError) {
        console.error('Error fetching map URL:', mapError);
        setMapUrl('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54341.629057809354!2d76.61788526233583!3d19.83610522179175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd08819f1637b71%3A0x6bf6293dc668def3!2sKapadsingi%2C%20Maharashtra%20431542!5e0!3m2!1sen!2sin!4v1757271708585!5m2!1sen!2sin');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('माहिती आणण्यात त्रुटी आली');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6">माहिती आणत आहे...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {/* First Section - Government Blue Background */}
      <Box
        sx={{
          width: "100%",
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
          color: "white",
          py: { xs: 4, md: 6 },
          borderTop: '4px solid #FFD700',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Column 1 - Overview */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "rgba(255,255,255,0.95)",
                  color: "#212121",
                  borderRadius: 3,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                  }
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2.5,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="bold" 
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      mb: 0.5
                    }}
                  >
                    दृष्टीक्षेपात ग्रामपंचायत
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.85rem'
                    }}
                  >
                    Overview
                  </Typography>
                </Box>
                <List dense sx={{ mt: 1 }}>
                  {[
                    { label: 'क्षेत्र', value: overview.area || '___', unit: 'चौ. कि.मी.' },
                    { label: 'लोकसंख्या', value: overview.population || '______' },
                    { label: 'साक्षरतेचे प्रमाण', value: overview.literacy || '__', unit: '%' },
                    { label: 'शाळा', value: overview.schools || '______' },
                    { label: 'बँक', value: overview.banks || '______' },
                    { label: 'रुग्णालये', value: overview.hospitals || '______' },
                    { label: 'स्वच्छतागृहे', value: overview.toilets || '______' },
                    { label: 'पोस्ट ऑफिस', value: overview.postOffice || '______' },
                  ].map((item, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding
                      sx={{
                        py: 1,
                        borderBottom: index < 7 ? '1px solid #e0e0e0' : 'none',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#757575',
                            fontFamily: '"Roboto", "Arial", sans-serif',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 700,
                            color: '#1976d2',
                            fontFamily: '"Roboto", "Arial", sans-serif',
                            fontSize: '1rem'
                          }}
                        >
                          {item.value} {item.unit || ''}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Column 2 - Bank Details */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "rgba(255,255,255,0.95)",
                  color: "#212121",
                  borderRadius: 3,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                  }
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2.5,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="bold" 
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      mb: 0.5
                    }}
                  >
                    ग्रामपंचायत बँक तपशील
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.85rem'
                    }}
                  >
                    Bank Details
                  </Typography>
                </Box>
                <List dense sx={{ mt: 1 }}>
                  {[
                    { label: 'बँकेचे नाव', value: bankDetails.name || '______' },
                    { label: 'बँक खाते क्रमांक', value: bankDetails.accountNumber || '______' },
                    { label: 'IFSC कोड', value: bankDetails.IFSC || '______' },
                    { label: 'बँकेचा पत्ता', value: bankDetails.address || '______' },
                  ].map((item, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding
                      sx={{
                        py: 1,
                        borderBottom: index < 3 ? '1px solid #e0e0e0' : 'none',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#757575',
                            fontFamily: '"Roboto", "Arial", sans-serif',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#1976d2',
                            fontFamily: '"Roboto", "Arial", sans-serif',
                            wordBreak: 'break-word'
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Column 3 - E-Services */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "rgba(255,255,255,0.95)",
                  color: "#212121",
                  borderRadius: 3,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                  }
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2.5,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="bold" 
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      mb: 0.5
                    }}
                  >
                    ई-सेवा
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.85rem'
                    }}
                  >
                    E-Services
                  </Typography>
                </Box>
                {eServices.length > 0 ? (
                  <List dense>
                    {eServices.map((service, index) => (
                      <ListItem 
                        key={service.id || index} 
                        disablePadding
                        sx={{
                          py: 0.75,
                          borderBottom: index < eServices.length - 1 ? '1px solid #e0e0e0' : 'none',
                          '&:hover': {
                            backgroundColor: '#e3f2fd',
                            borderRadius: 1,
                          }
                        }}
                      >
                        <Link
                          href={service.serviceUrl || "https://aaplesarkar.maharashtra.gov.in/en/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            color: "#1976d2", 
                            textDecoration: "none",
                            fontWeight: 600,
                            fontFamily: '"Roboto", "Arial", sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: '#1565c0',
                              transform: 'translateX(4px)',
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#1976d2',
                              flexShrink: 0
                            }}
                          />
                          {service.serviceName}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <List dense>
                    {["पुरवठा", "न्यायालयीन", "महसूल", "देयक", "प्रमाणपत्रे"].map(
                      (item, index) => (
                        <ListItem 
                          key={index} 
                          disablePadding
                          sx={{
                            py: 0.75,
                            borderBottom: index < 4 ? '1px solid #e0e0e0' : 'none',
                            '&:hover': {
                              backgroundColor: '#e3f2fd',
                              borderRadius: 1,
                            }
                          }}
                        >
                          <Link
                            href="https://aaplesarkar.maharashtra.gov.in/en/"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                              color: "#1976d2", 
                              textDecoration: "none",
                              fontWeight: 600,
                              fontFamily: '"Roboto", "Arial", sans-serif',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              width: '100%',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: '#1565c0',
                                transform: 'translateX(4px)',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: '#1976d2',
                                flexShrink: 0
                              }}
                            />
                            {item}
                          </Link>
                        </ListItem>
                      )
                    )}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Second Section - Light Background */}
      <Box
        sx={{
          width: "100%",
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Weekly Markets */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "white",
                  color: "#212121",
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                    borderColor: '#1976d2',
                  }
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2.5,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h6"} 
                    fontWeight="bold" 
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      mb: 0.5
                    }}
                  >
                    आठवडे बाजार
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.8rem'
                    }}
                  >
                    Weekly Markets
                  </Typography>
                </Box>
                {weeklyMarkets.length > 0 ? (
                  <List dense>
                    {weeklyMarkets.map((market, index) => (
                      <ListItem 
                        key={market.id || index} 
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < weeklyMarkets.length - 1 ? '1px solid #e0e0e0' : 'none',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                          }
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontWeight: 700,
                              color: '#1976d2',
                              fontFamily: '"Roboto", "Arial", sans-serif',
                              mb: 0.5
                            }}
                          >
                            {market.day}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{
                              color: '#616161',
                              fontFamily: '"Roboto", "Arial", sans-serif',
                              fontSize: '0.8rem',
                              display: 'block',
                              lineHeight: 1.4
                            }}
                          >
                            {market.address}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    py: 3,
                    textAlign: 'center'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: '#9e9e9e',
                        fontFamily: '"Roboto", "Arial", sans-serif'
                      }}
                    >
                      कोणतेही बाजार उपलब्ध नाहीत
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Tourism Places */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "white",
                  color: "#212121",
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                    borderColor: '#1976d2',
                  }
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2.5,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h6"} 
                    fontWeight="bold" 
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      mb: 0.5
                    }}
                  >
                    पर्यटन स्थळे
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.8rem'
                    }}
                  >
                    Tourist Places
                  </Typography>
                </Box>
                {tourismPlaces.length > 0 ? (
                  <List dense>
                    {tourismPlaces.map((place, index) => (
                      <ListItem 
                        key={place.id || index} 
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < tourismPlaces.length - 1 ? '1px solid #e0e0e0' : 'none',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Box
                            sx={{
                              minWidth: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#1976d2',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontWeight: 600,
                              color: '#424242',
                              fontFamily: '"Roboto", "Arial", sans-serif',
                              flex: 1
                            }}
                          >
                            {place.name}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    py: 3,
                    textAlign: 'center'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: '#9e9e9e',
                        fontFamily: '"Roboto", "Arial", sans-serif'
                      }}
                    >
                      कोणतीही पर्यटन स्थळे उपलब्ध नाहीत
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* How to Reach */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "white",
                  color: "#212121",
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                    borderColor: '#1976d2',
                  }
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2.5,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h6"} 
                    fontWeight="bold" 
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      mb: 0.5
                    }}
                  >
                    कसे पोहोचाल ?
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.8rem'
                    }}
                  >
                    How to Reach
                  </Typography>
                </Box>
                {howToReach.length > 0 ? (
                  <List dense>
                    {howToReach.map((method, index) => (
                      <ListItem 
                        key={method.id || index} 
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < howToReach.length - 1 ? '1px solid #e0e0e0' : 'none',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Box
                            sx={{
                              minWidth: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#1976d2',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontWeight: 600,
                              color: '#424242',
                              fontFamily: '"Roboto", "Arial", sans-serif',
                              flex: 1
                            }}
                          >
                            {method.method}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <List dense>
                    {["रस्त्याद्वारे", "रेल्वेने", "हवाई मार्ग"].map((item, index) => (
                      <ListItem 
                        key={index} 
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < 2 ? '1px solid #e0e0e0' : 'none',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Box
                            sx={{
                              minWidth: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#1976d2',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontWeight: 600,
                              color: '#424242',
                              fontFamily: '"Roboto", "Arial", sans-serif',
                              flex: 1
                            }}
                          >
                            {item}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/* Healthy Habits */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "white",
                  color: "#212121",
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                    borderColor: '#1976d2',
                  }
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 2.5,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h6"} 
                    fontWeight="bold" 
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      mb: 0.5
                    }}
                  >
                    निरोगी आरोग्य सवयी
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.8rem'
                    }}
                  >
                    Healthy Habits
                  </Typography>
                </Box>
                {healthyHabits.length > 0 ? (
                  <List dense>
                    {healthyHabits.map((habit, index) => (
                      <ListItem 
                        key={habit.id || index} 
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < healthyHabits.length - 1 ? '1px solid #e0e0e0' : 'none',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Box
                            sx={{
                              minWidth: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#4caf50',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            ✓
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontWeight: 600,
                              color: '#424242',
                              fontFamily: '"Roboto", "Arial", sans-serif',
                              flex: 1
                            }}
                          >
                            {habit.habitName}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <List dense>
                    {["नियमित व्यायाम", "संतुलित आहार", "पुरेसा झोप"].map((item, index) => (
                      <ListItem 
                        key={index} 
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < 2 ? '1px solid #e0e0e0' : 'none',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Box
                            sx={{
                              minWidth: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#4caf50',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            ✓
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontWeight: 600,
                              color: '#424242',
                              fontFamily: '"Roboto", "Arial", sans-serif',
                              flex: 1
                            }}
                          >
                            {item}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Gallery + Map Section - Below Blue */}
      <Box sx={{ 
        width: "100%", 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        py: { xs: 4, md: 6 }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Photo Gallery */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: 3,
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                    borderColor: '#1976d2',
                  }
                }}
              >
                {/* Header */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    fontWeight="bold"
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      mb: 1
                    }}
                  >
                    छायाचित्र दालन
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.85rem'
                    }}
                  >
                    Photo Gallery
                  </Typography>
                </Box>

                {/* Gallery Slider */}
                {galleryImages.length > 0 ? (
                  <Box sx={{ 
                    position: 'relative',
                    mb: 5
                  }}>
                    <Slider {...sliderSettings}>
                      {galleryImages.map((image, index) => (
                        <Box 
                          key={image.id || index} 
                          sx={{ 
                            height: { xs: 250, md: 320 },
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          }}
                        >
                          <img
                            src={image.url}
                            alt={`ग्रामपंचायत छायाचित्र ${index + 1}`}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 8,
                              transition: 'transform 0.3s ease',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                            }}
                          />
                          {/* Image Counter Overlay */}
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 12,
                              right: 12,
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            {index + 1} / {galleryImages.length}
                          </Box>
                        </Box>
                      ))}
                    </Slider>
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: { xs: 250, md: 320 }, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    border: '2px dashed #e0e0e0'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#9e9e9e',
                        mb: 1,
                        fontFamily: '"Roboto", "Arial", sans-serif'
                      }}
                    >
                      कोणतीही छायाचित्रे उपलब्ध नाहीत
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#bdbdbd',
                        fontSize: '0.85rem'
                      }}
                    >
                      No photos available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Map */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: 3,
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                    borderColor: '#1976d2',
                  }
                }}
              >
                {/* Header */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: '3px solid #FFD700'
                }}>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    fontWeight="bold"
                    sx={{
                      color: '#1976d2',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      mb: 1
                    }}
                  >
                    नकाशा
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontFamily: '"Roboto", "Arial", sans-serif',
                      fontSize: '0.85rem'
                    }}
                  >
                    Location Map
                  </Typography>
                </Box>

                {/* Map Container */}
                <Box sx={{ 
                  width: "100%", 
                  height: { xs: 250, md: 320 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#1976d2',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.2)',
                  }
                }}>
                  {mapUrl ? (
                    <iframe
                      title="ग्रामपंचायत नकाशा"
                      width="100%"
                      height="100%"
                      style={{ 
                        border: 0, 
                        borderRadius: 8,
                        display: 'block'
                      }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={mapUrl}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <CircularProgress sx={{ color: '#1976d2', mb: 2 }} size={40} />
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#757575',
                          fontFamily: '"Roboto", "Arial", sans-serif',
                          fontWeight: 500
                        }}
                      >
                        नकाशा लोड होत आहे...
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#bdbdbd',
                          mt: 0.5,
                          fontSize: '0.8rem'
                        }}
                      >
                        Loading Map...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Custom Styles for Slider */}
      <style>{`
        .slick-dots {
          bottom: -45px !important;
        }
        .slick-dots li button:before {
          font-size: 12px !important;
          color: #1976d2 !important;
          opacity: 0.4 !important;
        }
        .slick-dots li.slick-active button:before {
          color: #1976d2 !important;
          opacity: 1 !important;
        }
        .slick-dots li button:hover:before {
          color: #42a5f5 !important;
          opacity: 0.8 !important;
        }
        .slick-prev,
        .slick-next {
          z-index: 3 !important;
        }
        @media (max-width: 768px) {
          .slick-prev {
            left: -25px !important;
          }
          .slick-next {
            right: -25px !important;
          }
        }
      `}</style>
    </>
  );
};

export default GrampanchayatInfo;