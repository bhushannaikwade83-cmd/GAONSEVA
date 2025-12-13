import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Schedule,
  Visibility,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { db } from '../../../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  where,
} from 'firebase/firestore';

const initialState = {
  name: '',
  phone: '',
  email: '',
  address: '',
  category: '',
  subject: '',
  description: '',
  status: 'Pending',
  priority: 'Medium',
  trackingId: '',
  remarks: '',
};

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(initialState);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const colRef = collection(db, 'complaints');

  const categories = [
    'पाणी पुरवठा',
    'रस्ते व पायाभूत सुविधा',
    'रस्त्यावरील दिवे',
    'कचरा व्यवस्थापन',
    'स्वच्छता',
    'शिक्षण',
    'आरोग्य',
    'इतर',
  ];

  const statusOptions = [
    { value: 'Pending', label: 'प्रलंबित', color: 'warning' },
    { value: 'In Progress', label: 'प्रगतीपथावर', color: 'info' },
    { value: 'Resolved', label: 'निराकरण झाले', color: 'success' },
    { value: 'Rejected', label: 'नाकारले', color: 'error' },
  ];

  const priorityOptions = [
    { value: 'Low', label: 'कमी' },
    { value: 'Medium', label: 'मध्यम' },
    { value: 'High', label: 'उच्च' },
  ];

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let q = query(colRef, orderBy('createdAt', 'desc'));
      if (statusFilter !== 'all') {
        q = query(colRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
      }
      const snap = await getDocs(q);
      setComplaints(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setNotification({ open: true, message: `लोड अयशस्वी: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const generateTrackingId = () => {
    const prefix = 'GP';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${year}${random}`;
  };

  const handleOpen = (complaint = null) => {
    if (complaint) {
      setIsEditing(true);
      setCurrent(complaint);
    } else {
      setIsEditing(false);
      setCurrent(initialState);
    }
    setOpen(true);
  };

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setViewOpen(true);
  };

  const handleSave = async () => {
    if (!current.name.trim() || !current.subject.trim()) {
      setNotification({ open: true, message: 'नाव आणि विषय आवश्यक आहेत.', severity: 'warning' });
      return;
    }

    try {
      const payload = {
        name: current.name,
        phone: current.phone || '',
        email: current.email || '',
        address: current.address || '',
        category: current.category || '',
        subject: current.subject,
        description: current.description || '',
        status: current.status || 'Pending',
        priority: current.priority || 'Medium',
        remarks: current.remarks || '',
        updatedAt: serverTimestamp(),
      };

      if (!isEditing) {
        payload.trackingId = generateTrackingId();
        payload.createdAt = serverTimestamp();
        await addDoc(colRef, payload);
        setNotification({ open: true, message: 'तक्रार जोडली गेली.', severity: 'success' });
      } else {
        await updateDoc(doc(db, 'complaints', current.id), payload);
        setNotification({ open: true, message: 'तक्रार अपडेट झाली.', severity: 'success' });
      }

      setOpen(false);
      fetchComplaints();
    } catch (e) {
      setNotification({ open: true, message: `सेव्ह अयशस्वी: ${e.message}`, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('खात्री आहे? ही तक्रार कायमस्वरूपी हटवली जाईल.')) return;
    try {
      await deleteDoc(doc(db, 'complaints', id));
      setNotification({ open: true, message: 'तक्रार हटवली.', severity: 'success' });
      fetchComplaints();
    } catch (e) {
      setNotification({ open: true, message: `हटवण्यात अयशस्वी: ${e.message}`, severity: 'error' });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'complaints', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setNotification({ open: true, message: 'स्थिती अपडेट झाली.', severity: 'success' });
      fetchComplaints();
    } catch (e) {
      setNotification({ open: true, message: `अपडेट अयशस्वी: ${e.message}`, severity: 'error' });
    }
  };

  const getStatusChip = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    if (!statusOption) return <Chip label={status} size="small" />;
    return (
      <Chip
        label={statusOption.label}
        size="small"
        color={statusOption.color}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityOption = priorityOptions.find((p) => p.value === priority);
    if (!priorityOption) return <Chip label={priority} size="small" variant="outlined" />;
    const colorMap = {
      Low: 'default',
      Medium: 'warning',
      High: 'error',
    };
    return (
      <Chip
        label={priorityOption.label}
        size="small"
        variant="outlined"
        color={colorMap[priority] || 'default'}
      />
    );
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (statusFilter === 'all') return true;
    return complaint.status === statusFilter;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
            तक्रार व्यवस्थापन
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            नवीन तक्रार
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  एकूण तक्रारी
                </Typography>
                <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#fff3e0', border: '1px solid #ffe0b2' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  प्रलंबित
                </Typography>
                <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 700 }}>
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#e3f2fd', border: '1px solid #bbdefb' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  प्रगतीपथावर
                </Typography>
                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700 }}>
                  {stats.inProgress}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  निराकरण झाले
                </Typography>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                  {stats.resolved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Tabs */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={statusFilter}
            onChange={(e, newValue) => setStatusFilter(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: '#666',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: '#1976d2',
                  fontWeight: 600,
                },
              },
            }}
          >
            <Tab label="सर्व" value="all" />
            <Tab label="प्रलंबित" value="Pending" />
            <Tab label="प्रगतीपथावर" value="In Progress" />
            <Tab label="निराकरण झाले" value="Resolved" />
            <Tab label="नाकारले" value="Rejected" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {filteredComplaints.map((complaint) => (
              <ListItem
                key={complaint.id}
                sx={{
                  mb: 2,
                  backgroundColor: '#fafafa',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    boxShadow: 2,
                  },
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleView(complaint)} size="small" sx={{ color: '#1976d2' }}>
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => handleOpen(complaint)} size="small" sx={{ color: '#1976d2' }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(complaint.id)} size="small" sx={{ color: '#d32f2f' }}>
                      <Delete />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                        {complaint.subject || 'विषय नाही'}
                      </Typography>
                      {getStatusChip(complaint.status)}
                      {getPriorityChip(complaint.priority)}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        <strong>नाव:</strong> {complaint.name} | <strong>फोन:</strong> {complaint.phone || 'N/A'} |{' '}
                        <strong>श्रेणी:</strong> {complaint.category || 'N/A'}
                      </Typography>
                      {complaint.trackingId && (
                        <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>
                          ट्रॅकिंग ID: {complaint.trackingId}
                        </Typography>
                      )}
                      {complaint.createdAt && (
                        <Typography variant="caption" sx={{ color: '#999', ml: 2 }}>
                          तारीख:{' '}
                          {complaint.createdAt.toDate
                            ? complaint.createdAt.toDate().toLocaleDateString('en-IN')
                            : 'N/A'}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {filteredComplaints.length === 0 && (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#666' }}>
                कोणतीही तक्रार नाही. "नवीन तक्रार" वर क्लिक करा.
              </Typography>
            )}
          </List>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 600 }}>
          {isEditing ? 'तक्रार संपादन' : 'नवीन तक्रार'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="नाव *"
                fullWidth
                value={current.name}
                onChange={(e) => setCurrent({ ...current, name: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="फोन"
                fullWidth
                value={current.phone}
                onChange={(e) => setCurrent({ ...current, phone: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="ईमेल"
                fullWidth
                type="email"
                value={current.email}
                onChange={(e) => setCurrent({ ...current, email: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>श्रेणी</InputLabel>
                <Select
                  label="श्रेणी"
                  value={current.category}
                  onChange={(e) => setCurrent({ ...current, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="पत्ता"
                fullWidth
                multiline
                rows={2}
                value={current.address}
                onChange={(e) => setCurrent({ ...current, address: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="विषय *"
                fullWidth
                value={current.subject}
                onChange={(e) => setCurrent({ ...current, subject: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="तपशील"
                fullWidth
                multiline
                rows={4}
                value={current.description}
                onChange={(e) => setCurrent({ ...current, description: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>स्थिती</InputLabel>
                <Select
                  label="स्थिती"
                  value={current.status}
                  onChange={(e) => setCurrent({ ...current, status: e.target.value })}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>प्राधान्य</InputLabel>
                <Select
                  label="प्राधान्य"
                  value={current.priority}
                  onChange={(e) => setCurrent({ ...current, priority: e.target.value })}
                >
                  {priorityOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {isEditing && (
              <Grid item xs={12}>
                <TextField
                  label="ट्रॅकिंग ID"
                  fullWidth
                  value={current.trackingId || ''}
                  disabled
                  sx={{ mb: 2 }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="टिप्पणी/नोट्स"
                fullWidth
                multiline
                rows={3}
                value={current.remarks || ''}
                onChange={(e) => setCurrent({ ...current, remarks: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="तक्रारीवर टिप्पणी किंवा नोट्स जोडा..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ color: '#666' }}>
            रद्द करा
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            जतन करा
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 600 }}>
          तक्रार तपशील
        </DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {getStatusChip(selectedComplaint.status)}
                    {getPriorityChip(selectedComplaint.priority)}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    नाव
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 500 }}>
                    {selectedComplaint.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    फोन
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 500 }}>
                    {selectedComplaint.phone || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    ईमेल
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 500 }}>
                    {selectedComplaint.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    श्रेणी
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 500 }}>
                    {selectedComplaint.category || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    पत्ता
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 500 }}>
                    {selectedComplaint.address || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    विषय
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                    {selectedComplaint.subject}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    तपशील
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1a1a1a' }}>
                    {selectedComplaint.description || 'N/A'}
                  </Typography>
                </Grid>
                {selectedComplaint.trackingId && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                      ट्रॅकिंग ID
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 600 }}>
                      {selectedComplaint.trackingId}
                    </Typography>
                  </Grid>
                )}
                {selectedComplaint.remarks && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                      टिप्पणी/नोट्स
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a' }}>
                      {selectedComplaint.remarks}
                    </Typography>
                  </Grid>
                )}
                {selectedComplaint.createdAt && (
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      तारीख:{' '}
                      {selectedComplaint.createdAt.toDate
                        ? selectedComplaint.createdAt.toDate().toLocaleDateString('en-IN')
                        : 'N/A'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)} sx={{ color: '#666' }}>
            बंद करा
          </Button>
          {selectedComplaint && (
            <Button
              onClick={() => {
                setViewOpen(false);
                handleOpen(selectedComplaint);
              }}
              variant="contained"
              startIcon={<Edit />}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              संपादन करा
            </Button>
          )}
        </DialogActions>
      </Dialog>

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

export default ManageComplaints;
