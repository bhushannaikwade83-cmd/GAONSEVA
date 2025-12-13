import React, { useState, useEffect } from "react";
import { 
  Box, 
  Tabs, 
  Tab, 
  Button, 
  TextField, 
  IconButton, 
  Paper,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
  Divider
} from "@mui/material";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // adjust path
import CloudinaryUploader from "../../components/CloudinaryUploader"; // reusable image uploader
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";


const ManageHomeMessages = () => {
  const [tab, setTab] = useState(0);
  const [newMessages, setNewMessages] = useState([]);
  const [yojana, setYojana] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "home", "messages");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNewMessages(data.newMessages || []);
        setYojana(data.yojana || []);
        setTenders(data.tenders || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "home", "messages"), {
        newMessages,
        yojana,
        tenders,
      });
      alert("Saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (_, newValue) => setTab(newValue);

  // Helper to add new item
  const addItem = (type) => {
    if (type === "newMessages") setNewMessages([...newMessages, { title: "", imageUrl: "" }]);
    if (type === "yojana") setYojana([...yojana, { title: "", link: "" }]);
    if (type === "tenders") setTenders([...tenders, { title: "", link: "" }]);
  };

  // Helper to remove item
  const removeItem = (type, index) => {
    if (type === "newMessages") setNewMessages(newMessages.filter((_, i) => i !== index));
    if (type === "yojana") setYojana(yojana.filter((_, i) => i !== index));
    if (type === "tenders") setTenders(tenders.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>लोड करत आहे...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 }, maxWidth: '100%', overflow: 'hidden', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#1a1a1a' }}>
        संदेश व्यवस्थापन
      </Typography>
      
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        <Tabs 
          value={tab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            '& .MuiTab-root': {
              minWidth: isMobile ? 'auto' : 120,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              px: isMobile ? 1 : 2,
              color: '#666',
              fontWeight: 500,
              '&.Mui-selected': {
                color: '#1976d2',
                fontWeight: 600,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2'
            }
          }}
        >
          <Tab label="नवीन संदेश" />
          <Tab label="योजना" />
          <Tab label="निविदा" />
        </Tabs>
      </Paper>

      {/* नविन संदेश */}
      {tab === 0 && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
            नवीन संदेश व्यवस्थापन
          </Typography>
          
          {newMessages.length === 0 && (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: '#666' }}>
              अजून कोणतेही संदेश जोडलेले नाहीत
            </Typography>
          )}
          
          {newMessages.map((item, index) => (
            <Paper 
              key={index} 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 2, 
                border: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  boxShadow: 2
                }
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="योजना नाव"
                  value={item.title}
                  onChange={(e) => {
                    const updated = [...newMessages];
                    updated[index].title = e.target.value;
                    setNewMessages(updated);
                  }}
                  fullWidth
                  size="small"
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                    <CloudinaryUploader
                      onUpload={(url) => {
                        const updated = [...newMessages];
                        updated[index].imageUrl = url;
                        setNewMessages(updated);
                      }}
                      imageUrl={item.imageUrl}
                    />
                  </Box>
                  
                  <IconButton 
                    onClick={() => removeItem("newMessages", index)}
                    size="small"
                    sx={{ 
                      alignSelf: isMobile ? 'flex-start' : 'center',
                      mt: isMobile ? 1 : 0,
                      color: '#d32f2f',
                      '&:hover': {
                        backgroundColor: '#ffebee'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            </Paper>
          ))}
          
          <Button 
            variant="outlined" 
            onClick={() => addItem("newMessages")}
            startIcon={<AddIcon />}
            fullWidth={isMobile}
            sx={{ 
              mt: 1,
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: '#e3f2fd'
              }
            }}
          >
            नवीन संदेश जोडा
          </Button>
        </Paper>
      )}

      {/* योजना */}
      {tab === 1 && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
            योजना व्यवस्थापन
          </Typography>
          
          {yojana.length === 0 && (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: '#666' }}>
              अजून कोणतीही योजना जोडलेली नाही
            </Typography>
          )}
          
          {yojana.map((item, index) => (
            <Paper 
              key={index} 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 2, 
                border: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  boxShadow: 2
                }
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="योजना नाव"
                  value={item.title}
                  onChange={(e) => {
                    const updated = [...yojana];
                    updated[index].title = e.target.value;
                    setYojana(updated);
                  }}
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label="लिंक"
                  value={item.link}
                  onChange={(e) => {
                    const updated = [...yojana];
                    updated[index].link = e.target.value;
                    setYojana(updated);
                  }}
                  fullWidth
                  size="small"
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton 
                    onClick={() => removeItem("yojana", index)}
                    size="small"
                    sx={{
                      color: '#d32f2f',
                      '&:hover': {
                        backgroundColor: '#ffebee'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            </Paper>
          ))}
          
          <Button 
            variant="outlined" 
            onClick={() => addItem("yojana")}
            startIcon={<AddIcon />}
            fullWidth={isMobile}
            sx={{ mt: 1 }}
          >
            योजना जोडा
          </Button>
        </Paper>
      )}

      {/* निविदा */}
      {tab === 2 && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
            निविदा व्यवस्थापन
          </Typography>
          
          {tenders.length === 0 && (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: '#666' }}>
              अजून कोणतीही निविदा जोडलेली नाही
            </Typography>
          )}
          
          {tenders.map((item, index) => (
            <Paper 
              key={index} 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 2, 
                border: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  boxShadow: 2
                }
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="निविदा नाव"
                  value={item.title}
                  onChange={(e) => {
                    const updated = [...tenders];
                    updated[index].title = e.target.value;
                    setTenders(updated);
                  }}
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label="लिंक"
                  value={item.link}
                  onChange={(e) => {
                    const updated = [...tenders];
                    updated[index].link = e.target.value;
                    setTenders(updated);
                  }}
                  fullWidth
                  size="small"
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton 
                    onClick={() => removeItem("tenders", index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            </Paper>
          ))}
          
          <Button 
            variant="outlined" 
            onClick={() => addItem("tenders")}
            startIcon={<AddIcon />}
            fullWidth={isMobile}
            sx={{ mt: 1 }}
          >
            निविदा जोडा
          </Button>
        </Paper>
      )}

      {/* Save Button */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mt: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
            startIcon={<SaveIcon />}
            size="large"
            sx={{ 
              minWidth: 150,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            {saving ? 'सेव्ह होत आहे...' : 'सेव्ह करा'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ManageHomeMessages;