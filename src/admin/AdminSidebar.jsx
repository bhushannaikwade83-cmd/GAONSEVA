import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Toolbar, Typography, Divider, Collapse, 
  Badge, Tooltip, IconButton, Avatar, Chip 
} from '@mui/material';
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

const AdminSidebar = ({ drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openGrampanchayat, setOpenGrampanchayat] = useState(true);
  const [openNirdeshika, setOpenNirdeshika] = useState(true);
  const [openPrograms, setOpenPrograms] = useState(true);
  const [openYojana, setOpenYojana] = useState(true);
  const [openHome, setOpenHome] = useState(true);
  const [openExtra, setOpenExtra] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingComplaints] = useState(5);
  const [notifications] = useState(3);

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

  const handleLogout = () => {
    navigate('/admin/login');
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

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      {/* Header */}
      <Toolbar sx={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 1.5,
            background: 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)',
            color: '#000000',
            fontWeight: 'bold'
          }}
        >
          GP
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Admin Panel
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            ग्रामपंचायत व्यवस्थापन
          </Typography>
        </Box>
        <Tooltip title="Settings">
          <IconButton size="small" sx={{ color: 'white' }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
          px: 2,
          py: 1
        }}>
          <SearchIcon sx={{ mr: 1, opacity: 0.7 }} />
          <input
            type="text"
            placeholder="शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'white',
              outline: 'none',
              width: '100%',
              fontSize: '14px'
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Main Navigation */}
      <Box sx={{ 
        overflow: 'auto', 
        p: 1, 
        flex: 1,
        '& .MuiListItemButton-root': { 
          borderRadius: 2, 
          mb: 0.5,
          transition: 'all 0.2s',
          '&:hover': { 
            background: 'rgba(255, 255, 255, 0.08)',
            transform: 'translateX(4px)'
          }
        },
        '& .MuiListItemButton-root.Mui-selected': { 
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)',
          borderLeft: '3px solid #ffffff',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
          }
        },
        '& .MuiListItemIcon-root': { 
          minWidth: 40,
          color: 'rgba(255, 255, 255, 0.9)'
        },
        '& .MuiListItemText-primary': {
          fontSize: '0.9rem'
        },
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.03)'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '3px'
        }
      }}>
        <List>
          {/* Quick Stats Cards */}
          <Box sx={{ px: 1, mb: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 1,
              mb: 2
            }}>
              <Tooltip title="Pending Complaints">
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  p: 1.5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    transform: 'scale(1.05)'
                  }
                }}>
                  <AssignmentIcon sx={{ fontSize: 24, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{pendingComplaints}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>तक्रारी</Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Notifications">
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  p: 1.5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    transform: 'scale(1.05)'
                  }
                }}>
                  <NotificationsIcon sx={{ fontSize: 24, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{notifications}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>सूचना</Typography>
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
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '0.7rem',
                height: 20
              }} />
            </ListItemButton>
          </ListItem>

          {/* Analytics Section */}
          <ListItem disablePadding component={Link} to="/admin/analytics">
            <ListItemButton selected={isActive('/admin/analytics')}>
              <ListItemIcon><AnalyticsIcon /></ListItemIcon>
              <ListItemText primary="अहवाल आणि विश्लेषण" />
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
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="लॉग आउट" />
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ p: 2, textAlign: 'center', opacity: 0.6 }}>
          <Typography variant="caption">
            Version 2.0 • © 2024
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;