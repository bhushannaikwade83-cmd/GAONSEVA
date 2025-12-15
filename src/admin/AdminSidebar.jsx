import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Toolbar, Typography, Divider, Collapse, 
  Badge, Tooltip, IconButton, Avatar, Chip, useMediaQuery, useTheme
} from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CelebrationIcon from '@mui/icons-material/Celebration';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LanguageIcon from '@mui/icons-material/Language';
import TourIcon from '@mui/icons-material/Tour';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NatureIcon from '@mui/icons-material/Nature';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import SportsIcon from '@mui/icons-material/Sports';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import RecyclingIcon from '@mui/icons-material/Recycling';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import WaterIcon from '@mui/icons-material/Water';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import HomeIcon from '@mui/icons-material/Home';
import ImageIcon from '@mui/icons-material/Image';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const AdminSidebar = ({ drawerWidth, mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openGrampanchayat, setOpenGrampanchayat] = useState(true);
  const [openNirdeshika, setOpenNirdeshika] = useState(true);
  const [openPrograms, setOpenPrograms] = useState(true);
  const [openYojana, setOpenYojana] = useState(true);
  const [openHome, setOpenHome] = useState(true);
  const [openExtra, setOpenExtra] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [notifications, setNotifications] = useState(0);

  // Restore persisted open states
  useEffect(() => {
    const persisted = JSON.parse(localStorage.getItem('adminSidebarOpenStates') || '{}');
    if (typeof persisted.openGrampanchayat === 'boolean') setOpenGrampanchayat(persisted.openGrampanchayat);
    if (typeof persisted.openNirdeshika === 'boolean') setOpenNirdeshika(persisted.openNirdeshika);
    if (typeof persisted.openPrograms === 'boolean') setOpenPrograms(persisted.openPrograms);
    if (typeof persisted.openYojana === 'boolean') setOpenYojana(persisted.openYojana);
    if (typeof persisted.openHome === 'boolean') setOpenHome(persisted.openHome);
    if (typeof persisted.openExtra === 'boolean') setOpenExtra(persisted.openExtra);
  }, []);

  // Persist open states
  useEffect(() => {
    const state = { openGrampanchayat, openNirdeshika, openPrograms, openYojana, openHome, openExtra };
    localStorage.setItem('adminSidebarOpenStates', JSON.stringify(state));
  }, [openGrampanchayat, openNirdeshika, openPrograms, openYojana, openHome, openExtra]);

  // Fetch live data for complaints and notifications
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        // Fetch all complaints and filter client-side to avoid composite index requirement
        const complaintsRef = collection(db, 'complaints');
        const allComplaintsSnapshot = await getDocs(complaintsRef);
        const pendingCount = allComplaintsSnapshot.docs.filter(
          doc => doc.data().status === 'Pending'
        ).length;
        setPendingComplaints(pendingCount);

        // Fetch notifications (check if there's a notifications collection, otherwise use messages)
        try {
          const notificationsRef = collection(db, 'notifications');
          const notificationsSnapshot = await getDocs(notificationsRef);
          // Count unread notifications or all notifications
          const unreadCount = notificationsSnapshot.docs.filter(
            doc => !doc.data().read || doc.data().read === false
          ).length;
          setNotifications(unreadCount || notificationsSnapshot.size);
        } catch (error) {
          // If notifications collection doesn't exist, try messages
          try {
            const messagesRef = collection(db, 'home');
            const messagesDoc = await getDocs(messagesRef);
            if (!messagesDoc.empty) {
              // Count new messages or use a default
              setNotifications(messagesDoc.size);
            }
          } catch (err) {
            console.warn('Could not fetch notifications:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching live data:', error);
      }
    };

    fetchLiveData();
    
    // Set up real-time listener - refresh every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if signOut fails
      navigate('/admin/login');
    }
  };

  const isActive = (path) => location.pathname.startsWith(path);
  
  const menuItems = [
    { text: 'माहिती', icon: <InfoIcon />, path: '/admin/manage/info' },
    { text: 'नकाशा', icon: <MapIcon />, path: '/admin/manage/map' },
    { text: 'सदस्य', icon: <PeopleIcon />, path: '/admin/manage/members' },
    { text: 'ग्रामसभेचे निर्णय', icon: <GavelIcon />, path: '/admin/manage/decisions' },
    { text: 'पुरस्कार', icon: <EmojiEventsIcon />, path: '/admin/manage/awards' },
    { text: 'सण/उत्सव', icon: <CelebrationIcon />, path: '/admin/manage/festivals' },
    { text: 'सुविधा', icon: <HomeWorkIcon />, path: '/admin/manage/facilities' },
    { text: 'ई-सेवा', icon: <LanguageIcon />, path: '/admin/manage/eseva' },
    { text: 'पर्यटन सथळे', icon: <TourIcon />, path: '/admin/manage/tourism' },
  ];

  const programItems = [
    { text: 'स्वच्छ गाव', icon: <NatureIcon />, path: '/admin/program/svachh-gaav' },
    { text: 'विकल-ते-पिकेल', icon: <BusinessIcon />, path: '/admin/program/vikel-te-pikel' },
    { text: 'माझे-कुटुंब माझी-जबाबदारी', icon: <FamilyRestroomIcon />, path: '/admin/program/maajhe-kutumb' },
    { text: 'तंटामुक्त गाव', icon: <GavelIcon />, path: '/admin/program/tantamukt-gaav' },
    { text: 'जलयुक्त शिवार', icon: <WaterIcon />, path: '/admin/program/jalyukt-shivar' },
    { text: 'तुषारगावड', icon: <WaterDropIcon />, path: '/admin/program/tushargaavad' },
    { text: 'रोती पूरक व्यवसाय', icon: <WorkIcon />, path: '/admin/program/roti-poorak' },
    { text: 'गादोली', icon: <EventIcon />, path: '/admin/program/gadoli' },
    { text: 'मतदार नोंदणी', icon: <HowToVoteIcon />, path: '/admin/program/matdaar-nondani' },
    { text: 'सर्व शिक्षा अभियान', icon: <SchoolIcon />, path: '/admin/program/sarva-shiksha' },
    { text: 'क्रीडा स्पर्धा', icon: <SportsIcon />, path: '/admin/program/kreeda-spardha' },
    { text: 'आरोग्य शिबिर', icon: <HealthAndSafetyIcon />, path: '/admin/program/aarogya-shibir' },
    { text: 'कचऱ्याचे नियोजन', icon: <RecyclingIcon />, path: '/admin/program/kachryache-niyojan' },
    { text: 'बायोगॅस निर्मिती', icon: <AgricultureIcon />, path: '/admin/program/biogas-nirmiti' },
    { text: 'सेंद्रिय खत निर्मिती', icon: <AgricultureIcon />, path: '/admin/program/sendriya-khat' },
  ];

  const yojanaItems = [
    { text: 'राज्य सरकार योजना', icon: <AssignmentIcon />, path: '/admin/yojana/state' },
    { text: 'केंद्र सरकार योजना', icon: <AssignmentIcon />, path: '/admin/yojana/central' },
  ];

  const homePageItems = [
    { text: 'नेव्हबार', icon: <DashboardIcon />, path: '/admin/home/navbar' },
    { text: 'वेलकम सेक्शन', icon: <HomeIcon />, path: '/admin/home/welcome' },
    { text: 'फोटो सेक्शन', icon: <ImageIcon />, path: '/admin/home/photos' },
    { text: 'राज्य गीत', icon: <MusicNoteIcon />, path: '/admin/home/rajya-geet' },
    { text: 'संदेश', icon: <ChatIcon />, path: '/admin/home/messages' },
    { text: 'सदस्य', icon: <PeopleIcon />, path: '/admin/home/members' },
    { text: 'ग्रामपंचायत माहिती', icon: <InfoIcon />, path: '/admin/home/info' },
    { text: 'डिजिटल घोषवाक्य', icon: <ArticleIcon />, path: '/admin/home/digital-slogans' },
    { text: 'शासकीय लोगो', icon: <LanguageIcon />, path: '/admin/home/gov-logos' },
    { text: 'फूटर', icon: <ArticleIcon />, path: '/admin/home/footer' },
  ];

  const extraItems = [
    { text: 'प्रगत शेतकरी', icon: <StarIcon />, path: '/admin/extra/pragat-shetkari' },
    { text: 'ई-शिक्षण', icon: <SchoolOutlinedIcon />, path: '/admin/extra/e-shikshan' },
    { text: 'बातम्या', icon: <ArticleIcon />, path: '/admin/extra/batmya' },
    { text: 'संपर्क', icon: <ContactMailIcon />, path: '/admin/extra/sampark' },
  ];

  const filterItems = (items) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const drawerContent = (
    <>
      {/* Header */}
      <Toolbar sx={{ 
        background: '#ffffff', 
        borderBottom: '1px solid #e0e0e0',
        minHeight: '80px !important'
      }}>
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 1.5,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: '#ffffff',
            fontWeight: 'bold'
          }}
        >
          GP
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Admin Panel
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            ग्रामपंचायत व्यवस्थापन
          </Typography>
        </Box>
        <Tooltip title="Settings">
          <IconButton size="small" sx={{ color: '#1976d2' }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* Search Bar */}
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        borderBottom: '1px solid #e0e0e0' 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#f5f5f5',
          borderRadius: 2,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 0.75, sm: 1 },
          border: '1px solid #e0e0e0',
          transition: 'all 0.2s',
          '&:focus-within': {
            borderColor: '#1976d2',
            background: '#ffffff'
          }
        }}>
          <SearchIcon sx={{ 
            mr: 1, 
            color: '#666',
            fontSize: { xs: '18px', sm: '20px' }
          }} />
          <input
            type="text"
            placeholder="शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#1a1a1a',
              outline: 'none',
              width: '100%',
              fontSize: '14px'
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#e0e0e0' }} />

      {/* Main Navigation */}
      <Box sx={{ 
        overflow: 'auto', 
        p: 1, 
        flex: 1,
        '& .MuiListItemButton-root': { 
          borderRadius: 2, 
          mb: 0.5,
          transition: 'all 0.2s',
          color: '#1a1a1a',
          '&:hover': { 
            background: '#f5f5f5',
            transform: 'translateX(4px)'
          }
        },
        '& .MuiListItemButton-root.Mui-selected': { 
          background: '#e3f2fd',
          borderLeft: '3px solid #1976d2',
          color: '#1976d2',
          '&:hover': {
            background: '#bbdefb',
          }
        },
        '& .MuiListItemIcon-root': { 
          minWidth: 40,
          color: 'inherit'
        },
        '& .MuiListItemText-primary': {
          fontSize: '0.9rem',
          color: 'inherit',
          fontWeight: 500
        },
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          background: '#f5f5f5'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#bdbdbd',
          borderRadius: '3px',
          '&:hover': {
            background: '#9e9e9e'
          }
        }
      }}>
        <List>
          {/* Quick Stats Cards */}
          <Box sx={{ px: { xs: 0.5, sm: 1 }, mb: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: { xs: 0.75, sm: 1 },
              mb: { xs: 1.5, sm: 2 }
            }}>
              <Tooltip title="Pending Complaints">
                <Box sx={{ 
                  background: '#fff3e0',
                  borderRadius: 2,
                  p: { xs: 1, sm: 1.5 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #ffe0b2',
                  '&:hover': {
                    background: '#ffe0b2',
                    transform: 'scale(1.05)'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}>
                  <AssignmentIcon sx={{ 
                    fontSize: { xs: 20, sm: 24 }, 
                    mb: { xs: 0.25, sm: 0.5 }, 
                    color: '#f57c00' 
                  }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#1a1a1a',
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}>
                    {pendingComplaints}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#666',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    तक्रारी
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Notifications">
                <Box sx={{ 
                  background: '#e3f2fd',
                  borderRadius: 2,
                  p: { xs: 1, sm: 1.5 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #bbdefb',
                  '&:hover': {
                    background: '#bbdefb',
                    transform: 'scale(1.05)'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}>
                  <NotificationsIcon sx={{ 
                    fontSize: { xs: 20, sm: 24 }, 
                    mb: { xs: 0.25, sm: 0.5 }, 
                    color: '#1976d2' 
                  }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#1a1a1a',
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}>
                    {notifications}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#666',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    सूचना
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </Box>

          {/* Main Menu Items */}
          <ListItem disablePadding component={Link} to="/admin/panel">
            <ListItemButton selected={isActive('/admin/panel')}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="डॅशबोर्ड" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding component={Link} to="/admin/profile">
            <ListItemButton selected={isActive('/admin/profile')}>
              <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
              <ListItemText primary="ग्रामपंचायत प्रोफाइल" />
            </ListItemButton>
          </ListItem>

          {/* Budget Section */}
          <ListItem disablePadding component={Link} to="/admin/budget">
            <ListItemButton selected={isActive('/admin/budget')}>
              <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
              <ListItemText primary="अर्थसंकल्प आणि पारदर्शकता" />
              <Chip label="नवीन" size="small" sx={{ 
                background: '#1976d2',
                color: 'white',
                fontSize: '0.7rem',
                height: 20,
                fontWeight: 600
              }} />
            </ListItemButton>
          </ListItem>

          {/* Grampanchayat Management */}
          <ListItemButton onClick={() => setOpenGrampanchayat(!openGrampanchayat)}>
            <ListItemIcon><DescriptionIcon /></ListItemIcon>
            <ListItemText primary="ग्रामपंचायत व्यवस्थापन" />
            {openGrampanchayat ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openGrampanchayat} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {filterItems(menuItems).map((item) => (
                <ListItem key={item.text} disablePadding component={Link} to={item.path}>
                  <ListItemButton sx={{ pl: 4 }} selected={isActive(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Home Page Section */}
          <ListItemButton onClick={() => setOpenHome(!openHome)}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="होम पेज" />
            {openHome ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openHome} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {filterItems(homePageItems).map((item) => (
                <ListItem key={item.path} disablePadding component={Link} to={item.path}>
                  <ListItemButton sx={{ pl: 4 }} selected={isActive(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Nirdeshika Section */}
          <ListItemButton onClick={() => setOpenNirdeshika(!openNirdeshika)}>
            <ListItemIcon><DescriptionIcon /></ListItemIcon>
            <ListItemText primary="निर्देशिका" />
            {openNirdeshika ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openNirdeshika} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding component={Link} to="/admin/manage-nirdeshika/janaganana">
                <ListItemButton sx={{ pl: 4 }} selected={isActive('/admin/manage-nirdeshika/janaganana')}>
                  <ListItemIcon><ListAltIcon /></ListItemIcon>
                  <ListItemText primary="जनगणना" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding component={Link} to="/admin/manage-nirdeshika/contacts">
                <ListItemButton sx={{ pl: 4 }} selected={isActive('/admin/manage-nirdeshika/contacts')}>
                  <ListItemIcon><ContactPhoneIcon /></ListItemIcon>
                  <ListItemText primary="दूरध्वनी क्रमांक" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding component={Link} to="/admin/manage-nirdeshika/helpline">
                <ListItemButton sx={{ pl: 4 }} selected={isActive('/admin/manage-nirdeshika/helpline')}>
                  <ListItemIcon><HelpOutlineIcon /></ListItemIcon>
                  <ListItemText primary="हेल्पलाईन" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding component={Link} to="/admin/manage-nirdeshika/hospitals">
                <ListItemButton sx={{ pl: 4 }} selected={isActive('/admin/manage-nirdeshika/hospitals')}>
                  <ListItemIcon><LocalHospitalIcon /></ListItemIcon>
                  <ListItemText primary="रुग्णालय" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Programs Section */}
          <ListItemButton onClick={() => setOpenPrograms(!openPrograms)}>
            <ListItemIcon><NatureIcon /></ListItemIcon>
            <ListItemText primary="कार्यक्रम व्यवस्थापन" />
            {openPrograms ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openPrograms} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {filterItems(programItems).map((item) => (
                <ListItem key={item.text} disablePadding component={Link} to={item.path}>
                  <ListItemButton sx={{ pl: 4 }} selected={isActive(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Yojana Section */}
          <ListItemButton onClick={() => setOpenYojana(!openYojana)}>
            <ListItemIcon><AssignmentIcon /></ListItemIcon>
            <ListItemText primary="योजना" />
            {openYojana ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openYojana} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {filterItems(yojanaItems).map((item) => (
                <ListItem key={item.text} disablePadding component={Link} to={item.path}>
                  <ListItemButton sx={{ pl: 4 }} selected={isActive(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Extra Section */}
          <ListItemButton onClick={() => setOpenExtra(!openExtra)}>
            <ListItemIcon><DescriptionIcon /></ListItemIcon>
            <ListItemText primary="इतर" />
            {openExtra ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openExtra} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {filterItems(extraItems).map((item) => (
                <ListItem key={item.text} disablePadding component={Link} to={item.path}>
                  <ListItemButton sx={{ pl: 4 }} selected={isActive(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          {/* Complaint Management with Badge */}
          <ListItem disablePadding component={Link} to="/admin/manage/complaints">
            <ListItemButton selected={isActive('/admin/manage/complaints')}>
              <ListItemIcon>
                <Badge badgeContent={pendingComplaints} 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: '#f57c00',
                      color: 'white' 
                    } 
                  }}>
                  <AssignmentIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="तक्रार व्यवस्थापन" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        borderTop: '1px solid #e0e0e0',
        background: '#fafafa'
      }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{
              color: '#d32f2f',
              '&:hover': {
                background: '#ffebee',
                color: '#c62828'
              }
            }}>
              <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="लॉग आउट" />
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Version 2.0 • © 2024
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: { xs: '85%', sm: drawerWidth },
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            color: '#1a1a1a',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            color: '#1a1a1a',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;