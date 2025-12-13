import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Info,
  AccountBalance,
  Store,
  Place,
  PhotoLibrary,
  Computer,
  Directions,
  HealthAndSafety,
} from '@mui/icons-material';
import { db } from '../../../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

const ManageHomeInfo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState('');
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for different data types
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

  // Form data for editing
  const [formData, setFormData] = useState({
    day: '',
    address: '',
    name: '',
    url: '',
    order: 0,
    serviceName: '',
    serviceUrl: '',
    habitName: '',
    habitDescription: '',
  });

  // Debug function to test Firestore connection
  const testFirestoreConnection = async () => {
    try {
      console.log('Testing Firestore connection...');
      const testDoc = await getDoc(doc(db, "test", "connection"));
      console.log('Firestore connection successful');
      return true;
    } catch (error) {
      console.error('Firestore connection failed:', error);
      return false;
    }
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Test Firestore connection first
      const isConnected = await testFirestoreConnection();
      if (!isConnected) {
        throw new Error('Firestore connection failed');
      }

      // Fetch overview and bank details from main document
      try {
        const mainDoc = await getDoc(doc(db, "home", "grampanchayat-info"));
        if (mainDoc.exists()) {
          const data = mainDoc.data();
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
          setBankDetails({
            name: data.bankName || '',
            accountNumber: data.accountNumber || '',
            IFSC: data.IFSC || '',
            address: data.bankAddress || '',
          });
        }
      } catch (mainDocError) {
        console.error('Error fetching main document:', mainDocError);
        setOverview({
          area: '',
          population: '',
          literacy: '',
          schools: '',
          banks: '',
          hospitals: '',
          toilets: '',
          postOffice: '',
        });
        setBankDetails({
          name: '',
          accountNumber: '',
          IFSC: '',
          address: '',
        });
      }

      // Fetch weekly markets
      try {
        const marketsSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "weeklyMarkets"));
        const marketsData = marketsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by day locally
        marketsData.sort((a, b) => (a.day || '').localeCompare(b.day || ''));
        setWeeklyMarkets(marketsData);
      } catch (marketsError) {
        console.error('Error fetching markets:', marketsError);
        setWeeklyMarkets([]);
      }

      // Fetch tourism places
      try {
        const tourismSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "tourism"));
        const tourismData = tourismSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by name locally
        tourismData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setTourismPlaces(tourismData);
      } catch (tourismError) {
        console.error('Error fetching tourism places:', tourismError);
        setTourismPlaces([]);
      }

      // Fetch gallery images
      try {
        const gallerySnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "gallery"));
        const galleryData = gallerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by order locally
        galleryData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setGalleryImages(galleryData);
      } catch (galleryError) {
        console.error('Error fetching gallery images:', galleryError);
        setGalleryImages([]);
      }

      // Fetch E-Services
      try {
        const eServicesSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "eServices"));
        const eServicesData = eServicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by order locally
        eServicesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setEServices(eServicesData);
      } catch (eServicesError) {
        console.error('Error fetching E-Services:', eServicesError);
        setEServices([]);
      }

      // Fetch How to Reach
      try {
        const howToReachSnapshot = await getDocs(collection(db, "home", "grampanchayat-info", "howToReach"));
        const howToReachData = howToReachSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by order locally
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
        // Sort by order locally
        healthyHabitsData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setHealthyHabits(healthyHabitsData);
      } catch (healthyHabitsError) {
        console.error('Error fetching Healthy Habits:', healthyHabitsError);
        setHealthyHabits([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setNotification({
        open: true,
        message: 'माहिती आणण्यात त्रुटी आली',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type, item = null) => {
    setEditingType(type);
    setEditingItem(item);
    
    if (item) {
      setFormData({
        day: item.day || '',
        address: item.address || '',
        name: item.name || '',
        url: item.url || '',
        order: item.order || 0,
        serviceName: item.serviceName || '',
        serviceUrl: item.serviceUrl || '',
        habitName: item.habitName || '',
        habitDescription: item.habitDescription || '',
      });
    } else {
      setFormData({
        day: '',
        address: '',
        name: '',
        url: '',
        order: 0,
        serviceName: '',
        serviceUrl: '',
        habitName: '',
        habitDescription: '',
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingItem(null);
    setEditingType('');
    setFormData({
      day: '',
      address: '',
      name: '',
      url: '',
      order: 0,
      serviceName: '',
      serviceUrl: '',
      habitName: '',
      habitDescription: '',
    });
  };

  const handleSaveOverview = async () => {
    setSaving(true);
    try {
      console.log('Saving overview data:', overview);
      
      const overviewData = {
        area: overview.area || '',
        population: overview.population || '',
        literacy: overview.literacy || '',
        schools: overview.schools || '',
        banks: overview.banks || '',
        hospitals: overview.hospitals || '',
        toilets: overview.toilets || '',
        postOffice: overview.postOffice || '',
        updatedAt: new Date(),
      };
      
      console.log('Overview data to save:', overviewData);
      
      await setDoc(doc(db, "home", "grampanchayat-info"), overviewData, { merge: true });
      
      console.log('Overview saved successfully');
      
      setNotification({
        open: true,
        message: 'ओव्हरव्ह्यू माहिती यशस्वीरित्या सेव्ह झाली',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving overview:', error);
      setNotification({
        open: true,
        message: `माहिती सेव्ह करण्यात त्रुटी आली: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBankDetails = async () => {
    setSaving(true);
    try {
      const bankData = {
        bankName: bankDetails.name || '',
        accountNumber: bankDetails.accountNumber || '',
        IFSC: bankDetails.IFSC || '',
        bankAddress: bankDetails.address || '',
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, "home", "grampanchayat-info"), bankData, { merge: true });
      setNotification({
        open: true,
        message: 'बँक माहिती यशस्वीरित्या सेव्ह झाली',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving bank details:', error);
      setNotification({
        open: true,
        message: `माहिती सेव्ह करण्यात त्रुटी आली: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItem = async () => {
    setSaving(true);
    try {
      if (editingType === 'markets') {
        const marketData = {
          day: formData.day || '',
          address: formData.address || '',
          updatedAt: new Date(),
        };
        
        if (editingItem) {
          // Update existing market
          await setDoc(doc(db, "home", "grampanchayat-info", "weeklyMarkets", editingItem.id), marketData);
        } else {
          // Add new market
          marketData.createdAt = new Date();
          await addDoc(collection(db, "home", "grampanchayat-info", "weeklyMarkets"), marketData);
        }
      } else if (editingType === 'tourism') {
        const tourismData = {
          name: formData.name || '',
          updatedAt: new Date(),
        };
        
        if (editingItem) {
          // Update existing tourism place
          await setDoc(doc(db, "home", "grampanchayat-info", "tourism", editingItem.id), tourismData);
        } else {
          // Add new tourism place
          tourismData.createdAt = new Date();
          await addDoc(collection(db, "home", "grampanchayat-info", "tourism"), tourismData);
        }
      } else if (editingType === 'gallery') {
        const galleryData = {
          url: formData.url || '',
          order: parseInt(formData.order) || 0,
          updatedAt: new Date(),
        };
        
        if (editingItem) {
          // Update existing gallery image
          await setDoc(doc(db, "home", "grampanchayat-info", "gallery", editingItem.id), galleryData);
        } else {
          // Add new gallery image
          galleryData.createdAt = new Date();
          await addDoc(collection(db, "home", "grampanchayat-info", "gallery"), galleryData);
        }
      } else if (editingType === 'eServices') {
        const eServiceData = {
          serviceName: formData.serviceName || '',
          serviceUrl: formData.serviceUrl || '',
          order: parseInt(formData.order) || 0,
          updatedAt: new Date(),
        };
        
        if (editingItem) {
          // Update existing E-Service
          await setDoc(doc(db, "home", "grampanchayat-info", "eServices", editingItem.id), eServiceData);
        } else {
          // Add new E-Service
          eServiceData.createdAt = new Date();
          await addDoc(collection(db, "home", "grampanchayat-info", "eServices"), eServiceData);
        }
      } else if (editingType === 'howToReach') {
        const howToReachData = {
          method: formData.habitName || '',
          description: formData.habitDescription || '',
          order: parseInt(formData.order) || 0,
          updatedAt: new Date(),
        };
        
        if (editingItem) {
          // Update existing How to Reach
          await setDoc(doc(db, "home", "grampanchayat-info", "howToReach", editingItem.id), howToReachData);
        } else {
          // Add new How to Reach
          howToReachData.createdAt = new Date();
          await addDoc(collection(db, "home", "grampanchayat-info", "howToReach"), howToReachData);
        }
      } else if (editingType === 'healthyHabits') {
        const healthyHabitData = {
          habitName: formData.habitName || '',
          habitDescription: formData.habitDescription || '',
          order: parseInt(formData.order) || 0,
          updatedAt: new Date(),
        };
        
        if (editingItem) {
          // Update existing Healthy Habit
          await setDoc(doc(db, "home", "grampanchayat-info", "healthyHabits", editingItem.id), healthyHabitData);
        } else {
          // Add new Healthy Habit
          healthyHabitData.createdAt = new Date();
          await addDoc(collection(db, "home", "grampanchayat-info", "healthyHabits"), healthyHabitData);
        }
      }

      setNotification({
        open: true,
        message: 'माहिती यशस्वीरित्या सेव्ह झाली',
        severity: 'success',
      });

      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving item:', error);
      setNotification({
        open: true,
        message: `माहिती सेव्ह करण्यात त्रुटी आली: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('तुम्हाला खात्री आहे? ही क्रिया पूर्ववत केली जाऊ शकत नाही.')) {
      try {
        let collectionName = '';
        if (type === 'markets') collectionName = 'weeklyMarkets';
        else if (type === 'tourism') collectionName = 'tourism';
        else if (type === 'gallery') collectionName = 'gallery';
        else if (type === 'eServices') collectionName = 'eServices';
        else if (type === 'howToReach') collectionName = 'howToReach';
        else if (type === 'healthyHabits') collectionName = 'healthyHabits';

        await deleteDoc(doc(db, "home", "grampanchayat-info", collectionName, id));
        setNotification({
          open: true,
          message: 'माहिती हटवली गेली',
          severity: 'success',
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
        setNotification({
          open: true,
          message: 'माहिती हटवण्यात त्रुटी आली',
          severity: 'error',
        });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        ग्रामपंचायत माहिती व्यवस्थापन
      </Typography>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab icon={<Info />} label="ओव्हरव्ह्यू" />
          <Tab icon={<AccountBalance />} label="बँक माहिती" />
          <Tab icon={<Store />} label="आठवडे बाजार" />
          <Tab icon={<Place />} label="पर्यटन स्थळे" />
          <Tab icon={<PhotoLibrary />} label="गॅलरी" />
          <Tab icon={<Computer />} label="ई-सेवा" />
          <Tab icon={<Directions />} label="कसे पोहोचाल" />
          <Tab icon={<HealthAndSafety />} label="निरोगी आरोग्य सवयी" />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
            ग्रामपंचायत ओव्हरव्ह्यू
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="क्षेत्र (sq km)"
                fullWidth
                value={overview.area}
                onChange={(e) => setOverview({ ...overview, area: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="लोकसंख्या"
                fullWidth
                value={overview.population}
                onChange={(e) => setOverview({ ...overview, population: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="साक्षरतेचे प्रमाण"
                fullWidth
                value={overview.literacy}
                onChange={(e) => setOverview({ ...overview, literacy: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="शाळा"
                fullWidth
                value={overview.schools}
                onChange={(e) => setOverview({ ...overview, schools: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="बँक"
                fullWidth
                value={overview.banks}
                onChange={(e) => setOverview({ ...overview, banks: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="रुग्णालये"
                fullWidth
                value={overview.hospitals}
                onChange={(e) => setOverview({ ...overview, hospitals: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="स्वच्छतागृहे"
                fullWidth
                value={overview.toilets}
                onChange={(e) => setOverview({ ...overview, toilets: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="पोस्ट ऑफिस"
                fullWidth
                value={overview.postOffice}
                onChange={(e) => setOverview({ ...overview, postOffice: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleSaveOverview}
              disabled={saving}
              startIcon={<Save />}
            >
              {saving ? 'सेव्ह होत आहे...' : 'ओव्हरव्ह्यू सेव्ह करा'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Bank Details Tab */}
      {activeTab === 1 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
            बँक माहिती
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="बँकेचे नाव"
                fullWidth
                value={bankDetails.name}
                onChange={(e) => setBankDetails({ ...bankDetails, name: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="बँक खाते क्रमांक"
                fullWidth
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="IFSC कोड"
                fullWidth
                value={bankDetails.IFSC}
                onChange={(e) => setBankDetails({ ...bankDetails, IFSC: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="बँकेचा पत्ता"
                fullWidth
                multiline
                rows={3}
                value={bankDetails.address}
                onChange={(e) => setBankDetails({ ...bankDetails, address: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleSaveBankDetails}
              disabled={saving}
              startIcon={<Save />}
            >
              {saving ? 'सेव्ह होत आहे...' : 'बँक माहिती सेव्ह करा'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Weekly Markets Tab */}
      {activeTab === 2 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              आठवडे बाजार
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog('markets')}
            >
              नवीन बाजार जोडा
            </Button>
          </Box>
          <List>
            {weeklyMarkets.map((market) => (
              <ListItem key={market.id} divider>
                <ListItemText
                  primary={market.day}
                  secondary={market.address}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleOpenDialog('markets', market)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('markets', market.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {weeklyMarkets.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                कोणतेही बाजार जोडलेले नाहीत
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* Tourism Places Tab */}
      {activeTab === 3 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              पर्यटन स्थळे
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog('tourism')}
            >
              नवीन स्थळ जोडा
            </Button>
          </Box>
          <List>
            {tourismPlaces.map((place) => (
              <ListItem key={place.id} divider>
                <ListItemText primary={place.name} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleOpenDialog('tourism', place)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('tourism', place.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {tourismPlaces.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                कोणतेही पर्यटन स्थळ जोडलेले नाहीत
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* Gallery Tab */}
      {activeTab === 4 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              गॅलरी छायाचित्रे
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog('gallery')}
            >
              नवीन छायाचित्र जोडा
            </Button>
          </Box>
          <List>
            {galleryImages.map((image) => (
              <ListItem key={image.id} divider>
                <ListItemText
                  primary={`छायाचित्र ${image.order}`}
                  secondary={image.url}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleOpenDialog('gallery', image)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('gallery', image.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {galleryImages.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                कोणतीही छायाचित्रे जोडलेली नाहीत
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* E-Services Tab */}
      {activeTab === 5 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              ई-सेवा व्यवस्थापन
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog('eServices')}
            >
              नवीन ई-सेवा जोडा
            </Button>
          </Box>
          <List>
            {eServices.map((service) => (
              <ListItem key={service.id} divider>
                <ListItemText
                  primary={service.serviceName}
                  secondary={service.serviceUrl}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleOpenDialog('eServices', service)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('eServices', service.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {eServices.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                कोणतीही ई-सेवा जोडलेली नाहीत
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* How to Reach Tab */}
      {activeTab === 6 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              कसे पोहोचाल व्यवस्थापन
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog('howToReach')}
            >
              नवीन मार्ग जोडा
            </Button>
          </Box>
          <List>
            {howToReach.map((method) => (
              <ListItem key={method.id} divider>
                <ListItemText
                  primary={method.method}
                  secondary={method.description}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleOpenDialog('howToReach', method)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('howToReach', method.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {howToReach.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                कोणतेही मार्ग जोडलेले नाहीत
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* Healthy Habits Tab */}
      {activeTab === 7 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              निरोगी आरोग्य सवयी व्यवस्थापन
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog('healthyHabits')}
            >
              नवीन सवय जोडा
            </Button>
          </Box>
          <List>
            {healthyHabits.map((habit) => (
              <ListItem key={habit.id} divider>
                <ListItemText
                  primary={habit.habitName}
                  secondary={habit.habitDescription}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleOpenDialog('healthyHabits', habit)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('healthyHabits', habit.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {healthyHabits.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                कोणतीही सवयी जोडलेल्या नाहीत
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingItem ? 'संपादित करा' : 'नवीन जोडा'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {editingType === 'markets' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="वार"
                    fullWidth
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    placeholder="उदा: सोमवार"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="पत्ता"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="बाजाराचा पत्ता"
                  />
                </Grid>
              </>
            )}

            {editingType === 'tourism' && (
              <Grid item xs={12}>
                <TextField
                  label="पर्यटन स्थळाचे नाव"
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="पर्यटन स्थळाचे नाव"
                />
              </Grid>
            )}

            {editingType === 'gallery' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="छायाचित्र URL"
                    fullWidth
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="क्रम"
                    type="number"
                    fullWidth
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="छायाचित्राचा क्रम"
                  />
                </Grid>
              </>
            )}

            {editingType === 'eServices' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="सेवेचे नाव"
                    fullWidth
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    placeholder="उदा: पुरवठा, न्यायालयीन, महसूल"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="सेवा URL"
                    fullWidth
                    value={formData.serviceUrl}
                    onChange={(e) => setFormData({ ...formData, serviceUrl: e.target.value })}
                    placeholder="https://aaplesarkar.maharashtra.gov.in/en/"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="क्रम"
                    type="number"
                    fullWidth
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="सेवेचा क्रम"
                  />
                </Grid>
              </>
            )}

            {editingType === 'howToReach' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="मार्गाचे नाव"
                    fullWidth
                    value={formData.habitName}
                    onChange={(e) => setFormData({ ...formData, habitName: e.target.value })}
                    placeholder="उदा: रस्त्याद्वारे, रेल्वेने, हवाई मार्ग"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="वर्णन"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.habitDescription}
                    onChange={(e) => setFormData({ ...formData, habitDescription: e.target.value })}
                    placeholder="मार्गाचे तपशील"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="क्रम"
                    type="number"
                    fullWidth
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="मार्गाचा क्रम"
                  />
                </Grid>
              </>
            )}

            {editingType === 'healthyHabits' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="सवयीचे नाव"
                    fullWidth
                    value={formData.habitName}
                    onChange={(e) => setFormData({ ...formData, habitName: e.target.value })}
                    placeholder="उदा: नियमित व्यायाम, संतुलित आहार"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="वर्णन"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.habitDescription}
                    onChange={(e) => setFormData({ ...formData, habitDescription: e.target.value })}
                    placeholder="सवयीचे तपशील"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="क्रम"
                    type="number"
                    fullWidth
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="सवयीचा क्रम"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<Cancel />}
            disabled={saving}
          >
            रद्द करा
          </Button>
          <Button 
            onClick={handleSaveItem} 
            variant="contained" 
            startIcon={<Save />}
            disabled={saving}
          >
            {saving ? 'सेव्ह होत आहे...' : 'सेव्ह करा'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageHomeInfo;



