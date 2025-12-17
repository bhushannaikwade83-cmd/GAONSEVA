import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ThemeProvider,
  createTheme,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Search,
  Description,
  Schedule,
  CheckCircle,
  Cancel,
  Send,
  Warning,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ea580c',
      light: '#fb923c',
      dark: '#c2410c',
    },
    secondary: {
      main: '#16a34a',
      light: '#22c55e',
      dark: '#15803d',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

export default function TakrarNondani() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    subject: '',
    description: '',
    address: ''
  });
  const [trackingId, setTrackingId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [trackedComplaint, setTrackedComplaint] = useState(null);

  const complaintsRef = collection(db, 'complaints');

  const categories = [
    'पाणी पुरवठा',
    'रस्ते व पायाभूत सुविधा',
    'रस्त्यावरील दिवे',
    'गटार व स्वच्छता',
    'कचरा संकलन',
    'सार्वजनिक मालमत्ता',
    'मनरेगा',
    'जन्म/मृत्यू प्रमाणपत्र',
    'इतर'
  ];

  // Generate tracking ID
  const generateTrackingId = () => {
    const prefix = 'GP';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${year}${random}`;
  };

  // Fetch all complaints for public view
  useEffect(() => {
    const fetchComplaints = async () => {
      if (activeTab === 2) {
        setLoading(true);
        try {
          const q = query(complaintsRef, orderBy('createdAt', 'desc'), limit(50));
          const snapshot = await getDocs(q);
          const complaintsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            trackingId: doc.data().trackingId || doc.id,
            name: doc.data().name || '',
            category: doc.data().category || '',
            subject: doc.data().subject || '',
            description: doc.data().description || '',
            status: doc.data().status || 'Pending',
            priority: doc.data().priority || 'Medium',
            createdAt: doc.data().createdAt,
            date: doc.data().createdAt?.toDate 
              ? doc.data().createdAt.toDate().toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
          }));
          setComplaints(complaintsData);
        } catch (error) {
          console.error('Error fetching complaints:', error);
          setSnackbar({
            open: true,
            message: 'तक्रारी लोड करताना त्रुटी आली',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchComplaints();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.category || !formData.subject || !formData.description) {
      setSnackbar({
        open: true,
        message: 'कृपया सर्व आवश्यक माहिती भरा',
        severity: 'warning'
      });
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setSnackbar({
        open: true,
        message: 'कृपया १० अंकी मोबाईल नंबर टाका',
        severity: 'warning'
      });
      return;
    }

    setSubmitting(true);
    try {
      const newTrackingId = generateTrackingId();
      
      const complaintData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || '',
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        address: formData.address || '',
        status: 'Pending',
        priority: 'Medium',
        trackingId: newTrackingId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(complaintsRef, complaintData);
      
      setTrackingId(newTrackingId);
      setSubmitted(true);
      setSnackbar({
        open: true,
        message: 'तक्रार यशस्वीरित्या नोंदवली गेली!',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: '',
        subject: '',
        description: '',
        address: ''
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSnackbar({
        open: true,
        message: 'तक्रार नोंदवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status) => {
    const statusValue = typeof status === 'string' && status.includes('प्रलंबित') ? 'Pending' :
                        typeof status === 'string' && status.includes('प्रगतीपथावर') ? 'In Progress' :
                        typeof status === 'string' && status.includes('निराकरण') ? 'Resolved' :
                        typeof status === 'string' && status.includes('नाकारले') ? 'Rejected' : status;
    
    switch(statusValue) {
      case 'Pending':
      case 'प्रलंबित': return 'warning';
      case 'In Progress':
      case 'प्रगतीपथावर': return 'info';
      case 'Resolved':
      case 'निराकरण झाले': return 'success';
      case 'Rejected':
      case 'नाकारले': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    const priorityValue = typeof priority === 'string' && priority.includes('उच्च') ? 'High' :
                          typeof priority === 'string' && priority.includes('मध्यम') ? 'Medium' :
                          typeof priority === 'string' && priority.includes('कमी') ? 'Low' : priority;
    
    switch(priorityValue) {
      case 'High':
      case 'उच्च': return 'error';
      case 'Medium':
      case 'मध्यम': return 'warning';
      case 'Low':
      case 'कमी': return 'success';
      default: return 'default';
    }
  };

  const trackComplaint = async () => {
    if (!searchId.trim()) {
      setSnackbar({
        open: true,
        message: 'कृपया ट्रॅकिंग आयडी टाका',
        severity: 'warning'
      });
      return;
    }

    setTrackingLoading(true);
    try {
      const q = query(complaintsRef, where('trackingId', '==', searchId.toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        const complaint = {
          id: doc.id,
          trackingId: data.trackingId || doc.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          category: data.category || '',
          subject: data.subject || '',
          description: data.description || '',
          address: data.address || '',
          status: data.status || 'Pending',
          priority: data.priority || 'Medium',
          createdAt: data.createdAt,
          date: data.createdAt?.toDate 
            ? data.createdAt.toDate().toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        };
        setTrackedComplaint(complaint);
        setTrackingId(searchId.toUpperCase());
        setActiveTab(1);
      } else {
        setTrackedComplaint(null);
        setSnackbar({
          open: true,
          message: 'तक्रार आयडी सापडला नाही. कृपया तपासून पुन्हा प्रयत्न करा.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error tracking complaint:', error);
      setSnackbar({
        open: true,
        message: 'तक्रार शोधताना त्रुटी आली',
        severity: 'error'
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  // Map English status to Marathi
  const getMarathiStatus = (status) => {
    const statusMap = {
      'Pending': 'प्रलंबित',
      'In Progress': 'प्रगतीपथावर',
      'Resolved': 'निराकरण झाले',
      'Rejected': 'नाकारले'
    };
    return statusMap[status] || status;
  };

  // Map English priority to Marathi
  const getMarathiPriority = (priority) => {
    const priorityMap = {
      'Low': 'कमी',
      'Medium': 'मध्यम',
      'High': 'उच्च'
    };
    return priorityMap[priority] || priority;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff5f0' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #ea580c 0%, #16a34a 100%)',
            color: 'white',
            py: { xs: 4, sm: 5, md: 6 },
            px: { xs: 2, sm: 3 },
            boxShadow: 3,
          }}
        >
          <Container maxWidth="lg">
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' } }}
            >
              तक्रार नोंदणी व्यवस्था
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
              }}
            >
              आपल्या तक्रारी नोंदवा आणि त्यांचा मागोवा घ्या - २४x७
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
          {/* Tabs */}
          <Paper elevation={3} sx={{ mb: { xs: 2, sm: 3, md: 4 }, overflow: 'hidden' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTab-root': {
                  minHeight: { xs: '48px', sm: '64px' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  padding: { xs: '8px 4px', sm: '12px 8px', md: '16px' },
                }
              }}
            >
              <Tab 
                icon={<Description sx={{ fontSize: { xs: '18px', sm: '20px', md: '24px' } }} />} 
                label="तक्रार नोंदवा" 
                iconPosition="start"
                sx={{ fontWeight: 600 }}
              />
              <Tab 
                icon={<Search sx={{ fontSize: { xs: '18px', sm: '20px', md: '24px' } }} />} 
                label="स्थिती तपासा" 
                iconPosition="start"
                sx={{ fontWeight: 600 }}
              />
              <Tab 
                label="सर्व तक्रारी"
                sx={{ fontWeight: 600 }}
              />
            </Tabs>
          </Paper>

          {/* Submit Complaint Form */}
          {activeTab === 0 && (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 5 }, mb: { xs: 2, sm: 3 } }}>
              {submitted ? (
                <Box textAlign="center" py={{ xs: 4, sm: 5, md: 6 }}>
                  <CheckCircle sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: 'success.main', mb: 2 }} />
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
                  >
                    तक्रार यशस्वीरित्या नोंदवली गेली!
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    तुमचा ट्रॅकिंग आयडी:
                  </Typography>
                  <Paper
                    elevation={2}
                    sx={{
                      display: 'inline-block',
                      px: { xs: 2, sm: 3, md: 4 },
                      py: { xs: 1.5, sm: 2 },
                      my: 2,
                      background: 'linear-gradient(135deg, #fed7aa 0%, #bbf7d0 100%)',
                      width: { xs: '90%', sm: 'auto' },
                      maxWidth: '100%',
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography 
                      variant="h4" 
                      fontWeight="bold" 
                      color="primary"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
                    >
                      {trackingId}
                    </Typography>
                  </Paper>
                  <Typography 
                    variant="body1" 
                    gutterBottom 
                    sx={{ 
                      mt: 2,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      px: { xs: 2, sm: 0 }
                    }}
                  >
                    तुम्हाला SMS आणि Email द्वारे अपडेट मिळतील
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 2, sm: 0 }
                    }}
                  >
                    कृपया भविष्यात वापरण्यासाठी हा आयडी सेव्ह करा
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2 }, 
                    justifyContent: 'center', 
                    flexWrap: 'wrap',
                    px: { xs: 2, sm: 0 }
                  }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => {
                        setSubmitted(false);
                        setSearchId(trackingId);
                        setActiveTab(1);
                      }}
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        padding: { xs: '8px 16px', sm: '10px 20px' },
                        minWidth: { xs: '140px', sm: 'auto' }
                      }}
                    >
                      तक्रारीचा मागोवा घ्या
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => setSubmitted(false)}
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        padding: { xs: '8px 16px', sm: '10px 20px' },
                        minWidth: { xs: '120px', sm: 'auto' }
                      }}
                    >
                      नवीन तक्रार
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    gutterBottom 
                    sx={{ 
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                    }}
                  >
                    आपली तक्रार नोंदवा
                  </Typography>
                  
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="पूर्ण नाव"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="मोबाईल नंबर"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="१० अंकी मोबाईल नंबर"
                        required
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="ईमेल पत्ता"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="तक्रारीचा प्रकार"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="विषय"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="तुमच्या तक्रारीचे संक्षिप्त वर्णन"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="तक्रारीचा तपशील"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="तुमच्या तक्रारीची संपूर्ण माहिती द्या"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="पत्ता/ठिकाण"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="वॉर्ड क्रमांक, रस्ता, लँडमार्क"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    sx={{ 
                      mt: { xs: 2, sm: 3 }, 
                      py: { xs: 1.25, sm: 1.5 }, 
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                      minHeight: { xs: '48px', sm: 'auto' }
                    }}
                  >
                    {submitting ? 'सबमिट होत आहे...' : 'तक्रार सबमिट करा'}
                  </Button>
                  
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mt: { xs: 2, sm: 3 },
                      fontSize: { xs: '0.875rem', sm: '0.9rem' }
                    }}
                  >
                    <strong>सूचना:</strong> तक्रार नोंदवल्यानंतर तुम्हाला ट्रॅकिंग आयडी मिळेल. तुमच्या नोंदणीकृत मोबाईल आणि ईमेलवर अपडेट पाठवले जातील.
                  </Alert>
                </Box>
              )}
            </Paper>
          )}

          {/* Track Status */}
          {activeTab === 1 && (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 5 }, mb: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                gutterBottom 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                तक्रारीचा मागोवा घ्या
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 2 }, 
                mb: { xs: 3, sm: 4 },
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <TextField
                  fullWidth
                  label="ट्रॅकिंग आयडी"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  placeholder="उदा. GP2025001"
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '16px', sm: '1rem' }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={trackComplaint}
                  disabled={trackingLoading}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 120 }, 
                    px: { xs: 2, sm: 4 },
                    minHeight: { xs: '48px', sm: 'auto' },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  startIcon={trackingLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                >
                  {trackingLoading ? 'शोधत आहे...' : 'शोधा'}
                </Button>
              </Box>

              {trackedComplaint && (
                <Card elevation={2} sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {trackedComplaint.subject}
                        </Typography>
                        <Typography color="text.secondary">
                          ट्रॅकिंग आयडी: {trackedComplaint.trackingId || trackedComplaint.id}
                        </Typography>
                      </Box>
                      <Chip
                        label={getMarathiStatus(trackedComplaint.status)}
                        color={getStatusColor(trackedComplaint.status)}
                        size="medium"
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            प्रकार
                          </Typography>
                          <Typography fontWeight="bold">
                            {trackedComplaint.category}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            नोंदणी तारीख
                          </Typography>
                          <Typography fontWeight="bold">
                            {trackedComplaint.date}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            प्राधान्यता
                          </Typography>
                          <Chip
                            label={getMarathiPriority(trackedComplaint.priority)}
                            color={getPriorityColor(trackedComplaint.priority)}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            तक्रारकर्ता
                          </Typography>
                          <Typography fontWeight="bold">
                            {trackedComplaint.name}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        स्थिती टाइमलाइन
                      </Typography>
                      <Stepper 
                        orientation="vertical" 
                        activeStep={
                          trackedComplaint.status === 'Resolved' || trackedComplaint.status === 'निराकरण झाले' ? 3 : 
                          trackedComplaint.status === 'In Progress' || trackedComplaint.status === 'प्रगतीपथावर' ? 1 : 0
                        }
                      >
                        <Step completed>
                          <StepLabel>तक्रार नोंदवली</StepLabel>
                          <StepContent>
                            <Typography variant="body2" color="text.secondary">
                              {trackedComplaint.date} - तुमची तक्रार यशस्वीरित्या नोंदवली गेली आहे
                            </Typography>
                          </StepContent>
                        </Step>
                        <Step completed={trackedComplaint.status !== 'Pending' && trackedComplaint.status !== 'प्रलंबित'}>
                          <StepLabel>पुनरावलोकनाधीन</StepLabel>
                          <StepContent>
                            <Typography variant="body2" color="text.secondary">
                              तक्रार संबंधित विभागाकडे पाठवली आहे
                            </Typography>
                          </StepContent>
                        </Step>
                        <Step completed={trackedComplaint.status === 'Resolved' || trackedComplaint.status === 'निराकरण झाले'}>
                          <StepLabel>निराकरण झाले</StepLabel>
                          <StepContent>
                            <Typography variant="body2" color="text.secondary">
                              तुमच्या तक्रारीचे यशस्वीरित्या निराकरण झाले आहे
                            </Typography>
                          </StepContent>
                        </Step>
                      </Stepper>
                    </Box>

                    <Alert severity="success" sx={{ mt: 3 }}>
                      <strong>अपडेट:</strong> कोणत्याही बदलासाठी तुम्हाला SMS आणि ईमेल सूचना मिळतील.
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {!trackedComplaint && searchId && (
                <Box textAlign="center" py={6}>
                  <Cancel sx={{ fontSize: 70, color: 'error.light', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    तक्रार सापडली नाही
                  </Typography>
                  <Typography color="text.secondary">
                    कृपया आपला ट्रॅकिंग आयडी तपासा आणि पुन्हा प्रयत्न करा
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* All Complaints */}
          {activeTab === 2 && (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 5 }, mb: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                gutterBottom 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                सर्व तक्रारी
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {complaints.length === 0 ? (
                    <Box textAlign="center" py={6}>
                      <Typography variant="h6" color="text.secondary">
                        अजून कोणतीही तक्रार नोंदवली नाही
                      </Typography>
                    </Box>
                  ) : (
                    complaints.map((complaint) => (
                  <Card 
                    key={complaint.id} 
                    elevation={2} 
                    sx={{ 
                      transition: 'box-shadow 0.3s',
                      '&:hover': { boxShadow: 4 } 
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {complaint.subject}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ट्रॅकिंग आयडी: {complaint.trackingId || complaint.id}
                          </Typography>
                        </Box>
                        <Chip
                          label={getMarathiStatus(complaint.status)}
                          color={getStatusColor(complaint.status)}
                        />
                      </Box>
                      
                      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1 }}>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: 'grey.100' }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              प्रकार
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight="600"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {complaint.category}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: 'grey.100' }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              तारीख
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight="600"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {complaint.date}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: 'grey.100' }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              प्राधान्यता
                            </Typography>
                            <Chip
                              label={getMarathiPriority(complaint.priority)}
                              color={getPriorityColor(complaint.priority)}
                              size="small"
                              sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: 'grey.100' }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              तक्रारकर्ता
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight="600"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {complaint.name}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                    ))
                  )}
                </Box>
              )}
            </Paper>
          )}

          {/* Contact Info */}
          <Paper
            elevation={4}
            sx={{
              mt: { xs: 2, sm: 3, md: 4 },
              p: { xs: 2, sm: 3, md: 4 },
              background: 'linear-gradient(135deg, #ea580c 0%, #16a34a 100%)',
              color: 'white',
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}
            >
              मदतीसाठी संपर्क करा
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2 
                }}>
                  <Phone sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      हेल्पलाइन
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      1800-XXX-XXXX
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2 
                }}>
                  <Email sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      ईमेल
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      takrar@gp.gov.in
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2 
                }}>
                  <LocationOn sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      कार्यालय
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      सोम-शुक्र | ९ AM-५ PM
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}