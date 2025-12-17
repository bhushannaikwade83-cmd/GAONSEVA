import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  PictureAsPdf,
  Download,
} from '@mui/icons-material';
import { db } from '../../../firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const ManageBudget = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'income', 'expenditure', 'transaction', 'document'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Data states
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    totalIncome: 0,
    totalExpenditure: 0,
  });
  const [incomeSources, setIncomeSources] = useState([]);
  const [expenditureCategories, setExpenditureCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Firebase collections - using top-level collections for simplicity
  const budgetCollection = collection(db, 'budget');
  const incomeCollection = collection(db, 'budget-income');
  const expenditureCollection = collection(db, 'budget-expenditure');
  const transactionsCollection = collection(db, 'budget-transactions');
  const documentsCollection = collection(db, 'budget-documents');

  // Fetch all data
  useEffect(() => {
    setLoading(true);
    let isMounted = true;
    
    // Fetch budget summary
    const budgetDocRef = doc(budgetCollection, `year-${selectedYear}`);
    const budgetUnsub = onSnapshot(
      budgetDocRef,
      (docSnapshot) => {
        if (!isMounted) return;
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setBudgetSummary({
            totalBudget: data.totalBudget || 0,
            totalIncome: data.totalIncome || 0,
            totalExpenditure: data.totalExpenditure || 0,
          });
        } else {
          setBudgetSummary({ totalBudget: 0, totalIncome: 0, totalExpenditure: 0 });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching budget summary:', error);
        if (isMounted) {
          setNotification({ open: true, message: 'अर्थसंकल्प डेटा लोड करण्यात त्रुटी', severity: 'error' });
          setLoading(false);
        }
      }
    );

    // Fetch income sources - using where clause only, sorting manually
    const incomeUnsub = onSnapshot(
      query(incomeCollection, where('year', '==', selectedYear)),
      (snapshot) => {
        if (!isMounted) return;
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by amount descending manually
        items.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        setIncomeSources(items);
      },
      (error) => {
        console.error('Error fetching income sources:', error);
        if (isMounted) {
          setNotification({ open: true, message: 'उत्पन्न स्रोत लोड करण्यात त्रुटी', severity: 'error' });
        }
      }
    );

    // Fetch expenditure categories
    const expenditureUnsub = onSnapshot(
      query(expenditureCollection, where('year', '==', selectedYear)),
      (snapshot) => {
        if (!isMounted) return;
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by amount descending manually
        items.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        setExpenditureCategories(items);
      },
      (error) => {
        console.error('Error fetching expenditure categories:', error);
        if (isMounted) {
          setNotification({ open: true, message: 'खर्च श्रेणी लोड करण्यात त्रुटी', severity: 'error' });
        }
      }
    );

    // Fetch transactions
    const transactionsUnsub = onSnapshot(
      query(transactionsCollection, where('year', '==', selectedYear)),
      (snapshot) => {
        if (!isMounted) return;
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by date descending manually
        items.sort((a, b) => {
          const dateA = a.date || '';
          const dateB = b.date || '';
          return dateB.localeCompare(dateA);
        });
        setTransactions(items);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        if (isMounted) {
          setNotification({ open: true, message: 'व्यवहार लोड करण्यात त्रुटी', severity: 'error' });
        }
      }
    );

    // Fetch documents
    const documentsUnsub = onSnapshot(
      query(documentsCollection, where('year', '==', selectedYear)),
      (snapshot) => {
        if (!isMounted) return;
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by date descending manually
        items.sort((a, b) => {
          const dateA = a.date || '';
          const dateB = b.date || '';
          return dateB.localeCompare(dateA);
        });
        setDocuments(items);
      },
      (error) => {
        console.error('Error fetching documents:', error);
        if (isMounted) {
          setNotification({ open: true, message: 'दस्तावेज लोड करण्यात त्रुटी', severity: 'error' });
        }
      }
    );

    return () => {
      isMounted = false;
      budgetUnsub();
      incomeUnsub();
      expenditureUnsub();
      transactionsUnsub();
      documentsUnsub();
    };
  }, [selectedYear]);

  // Calculate remaining amount
  const remainingAmount = budgetSummary.totalBudget - budgetSummary.totalExpenditure;

  // Handle dialog open
  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (type === 'income') {
      setFormData(item || {
        source: '',
        amount: '',
        percentage: '',
        year: selectedYear,
      });
    } else if (type === 'expenditure') {
      setFormData(item || {
        category: '',
        amount: '',
        percentage: '',
        status: 'ongoing',
        year: selectedYear,
      });
    } else if (type === 'transaction') {
      setFormData(item || {
        description: '',
        type: 'expense',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        year: selectedYear,
      });
    } else if (type === 'document') {
      setFormData(item || {
        title: '',
        date: new Date().toISOString().split('T')[0],
        fileUrl: '',
        fileSize: '',
        year: selectedYear,
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({});
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (dialogType === 'income') {
        if (!formData.source || !formData.amount) {
          setNotification({ open: true, message: 'कृपया सर्व फील्ड भरा', severity: 'warning' });
          return;
        }
        const amount = parseFloat(formData.amount) || 0;
        const totalBudget = parseFloat(budgetSummary.totalBudget) || 1; // Avoid division by zero
        const percentage = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
        const data = {
          source: formData.source,
          amount: amount,
          percentage: percentage.toFixed(1),
          year: selectedYear,
          updatedAt: serverTimestamp(),
        };
        if (editingItem) {
          await updateDoc(doc(incomeCollection, editingItem.id), data);
          setNotification({ open: true, message: 'उत्पन्न स्रोत यशस्वीरित्या अपडेट झाला!', severity: 'success' });
        } else {
          data.createdAt = serverTimestamp();
          await addDoc(incomeCollection, data);
          setNotification({ open: true, message: 'उत्पन्न स्रोत यशस्वीरित्या जोडला!', severity: 'success' });
        }
      } else if (dialogType === 'expenditure') {
        if (!formData.category || !formData.amount) {
          setNotification({ open: true, message: 'कृपया सर्व फील्ड भरा', severity: 'warning' });
          return;
        }
        const amount = parseFloat(formData.amount) || 0;
        const totalBudget = parseFloat(budgetSummary.totalBudget) || 1; // Avoid division by zero
        const percentage = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
        const data = {
          category: formData.category,
          amount: amount,
          percentage: percentage.toFixed(1),
          status: formData.status || 'ongoing',
          year: selectedYear,
          updatedAt: serverTimestamp(),
        };
        if (editingItem) {
          await updateDoc(doc(expenditureCollection, editingItem.id), data);
          setNotification({ open: true, message: 'खर्च श्रेणी यशस्वीरित्या अपडेट झाली!', severity: 'success' });
        } else {
          data.createdAt = serverTimestamp();
          await addDoc(expenditureCollection, data);
          setNotification({ open: true, message: 'खर्च श्रेणी यशस्वीरित्या जोडली!', severity: 'success' });
        }
      } else if (dialogType === 'transaction') {
        if (!formData.description || !formData.amount || !formData.date) {
          setNotification({ open: true, message: 'कृपया सर्व फील्ड भरा', severity: 'warning' });
          return;
        }
        const data = {
          description: formData.description,
          type: formData.type || 'expense',
          amount: parseFloat(formData.amount) || 0,
          date: formData.date,
          year: selectedYear,
          updatedAt: serverTimestamp(),
        };
        if (editingItem) {
          await updateDoc(doc(transactionsCollection, editingItem.id), data);
          setNotification({ open: true, message: 'व्यवहार यशस्वीरित्या अपडेट झाला!', severity: 'success' });
        } else {
          data.createdAt = serverTimestamp();
          await addDoc(transactionsCollection, data);
          setNotification({ open: true, message: 'व्यवहार यशस्वीरित्या जोडला!', severity: 'success' });
        }
      } else if (dialogType === 'document') {
        if (!formData.title || !formData.fileUrl) {
          setNotification({ open: true, message: 'कृपया सर्व फील्ड भरा', severity: 'warning' });
          return;
        }
        const data = {
          title: formData.title,
          date: formData.date || new Date().toISOString().split('T')[0],
          fileUrl: formData.fileUrl,
          fileSize: formData.fileSize || '',
          year: selectedYear,
          updatedAt: serverTimestamp(),
        };
        if (editingItem) {
          await updateDoc(doc(documentsCollection, editingItem.id), data);
          setNotification({ open: true, message: 'दस्तावेज यशस्वीरित्या अपडेट झाला!', severity: 'success' });
        } else {
          data.createdAt = serverTimestamp();
          await addDoc(documentsCollection, data);
          setNotification({ open: true, message: 'दस्तावेज यशस्वीरित्या जोडला!', severity: 'success' });
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setNotification({ open: true, message: `त्रुटी: ${error.message}`, severity: 'error' });
    }
  };

  // Handle delete
  const handleDelete = async (type, id) => {
    if (!window.confirm('खात्री आहे की हटवायचे?')) return;
    
    try {
      if (type === 'income') {
        await deleteDoc(doc(incomeCollection, id));
      } else if (type === 'expenditure') {
        await deleteDoc(doc(expenditureCollection, id));
      } else if (type === 'transaction') {
        await deleteDoc(doc(transactionsCollection, id));
      } else if (type === 'document') {
        await deleteDoc(doc(documentsCollection, id));
      }
      setNotification({ open: true, message: 'यशस्वीरित्या हटवले!', severity: 'success' });
    } catch (error) {
      setNotification({ open: true, message: `त्रुटी: ${error.message}`, severity: 'error' });
    }
  };

  // Handle budget summary update
  const handleUpdateBudgetSummary = async () => {
    try {
      const budgetDocRef = doc(budgetCollection, `year-${selectedYear}`);
      const dataToSave = {
        totalBudget: parseFloat(budgetSummary.totalBudget) || 0,
        totalIncome: parseFloat(budgetSummary.totalIncome) || 0,
        totalExpenditure: parseFloat(budgetSummary.totalExpenditure) || 0,
        year: selectedYear,
        updatedAt: serverTimestamp(),
      };
      
      // Use setDoc with merge to create or update
      await setDoc(budgetDocRef, dataToSave, { merge: true });
      setNotification({ open: true, message: 'अर्थसंकल्प यशस्वीरित्या अपडेट झाला!', severity: 'success' });
    } catch (error) {
      setNotification({ open: true, message: `त्रुटी: ${error.message}`, severity: 'error' });
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">अर्थसंकल्प आणि पारदर्शकता व्यवस्थापन</Typography>
        </Box>

        {/* Financial Year Selection */}
        <Box sx={{ mb: 4 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>आर्थिक वर्ष निवडा</InputLabel>
            <Select
              value={selectedYear}
              label="आर्थिक वर्ष निवडा"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <MenuItem key={year} value={year.toString()}>
                    {year}-{(year + 1).toString().slice(-2)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        {/* Budget Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceWallet sx={{ mr: 1 }} />
                  <Typography variant="h6">एकूण अर्थसंकल्प</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  value={budgetSummary.totalBudget}
                  onChange={(e) => setBudgetSummary({ ...budgetSummary, totalBudget: e.target.value })}
                  sx={{ mt: 1, '& .MuiInputBase-root': { color: 'white' }, '& .MuiInput-underline:before': { borderColor: 'rgba(255,255,255,0.5)' } }}
                  size="small"
                />
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {formatCurrency(budgetSummary.totalBudget)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">एकूण उत्पन्न</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  value={budgetSummary.totalIncome}
                  onChange={(e) => setBudgetSummary({ ...budgetSummary, totalIncome: e.target.value })}
                  sx={{ mt: 1, '& .MuiInputBase-root': { color: 'white' }, '& .MuiInput-underline:before': { borderColor: 'rgba(255,255,255,0.5)' } }}
                  size="small"
                />
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {formatCurrency(budgetSummary.totalIncome)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown sx={{ mr: 1 }} />
                  <Typography variant="h6">एकूण खर्च</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  value={budgetSummary.totalExpenditure}
                  onChange={(e) => setBudgetSummary({ ...budgetSummary, totalExpenditure: e.target.value })}
                  sx={{ mt: 1, '& .MuiInputBase-root': { color: 'white' }, '& .MuiInput-underline:before': { borderColor: 'rgba(255,255,255,0.5)' } }}
                  size="small"
                />
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {formatCurrency(budgetSummary.totalExpenditure)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1 }} />
                  <Typography variant="h6">शिल्लक रक्कम</Typography>
                </Box>
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {formatCurrency(remainingAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Button variant="contained" onClick={handleUpdateBudgetSummary}>
            अर्थसंकल्प अपडेट करा
          </Button>
        </Box>

        {/* Income Details Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              उत्पन्नाचा तपशील
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog('income')}>
              नवीन उत्पन्न स्रोत
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>स्रोत</TableCell>
                  <TableCell>रक्कम</TableCell>
                  <TableCell>टक्केवारी</TableCell>
                  <TableCell>क्रिया</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incomeSources.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(item.percentage)}
                          sx={{ width: '100px', mr: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">{item.percentage}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog('income', item)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete('income', item.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Expenditure Details Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              <TrendingDown sx={{ mr: 1, verticalAlign: 'middle' }} />
              खर्चाचा तपशील
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog('expenditure')}>
              नवीन खर्च श्रेणी
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>श्रेणी</TableCell>
                  <TableCell>रक्कम</TableCell>
                  <TableCell>टक्केवारी</TableCell>
                  <TableCell>स्थिती</TableCell>
                  <TableCell>क्रिया</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenditureCategories.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(item.percentage)}
                          sx={{ width: '100px', mr: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">{item.percentage}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status === 'completed' ? 'पूर्ण' : 'सुरू'}
                        color={item.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog('expenditure', item)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete('expenditure', item.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Transactions Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">अलीकडील व्यवहार</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog('transaction')}>
              नवीन व्यवहार
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>तारीख</TableCell>
                  <TableCell>तपशील</TableCell>
                  <TableCell>प्रकार</TableCell>
                  <TableCell>रक्कम</TableCell>
                  <TableCell>क्रिया</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.slice(0, 10).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.type === 'income' ? 'उत्पन्न' : 'खर्च'}
                        color={item.type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: item.type === 'income' ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.type === 'income' ? '+' : '-'}
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog('transaction', item)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete('transaction', item.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Documents Section */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">कागदपत्रे आणि अहवाल</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog('document')}>
              नवीन दस्तावेज
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>शीर्षक</TableCell>
                  <TableCell>तारीख</TableCell>
                  <TableCell>आकार</TableCell>
                  <TableCell>क्रिया</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.fileSize || 'N/A'}</TableCell>
                    <TableCell>
                      <Tooltip title="डाउनलोड करा">
                        <IconButton
                          size="small"
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={() => handleOpenDialog('document', item)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete('document', item.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Paper>

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'income' && (editingItem ? 'उत्पन्न स्रोत संपादन' : 'नवीन उत्पन्न स्रोत')}
          {dialogType === 'expenditure' && (editingItem ? 'खर्च श्रेणी संपादन' : 'नवीन खर्च श्रेणी')}
          {dialogType === 'transaction' && (editingItem ? 'व्यवहार संपादन' : 'नवीन व्यवहार')}
          {dialogType === 'document' && (editingItem ? 'दस्तावेज संपादन' : 'नवीन दस्तावेज')}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'income' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="स्रोत नाव"
                fullWidth
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
              <TextField
                label="रक्कम"
                type="number"
                fullWidth
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </Box>
          )}
          {dialogType === 'expenditure' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="श्रेणी नाव"
                fullWidth
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <TextField
                label="रक्कम"
                type="number"
                fullWidth
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>स्थिती</InputLabel>
                <Select
                  value={formData.status || 'ongoing'}
                  label="स्थिती"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="ongoing">सुरू</MenuItem>
                  <MenuItem value="completed">पूर्ण</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {dialogType === 'transaction' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="तपशील"
                fullWidth
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>प्रकार</InputLabel>
                <Select
                  value={formData.type || 'expense'}
                  label="प्रकार"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="income">उत्पन्न</MenuItem>
                  <MenuItem value="expense">खर्च</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="रक्कम"
                type="number"
                fullWidth
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <TextField
                label="तारीख"
                type="date"
                fullWidth
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
          {dialogType === 'document' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="शीर्षक"
                fullWidth
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                label="तारीख"
                type="date"
                fullWidth
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="फाइल आकार (MB)"
                type="text"
                fullWidth
                value={formData.fileSize || ''}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                placeholder="उदा: 2.4 MB"
              />
              <CloudinaryUploader
                title="दस्तावेज अपलोड करा"
                currentImageUrl={formData.fileUrl || null}
                onUploadSuccess={(urls) => {
                  const url = Array.isArray(urls) ? urls[0] : urls;
                  setFormData({ ...formData, fileUrl: url });
                }}
                onUploadError={(msg) => {
                  setNotification({ open: true, message: msg, severity: 'error' });
                }}
              />
              {formData.fileUrl && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    icon={<PictureAsPdf />}
                    label="दस्तावेज अपलोड झाले"
                    color="success"
                    onDelete={() => setFormData({ ...formData, fileUrl: '' })}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>रद्द करा</Button>
          <Button onClick={handleSave} variant="contained">
            सेव्ह करा
          </Button>
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

export default ManageBudget;

