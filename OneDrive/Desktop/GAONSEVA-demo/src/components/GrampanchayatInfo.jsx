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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: true,
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
      {/* First Section - Pink Background */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "rgba(250, 0, 87, 1)",
          color: "white",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {/* Column 1 - ग्रामपंचायत */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  दृष्टीक्षेपात ग्रामपंचायत
                </Typography>
                <List dense>
                  <ListItem disablePadding>क्षेत्र: {overview.area || '___'} sq km</ListItem>
                  <ListItem disablePadding>लोकसंख्या: {overview.population || '______'}</ListItem>
                  <ListItem disablePadding>साक्षरतेचे प्रमाण: {overview.literacy || '__'}</ListItem>
                  <ListItem disablePadding>शाळा: {overview.schools || '______'}</ListItem>
                  <ListItem disablePadding>बँक: {overview.banks || '______'}</ListItem>
                  <ListItem disablePadding>रुग्णालये: {overview.hospitals || '______'}</ListItem>
                  <ListItem disablePadding>स्वच्छतागृहे: {overview.toilets || '______'}</ListItem>
                  <ListItem disablePadding>पोस्ट ऑफिस: {overview.postOffice || '______'}</ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Column 2 - बँक तपशील */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ग्रामपंचायत बँक तपशील
                </Typography>
                <List dense>
                  <ListItem disablePadding>बँकेचे नाव: {bankDetails.name || '______'}</ListItem>
                  <ListItem disablePadding>
                    बँक खाते क्रमांक: {bankDetails.accountNumber || '______'}
                  </ListItem>
                  <ListItem disablePadding>IFSC कोड: {bankDetails.IFSC || '______'}</ListItem>
                  <ListItem disablePadding>बँकेचा पत्ता: {bankDetails.address || '______'}</ListItem>
                </List>
                <Typography mt={2} fontWeight="bold">
                  जिल्ह्याचे संकेतस्थळ
                </Typography>
              </Paper>
            </Grid>

            {/* Column 3 - ई-सेवा */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ई-सेवा
                </Typography>
                {console.log('E-Services in render:', eServices)}
                {eServices.length > 0 ? (
                  <List dense>
                    {eServices.map((service, index) => (
                      <ListItem key={service.id || index} disablePadding>
                        <Link
                          href={service.serviceUrl || "https://aaplesarkar.maharashtra.gov.in/en/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: "white", textDecoration: "none" }}
                        >
                          {service.serviceName}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <List dense>
                    {["पुरवठा", "न्यायालयीन", "महसूल", "देयक", "प्रमाणपत्रे"].map(
                      (item, index) => (
                        <ListItem key={index} disablePadding>
                          <Link
                            href="https://aaplesarkar.maharashtra.gov.in/en/"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: "white", textDecoration: "none" }}
                          >
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

      {/* Second Section - Blue Background */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "rgba(30, 129, 175, 1)",
          color: "white",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {/* आठवडे बाजार */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  आठवडे बाजार
                </Typography>
                {weeklyMarkets.length > 0 ? (
                  <List dense>
                    {weeklyMarkets.map((market, index) => (
                      <ListItem key={market.id || index} disablePadding>
                        <Typography variant="body2">
                          {market.day} | {market.address}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2">कोणतेही बाजार उपलब्ध नाहीत</Typography>
                )}
              </Paper>
            </Grid>

            {/* पर्यटन स्थळे */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  पर्यटन स्थळे
                </Typography>
                {tourismPlaces.length > 0 ? (
                  <List dense>
                    {tourismPlaces.map((place, index) => (
                      <ListItem key={place.id || index} disablePadding>
                        <Typography variant="body2">
                          {index + 1}. {place.name}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2">कोणतीही पर्यटन स्थळे उपलब्ध नाहीत</Typography>
                )}
              </Paper>
            </Grid>

            {/* कसे पोहोचाल ? */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  कसे पोहोचाल ?
                </Typography>
                {howToReach.length > 0 ? (
                  <List dense>
                    {howToReach.map((method, index) => (
                      <ListItem key={method.id || index} disablePadding>
                        <Typography variant="body2">
                          {index + 1}) {method.method}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <List dense>
                    <ListItem disablePadding>१) रस्त्याद्वारे</ListItem>
                    <ListItem disablePadding>२) रेल्वेने</ListItem>
                    <ListItem disablePadding>३) हवाई मार्ग</ListItem>
                  </List>
                )}
              </Paper>
            </Grid>

            {/* निरोगी आरोग्य सवयी */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  निरोगी आरोग्य सवयी
                </Typography>
                {healthyHabits.length > 0 ? (
                  <List dense>
                    {healthyHabits.map((habit, index) => (
                      <ListItem key={habit.id || index} disablePadding>
                        <Typography variant="body2">
                          {index + 1}) {habit.habitName}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <List dense>
                    <ListItem disablePadding>१) नियमित व्यायाम</ListItem>
                    <ListItem disablePadding>२) संतुलित आहार</ListItem>
                    <ListItem disablePadding>३) पुरेसा झोप</ListItem>
                    <ListItem disablePadding>४) ताण व्यवस्थापन</ListItem>
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Gallery + Map Section - Below Blue */}
      <Box sx={{ width: "100%", bgcolor: "#f9f9f9", py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {/* Slider */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  textAlign="center"
                >
                  छायाचित्र दालन
                </Typography>
                {galleryImages.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {galleryImages.map((image, index) => (
                      <Box key={image.id || index} sx={{ height: 300 }}>
                        <img
                          src={image.url}
                          alt={`ग्रामपंचायत छायाचित्र ${index + 1}`}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </Box>
                    ))}
                  </Slider>
                ) : (
                  <Box sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    borderRadius: 2
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      कोणतीही छायाचित्रे उपलब्ध नाहीत
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Map */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  textAlign="center"
                >
                  नकाशा
                </Typography>
                <Box sx={{ width: "100%", height: 300 }}>
                  {mapUrl ? (
                    <iframe
                      title="ग्रामपंचायत नकाशा"
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: 8 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={mapUrl}
                    ></iframe>
                  ) : (
                    <Box sx={{ 
                      height: 300, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        नकाशा लोड होत आहे...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default GrampanchayatInfo;