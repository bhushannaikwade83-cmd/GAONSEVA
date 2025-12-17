import React, { useState } from 'react';
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
  const [complaints, setComplaints] = useState([
    {
      id: 'GP2025001',
      name: 'रमेश कुमार',
      category: 'पाणी पुरवठा',
      subject: 'वॉर्ड ३ मध्ये पाण्याची कमतरता',
      status: 'प्रगतीपथावर',
      date: '2025-09-28',
      priority: 'उच्च'
    },
    {
      id: 'GP2025002',
      name: 'सुनिता देवी',
      category: 'रस्ते व पायाभूत सुविधा',
      subject: 'रस्त्याची दुरुस्ती आवश्यक',
      status: 'निराकरण झाले',
      date: '2025-09-25',
      priority: 'मध्यम'
    },
    {
      id: 'GP2025003',
      name: 'विजय सिंग',
      category: 'रस्त्यावरील दिवे',
      subject: 'रस्त्यावरील दिवे कार्यरत नाहीत',
      status: 'प्रलंबित',
      date: '2025-09-30',
      priority: 'कमी'
    }
  ]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.category || !formData.subject || !formData.description) {
      alert('कृपया सर्व आवश्यक माहिती भरा');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('कृपया १० अंकी मोबाईल नंबर टाका');
      return;
    }

    const newComplaintId = `GP2025${String(complaints.length + 1).padStart(3, '0')}`;
    
    const newComplaint = {
      id: newComplaintId,
      name: formData.name,
      category: formData.category,
      subject: formData.subject,
      status: 'प्रलंबित',
      date: new Date().toISOString().split('T')[0],
      priority: 'मध्यम'
    };
    
    setComplaints([newComplaint, ...complaints]);
    setTrackingId(newComplaintId);
    setSubmitted(true);
    
    setTimeout(() => {
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: '',
        subject: '',
        description: '',
        address: ''
      });
    }, 100);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'प्रलंबित': return 'warning';
      case 'प्रगतीपथावर': return 'info';
      case 'निराकरण झाले': return 'success';
      case 'नाकारले': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'उच्च': return 'error';
      case 'मध्यम': return 'warning';
      case 'कमी': return 'success';
      default: return 'default';
    }
  };

  const trackComplaint = () => {
    const found = complaints.find(c => c.id === searchId);
    if (found) {
      setTrackingId(searchId);
      setActiveTab(1);
    } else {
      alert('तक्रार आयडी सापडला नाही. कृपया तपासून पुन्हा प्रयत्न करा.');
    }
  };

  const trackedComplaint = complaints.find(c => c.id === trackingId);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff5f0' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #ea580c 0%, #16a34a 100%)',
            color: 'white',
            py: 6,
            px: 2,
            boxShadow: 3,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              तक्रार नोंदणी व्यवस्था
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              आपल्या तक्रारी नोंदवा आणि त्यांचा मागोवा घ्या - २४x७
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Tabs */}
          <Paper elevation={3} sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab 
                icon={<Description />} 
                label="तक्रार नोंदवा" 
                iconPosition="start"
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              />
              <Tab 
                icon={<Search />} 
                label="स्थिती तपासा" 
                iconPosition="start"
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              />
              <Tab 
                label="सर्व तक्रारी"
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              />
            </Tabs>
          </Paper>

          {/* Submit Complaint Form */}
          {activeTab === 0 && (
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
              {submitted ? (
                <Box textAlign="center" py={6}>
                  <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    तक्रार यशस्वीरित्या नोंदवली गेली!
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    तुमचा ट्रॅकिंग आयडी:
                  </Typography>
                  <Paper
                    elevation={2}
                    sx={{
                      display: 'inline-block',
                      px: 4,
                      py: 2,
                      my: 2,
                      background: 'linear-gradient(135deg, #fed7aa 0%, #bbf7d0 100%)',
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {trackingId}
                    </Typography>
                  </Paper>
                  <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                    तुम्हाला SMS आणि Email द्वारे अपडेट मिळतील
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    कृपया भविष्यात वापरण्यासाठी हा आयडी सेव्ह करा
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => {
                        setSubmitted(false);
                        setSearchId(trackingId);
                        setActiveTab(1);
                      }}
                    >
                      तक्रारीचा मागोवा घ्या
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => setSubmitted(false)}
                    >
                      नवीन तक्रार
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    आपली तक्रार नोंदवा
                  </Typography>
                  
                  <Grid container spacing={3}>
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
                    startIcon={<Send />}
                    sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
                  >
                    तक्रार सबमिट करा
                  </Button>
                  
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <strong>सूचना:</strong> तक्रार नोंदवल्यानंतर तुम्हाला ट्रॅकिंग आयडी मिळेल. तुमच्या नोंदणीकृत मोबाईल आणि ईमेलवर अपडेट पाठवले जातील.
                  </Alert>
                </Box>
              )}
            </Paper>
          )}

          {/* Track Status */}
          {activeTab === 1 && (
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                तक्रारीचा मागोवा घ्या
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                  fullWidth
                  label="ट्रॅकिंग आयडी"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  placeholder="उदा. GP2025001"
                  variant="outlined"
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
                  sx={{ minWidth: 120, px: 4 }}
                >
                  शोधा
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
                          आयडी: {trackedComplaint.id}
                        </Typography>
                      </Box>
                      <Chip
                        label={trackedComplaint.status}
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
                            label={trackedComplaint.priority}
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
                          trackedComplaint.status === 'निराकरण झाले' ? 3 : 
                          trackedComplaint.status === 'प्रगतीपथावर' ? 1 : 0
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
                        <Step completed={trackedComplaint.status !== 'प्रलंबित'}>
                          <StepLabel>पुनरावलोकनाधीन</StepLabel>
                          <StepContent>
                            <Typography variant="body2" color="text.secondary">
                              तक्रार संबंधित विभागाकडे पाठवली आहे
                            </Typography>
                          </StepContent>
                        </Step>
                        <Step completed={trackedComplaint.status === 'निराकरण झाले'}>
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
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                सर्व तक्रारी
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {complaints.map((complaint) => (
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
                            आयडी: {complaint.id}
                          </Typography>
                        </Box>
                        <Chip
                          label={complaint.status}
                          color={getStatusColor(complaint.status)}
                        />
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                            <Typography variant="caption" color="text.secondary">
                              प्रकार
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {complaint.category}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                            <Typography variant="caption" color="text.secondary">
                              तारीख
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {complaint.date}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                            <Typography variant="caption" color="text.secondary">
                              प्राधान्यता
                            </Typography>
                            <Chip
                              label={complaint.priority}
                              color={getPriorityColor(complaint.priority)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                            <Typography variant="caption" color="text.secondary">
                              तक्रारकर्ता
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {complaint.name}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          )}

          {/* Contact Info */}
          <Paper
            elevation={4}
            sx={{
              mt: 4,
              p: 4,
              background: 'linear-gradient(135deg, #ea580c 0%, #16a34a 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              मदतीसाठी संपर्क करा
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
    </ThemeProvider>
  );
}