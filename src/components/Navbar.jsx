import React, { useState, useEffect, useRef } from "react";
import { Button } from '@mui/material';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { translatePage, restoreOriginalText, applyStoredTranslations, getTranslationState, setupAutoTranslation, retranslatePage } from '../utils/translationService';

// Mock Link component
const Link = ({ to, children, ...props }) => (
  <a href={to} {...props} style={{ textDecoration: 'none', ...props.style }}>
    {children}
  </a>
);

// Mock useLocation hook
const useLocation = () => ({ pathname: "/" });

// Translation dictionary
const translations = {
  mr: {
    "मुख्य पृष्ठ": "मुख्य पृष्ठ",
    "ग्रामपंचायत": "ग्रामपंचायत",
    "माहिती": "माहिती",
    "नकाशा": "नकाशा",
    "सदस्य": "सदस्य",
    "ग्रामसभेचे निर्णय": "ग्रामसभेचे निर्णय",
    "पुरस्कार": "पुरस्कार",
    "कार्यक्रम": "कार्यक्रम",
    "सुविधा": "सुविधा",
    "ई-सेवा": "ई-सेवा",
    "पर्यटन सथळे": "पर्यटन सथळे",
    "निर्देशिका": "निर्देशिका",
    "जनगणना": "जनगणना",
    "दूरध्वनी क्रमांक": "दूरध्वनी क्रमांक",
    "हेल्पलाईन": "हेल्पलाईन",
    "रुग्णालय": "रुग्णालय",
    "उपक्रम": "उपक्रम",
    "स्वच्छ गाव": "स्वच्छ गाव",
    "विकेल-ते-पिकेल": "विकेल-ते-पिकेल",
    "माझे-कुटुंब माझी-जबाबदारी": "माझे-कुटुंब माझी-जबाबदारी",
    "तंटामुक्त गाव": "तंटामुक्त गाव",
    "जलयुक्त शिवार": "जलयुक्त शिवार",
    "तुषारगावड": "तुषारगावड",
    "रोती पूरक व्यवसाय": "रोती पूरक व्यवसाय",
    "गादोली": "गादोली",
    "मतदार नोंदणी": "मतदार नोंदणी",
    "सर्व शिक्षा अभियान": "सर्व शिक्षा अभियान",
    "क्रीडा स्पर्धा": "क्रीडा स्पर्धा",
    "आरोग्य शिबिर": "आरोग्य शिबिर",
    "कचऱ्याचे नियोजन": "कचऱ्याचे नियोजन",
    "बायोगॅस निर्मिती": "बायोगॅस निर्मिती",
    "सेंद्रिय खत निर्मिती": "सेंद्रिय खत निर्मिती",
    "योजना": "योजना",
    "राज्य सरकार योजना": "राज्य सरकार योजना",
    "केंद्र सरकार योजना": "केंद्र सरकार योजना",
    "प्रगत शेतकरी": "प्रगत शेतकरी",
    "ई-शिक्षण": "ई-शिक्षण",
    "बातम्या": "बातम्या",
    "संपर्क": "संपर्क",
    "तक्रार नोंदणी": "तक्रार नोंदणी",
    "मेनू": "मेनू",
    "शोधा...": "शोधा...",
    "कोणतेही परिणाम सापडले नाहीत": "कोणतेही परिणाम सापडले नाहीत",
    "मुख्य": "मुख्य"
  },
  en: {
    "मुख्य पृष्ठ": "Home",
    "ग्रामपंचायत": "Gram Panchayat",
    "माहिती": "Information",
    "नकाशा": "Map",
    "सदस्य": "Members",
    "ग्रामसभेचे निर्णय": "Gram Sabha Decisions",
    "पुरस्कार": "Awards",
    "कार्यक्रम": "Programs",
    "सुविधा": "Facilities",
    "ई-सेवा": "E-Services",
    "पर्यटन सथळे": "Tourist Places",
    "निर्देशिका": "Directory",
    "जनगणना": "Census",
    "दूरध्वनी क्रमांक": "Phone Numbers",
    "हेल्पलाईन": "Helpline",
    "रुग्णालय": "Hospital",
    "उपक्रम": "Initiatives",
    "स्वच्छ गाव": "Clean Village",
    "विकेल-ते-पिकेल": "Sell-to-Buy",
    "माझे-कुटुंब माझी-जबाबदारी": "My Family My Responsibility",
    "तंटामुक्त गाव": "Conflict Free Village",
    "जलयुक्त शिवार": "Water Enriched Area",
    "तुषारगावड": "Tushar Gaon",
    "रोती पूरक व्यवसाय": "Supplementary Business",
    "गादोली": "Gadoli",
    "मतदार नोंदणी": "Voter Registration",
    "सर्व शिक्षा अभियान": "Education For All",
    "क्रीडा स्पर्धा": "Sports Competition",
    "आरोग्य शिबिर": "Health Camp",
    "कचऱ्याचे नियोजन": "Waste Management",
    "बायोगॅस निर्मिती": "Biogas Production",
    "सेंद्रिय खत निर्मिती": "Organic Fertilizer Production",
    "योजना": "Schemes",
    "राज्य सरकार योजना": "State Government Schemes",
    "केंद्र सरकार योजना": "Central Government Schemes",
    "प्रगत शेतकरी": "Progressive Farmer",
    "ई-शिक्षण": "E-Learning",
    "बातम्या": "News",
    "संपर्क": "Contact",
    "तक्रार नोंदणी": "Complaint Registration",
    "मेनू": "Menu",
    "शोधा...": "Search...",
    "कोणतेही परिणाम सापडले नाहीत": "No results found",
    "मुख्य": "Main"
  }
};

// NLP Search: Synonyms and keywords for better matching
const searchSynonyms = {
  mr: {
    "माहिती": ["माहिती", "विवरण", "डेटा", "तपशील"],
    "नकाशा": ["नकाशा", "मॅप", "स्थान"],
    "सदस्य": ["सदस्य", "सभासद", "प्रतिनिधी"],
    "पुरस्कार": ["पुरस्कार", "बक्षीस", "सन्मान"],
    "कार्यक्रम": ["कार्यक्रम", "सण", "उत्सव", "इव्हेंट"],
    "जनगणना": ["जनगणना", "लोकसंख्या", "सर्वेक्षण"],
    "दूरध्वनी": ["दूरध्वनी", "फोन", "नंबर", "संपर्क"],
    "रुग्णालय": ["रुग्णालय", "हॉस्पिटल", "आरोग्य", "उपचार"],
    "योजना": ["योजना", "स्कीम", "प्रकल्प"],
    "शेतकरी": ["शेतकरी", "शेती", "कृषी", "farmer"],
    "शिक्षण": ["शिक्षण", "अध्ययन", "शिक्षा", "education"],
    "बातम्या": ["बातम्या", "न्यूज", "समाचार", "news"],
    "संपर्क": ["संपर्क", "contact", "फोन", "पत्ता"],
    "तक्रार": ["तक्रार", "complaint", "समस्या", "issue"]
  },
  en: {
    "information": ["information", "info", "details", "data"],
    "map": ["map", "location", "nakasha"],
    "members": ["members", "representatives", "sadasya"],
    "awards": ["awards", "prizes", "puraskaar"],
    "programs": ["programs", "events", "karyakram", "festivals"],
    "census": ["census", "population", "survey"],
    "phone": ["phone", "contact", "number", "durdhvani"],
    "hospital": ["hospital", "health", "rugnalaya"],
    "schemes": ["schemes", "yojana", "projects"],
    "farmer": ["farmer", "agriculture", "shetkari"],
    "education": ["education", "learning", "shikshan"],
    "news": ["news", "batmya", "updates"],
    "contact": ["contact", "sampark", "phone"],
    "complaint": ["complaint", "takrar", "issue"]
  }
};

const translate = (text, lang) => {
  return translations[lang][text] || text;
};

// Advanced NLP search with fuzzy matching and synonym support
const nlpSearch = (query, items, language) => {
  if (!query || query.trim() === "") return [];

  const queryLower = query.toLowerCase().trim();
  const words = queryLower.split(/\s+/);
  
  const scored = items.map(item => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const categoryLower = item.category.toLowerCase();
    const fullTextLower = item.fullText.toLowerCase();
    
    // Exact match - highest score
    if (titleLower === queryLower) score += 100;
    if (categoryLower === queryLower) score += 80;
    
    // Starts with query
    if (titleLower.startsWith(queryLower)) score += 70;
    if (categoryLower.startsWith(queryLower)) score += 50;
    
    // Contains query
    if (titleLower.includes(queryLower)) score += 40;
    if (fullTextLower.includes(queryLower)) score += 30;
    
    // Word-by-word matching
    words.forEach(word => {
      if (titleLower.includes(word)) score += 20;
      if (categoryLower.includes(word)) score += 15;
      
      // Check synonyms
      const langSynonyms = searchSynonyms[language === "mr" ? "mr" : "en"];
      Object.entries(langSynonyms).forEach(([key, synonyms]) => {
        if (synonyms.some(syn => syn.includes(word) || word.includes(syn))) {
          if (titleLower.includes(key) || categoryLower.includes(key)) {
            score += 25;
          }
        }
      });
    });
    
    // Fuzzy matching - allow 1-2 character differences
    const levenshteinDistance = (s1, s2) => {
      const len1 = s1.length, len2 = s2.length;
      const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
      
      for (let i = 0; i <= len1; i++) matrix[i][0] = i;
      for (let j = 0; j <= len2; j++) matrix[0][j] = j;
      
      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
      return matrix[len1][len2];
    };
    
    const distance = levenshteinDistance(queryLower, titleLower);
    if (distance <= 2) score += 35 - (distance * 10);
    
    return { ...item, score };
  });
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
};

// Normalize paths
const isPathMatch = (locationPath, parentName, itemName) => {
  if (parentName === "ग्रामपंचायत" && itemName === "कार्यक्रम") {
    return locationPath === "/ग्रामपंचायत-सण-उत्सव";
  }
  
  const normalizeDash = str => str.replace(/[\s\/]+/g, "-");
  const normalizeConcat = str => str.replace(/\s+/g, "");
  const normalizeSpace = str => str;
  const dashed = `/${normalizeDash(parentName)}-${normalizeDash(itemName)}`;
  const concat = `/${normalizeConcat(parentName)}${normalizeConcat(itemName)}`;
  const space = `/${normalizeSpace(parentName)} ${normalizeSpace(itemName)}`;
  return locationPath === dashed || locationPath === concat || locationPath === space;
};

const getLinkPath = (parentName, itemName) => {
  if (parentName === "ग्रामपंचायत" && itemName === "कार्यक्रम") {
    return "/ग्रामपंचायत-सण-उत्सव";
  }
  return `/${parentName.replace(/[\s\/]+/g, "-")}-${itemName.replace(/[\s\/]+/g, "-")}`;
};

// Dropdown Button
const DropdownButton = ({ title, anchor, handleOpen, handleClose, items, parentName, location, language }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => {
        setIsHovered(true);
        handleOpen({ currentTarget: document.activeElement });
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        handleClose();
      }}
    >
      <button
        onClick={handleOpen}
        style={{
          background: 'none',
          border: 'none',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: items.some(item => isPathMatch(location.pathname, parentName, item)) ? "#2196f3" : "black",
          borderBottom: items.some(item => isPathMatch(location.pathname, parentName, item)) ? "2px solid #f32121ff" : "none",
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        {translate(title, language)}
        <span style={{
          fontSize: "20px",
          transition: "transform 0.3s",
          transform: anchor ? "rotate(180deg)" : "rotate(0deg)",
        }}>▼</span>
      </button>

      {anchor && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'white',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            padding: '8px 0',
            minWidth: '200px',
            zIndex: 1000,
            animation: 'slideDown 0.3s ease-out',
            border: '1px solid #e0e0e0'
          }}
        >
          {items.map((item, index) => (
            <Link
              key={index}
              to={getLinkPath(parentName, item)}
              style={{
                display: 'block',
                padding: '12px 20px',
                color: isPathMatch(location.pathname, parentName, item) ? '#2196f3' : '#333',
                background: isPathMatch(location.pathname, parentName, item) ? '#f0f8ff' : 'transparent',
                transition: 'all 0.2s ease',
                borderLeft: isPathMatch(location.pathname, parentName, item) ? '4px solid #2196f3' : '4px solid transparent'
              }}
              onClick={handleClose}
              onMouseEnter={(e) => {
                if (!isPathMatch(location.pathname, parentName, item)) {
                  e.target.style.background = '#f5f5f5';
                  e.target.style.color = '#2196f3';
                  e.target.style.transform = 'translateX(8px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPathMatch(location.pathname, parentName, item)) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#333';
                  e.target.style.transform = 'translateX(0)';
                }
              }}
            >
              {translate(item, language)}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// Mobile Menu
const MobileMenu = ({ isOpen, onClose, navLinks, location, language }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '280px',
      height: '100vh',
      background: '#f8f9fa',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
      zIndex: 2000,
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #ddd',
        background: 'white'
      }}>
        <h3 style={{ margin: 0, color: 'black' }}>{translate("मेनू", language)}</h3>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '20px 0' }}>
        {navLinks.map((link, i) => (
          <div key={i}>
            {link.dropdown ? (
              <div>
                <button
                  onClick={() => setOpenDropdown(openDropdown === link.name ? null : link.name)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '12px 20px',
                    textAlign: 'left',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'black'
                  }}
                >
                  {translate(link.name, language)}
                  <span style={{
                    transition: 'transform 0.3s',
                    transform: openDropdown === link.name ? 'rotate(180deg)' : 'rotate(0)'
                  }}>▼</span>
                </button>
                {openDropdown === link.name && (
                  <div style={{ background: '#f0f0f0' }}>
                    {link.dropdown.map((item, j) => (
                      <Link
                        key={j}
                        to={getLinkPath(link.name, item)}
                        onClick={onClose}
                        style={{
                          display: 'block',
                          padding: '10px 40px',
                          color: isPathMatch(location.pathname, link.name, item) ? '#2196f3' : '#666',
                          fontWeight: isPathMatch(location.pathname, link.name, item) ? 'bold' : 'normal'
                        }}
                      >
                        {translate(item, language)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={link.to}
                onClick={onClose}
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontWeight: location.pathname === link.to ? 'bold' : 'normal',
                  color: location.pathname === link.to ? '#2196f3' : 'black'
                }}
              >
                {translate(link.name, language)}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  const [grampanchayatName, setGrampanchayatName] = useState("ग्रामपंचायत नाव");
  const [language, setLanguage] = useState(() => {
    // Check if page was previously translated
    const state = getTranslationState();
    return state.currentLanguage || "mr";
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [grampanchayatAnchor, setGrampanchayatAnchor] = useState(null);
  const [directoryAnchor, setDirectoryAnchor] = useState(null);
  const [upkramAnchor, setUpkramAnchor] = useState(null);
  const [yojnaAnchor, setYojnaAnchor] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchInputRef = useRef(null);
  const location = useLocation();

  // Fetch Gram Panchayat name from Firestore
  useEffect(() => {
    const fetchGpName = async () => {
      const docRef = doc(db, 'grampanchayat', 'profile');
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGrampanchayatName(docSnap.data().title || "ग्रामपंचायत नाव");
        }
      } catch (error) {
        console.error("Error fetching Gram Panchayat name:", error);
      }
    };
    fetchGpName();
  }, []);

  // Initialize translation state on mount and apply to current page
  useEffect(() => {
    const state = getTranslationState();
    if (state.isTranslated && state.currentLanguage === 'en') {
      // Page was previously translated, apply stored translations
      setLanguage('en');
      // Wait for DOM to be ready, then apply translations
      setTimeout(() => {
        applyStoredTranslations();
        setupAutoTranslation();
      }, 500);
    }
  }, []);

  // Listen for route changes and apply translations
  useEffect(() => {
    const handleRouteChange = () => {
      const state = getTranslationState();
      if (state.isTranslated && state.currentLanguage === 'en') {
        // Wait for React to render new content
        setTimeout(() => {
          applyStoredTranslations();
        }, 300);
      }
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const navLinks = [
    { name: "मुख्य पृष्ठ", to: "/" },
    { name: "ग्रामपंचायत", dropdown: ["माहिती", "नकाशा", "सदस्य", "ग्रामसभेचे निर्णय", "पुरस्कार", "कार्यक्रम", "सुविधा", "ई-सेवा", "पर्यटन सथळे"] },
    { name: "निर्देशिका", dropdown: ["जनगणना", "दूरध्वनी क्रमांक", "हेल्पलाईन", "रुग्णालय"] },
    { name: "उपक्रम", dropdown: ["स्वच्छ गाव", "विकेल-ते-पिकेल", "माझे-कुटुंब माझी-जबाबदारी", "तंटामुक्त गाव", "जलयुक्त शिवार", "तुषारगावड", "रोती पूरक व्यवसाय", "गादोली", "मतदार नोंदणी", "सर्व शिक्षा अभियान", "क्रीडा स्पर्धा", "आरोग्य शिबिर", "कचऱ्याचे नियोजन", "बायोगॅस निर्मिती", "सेंद्रिय खत निर्मिती"] },
    { name: "योजना", dropdown: ["राज्य सरकार योजना", "केंद्र सरकार योजना"] },
    { name: "प्रगत शेतकरी", to: "/pragat-shetkari" },
    { name: "ई-शिक्षण", to: "/e-shikshan" },
    { name: "बातम्या", to: "/batmya" },
    { name: "संपर्क", to: "/sampark" },
    { name: "तक्रार नोंदणी", to: "/तक्रार-नोंदणी" },
    { name: "अर्थसंकल्प आणि पारदर्शकता", to: "/अर्थसंकल्प-पारदर्शकता" }
  ];

  // Create searchable items array
  const searchableItems = navLinks.flatMap((link) =>
    link.dropdown
      ? link.dropdown.map((item) => ({
          title: item,
          category: link.name,
          path: getLinkPath(link.name, item),
          fullText: `${link.name} - ${item}`
        }))
      : [{ title: link.name, category: "मुख्य", path: link.to, fullText: link.name }]
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCloseAllDropdowns = () => {
    setGrampanchayatAnchor(null);
    setDirectoryAnchor(null);
    setUpkramAnchor(null);
    setYojnaAnchor(null);
  };

  const toggleLanguage = async () => {
    if (isTranslating) return; // Prevent multiple simultaneous translations
    
    setIsTranslating(true);
    const newLanguage = language === "mr" ? "en" : "mr";
    
    try {
      if (newLanguage === "en") {
        // Translate page to English (includes static content) - immediate
        await translatePage('mr', 'en');
        
        // Quick follow-up for Firebase data (reduced delays)
        setTimeout(() => {
          retranslatePage();
        }, 800); // Reduced from 2000ms
        
        setTimeout(() => {
          retranslatePage();
        }, 2000); // Reduced from 4000ms
      } else {
        // Restore original Marathi text
        restoreOriginalText();
      }
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Language toggle error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOpen = setter => event => { 
    handleCloseAllDropdowns(); 
    setter(event.currentTarget); 
  };
  
  const handleClose = setter => () => setter(null);

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => { 
        if (searchInputRef.current) searchInputRef.current.focus(); 
      }, 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Use NLP search instead of simple filter
    const filtered = nlpSearch(query, searchableItems, language);
    setSearchResults(filtered);
  };

  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        window.location.href = searchResults[selectedIndex].path;
      } else if (searchResults.length > 0) {
        window.location.href = searchResults[0].path;
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  };

  const handleResultClick = (path) => {
    window.location.href = path;
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? `<strong>${part}</strong>` 
        : part
    ).join('');
  };

  return (
    <div>
      {mobileOpen && <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1500 }} onClick={() => setMobileOpen(false)} />}

      <nav style={{
        background: isScrolled ? 'rgba(248, 249, 250, 0.95)' : '#f8f9fa',
        borderBottom: '2px solid #ccc',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          flexWrap: isMobile ? 'nowrap' : 'wrap'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '50px', height: '50px', background: 'linear-gradient(45deg, #3498db, #2196f3)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '18px', animation: 'pulse 2s infinite'
            }}>🏛️</div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'black', margin: 0 }}>{grampanchayatName}</h1>
              <p style={{ fontSize: '12px', color: '#666', margin: 0, fontWeight: '500' }}>Grampanchayat Name</p>
            </div>
          </Link>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
            <Link to="/admin/login" style={{ textDecoration: 'none' }}>
               <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                 Admin Login
              </Button>
             </Link>
            {!isMobile && (
              <div style={{
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center',
                background: searchOpen ? '#fff' : 'transparent', 
                borderRadius: '25px',
                padding: searchOpen ? '8px 16px' : '6px', 
                transition: 'all 0.3s ease',
                width: searchOpen ? '350px' : '40px', 
                cursor: searchOpen ? 'text' : 'pointer', 
                border: searchOpen ? '2px solid #2196f3' : '2px solid transparent',
                boxShadow: searchOpen ? '0 2px 8px rgba(33, 150, 243, 0.2)' : 'none'
              }}>
                <span 
                  onClick={handleSearchToggle} 
                  style={{ 
                    fontSize: '20px', 
                    color: searchOpen ? '#2196f3' : 'black', 
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  🔍
                </span>
                {searchOpen && (
                  <>
                    <input 
                      ref={searchInputRef} 
                      type="text" 
                      value={searchQuery} 
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      placeholder={translate("शोधा...", language)} 
                      style={{ 
                        marginLeft: '12px', 
                        flex: 1, 
                        fontSize: '14px', 
                        color: '#333', 
                        background: 'transparent', 
                        border: 'none', 
                        outline: 'none', 
                        width: '100%',
                        fontFamily: 'inherit'
                      }} 
                    />
                    {searchQuery && (
                      <span
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setSelectedIndex(-1);
                          searchInputRef.current?.focus();
                        }}
                        style={{
                          fontSize: '18px',
                          color: '#999',
                          cursor: 'pointer',
                          padding: '0 4px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#666'}
                        onMouseLeave={(e) => e.target.style.color = '#999'}
                      >
                        ✕
                      </span>
                    )}
                  </>
                )}

                {/* Google-like Search Suggestions */}
                {searchOpen && searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    zIndex: 2000,
                    border: '1px solid #e0e0e0'
                  }}>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => handleResultClick(result.path)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          background: selectedIndex === index ? '#f0f8ff' : 'white',
                          borderLeft: selectedIndex === index ? '3px solid #2196f3' : '3px solid transparent',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}
                      >
                        <span style={{ 
                          fontSize: '16px',
                          opacity: 0.6,
                          flexShrink: 0
                        }}>
                          🔍
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div 
                            style={{ 
                              fontSize: '14px', 
                              color: '#333',
                              fontWeight: selectedIndex === index ? '500' : 'normal',
                              marginBottom: '2px'
                            }}
                            dangerouslySetInnerHTML={{ 
                              __html: highlightMatch(translate(result.title, language), searchQuery) 
                            }}
                          />
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {translate(result.category, language)}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '18px',
                          color: '#ccc',
                          transform: selectedIndex === index ? 'translateX(4px)' : 'translateX(0)',
                          transition: 'transform 0.2s'
                        }}>
                          →
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {searchOpen && searchQuery && searchResults.length === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    padding: '20px',
                    textAlign: 'center',
                    zIndex: 2000,
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {translate("कोणतेही परिणाम सापडले नाहीत", language)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={toggleLanguage} 
              disabled={isTranslating}
              style={{ 
                fontWeight: 'bold', 
                color: 'white', 
                background: isTranslating 
                  ? 'linear-gradient(45deg, #999, #bbb)' 
                  : 'linear-gradient(45deg, #2196f3, #21cbf3)', 
                border: '2px solid transparent', 
                fontSize: isMobile ? '12px' : '14px', 
                padding: isMobile ? '6px 12px' : '8px 16px', 
                borderRadius: '25px', 
                cursor: isTranslating ? 'wait' : 'pointer', 
                transition: 'all 0.3s ease', 
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                opacity: isTranslating ? 0.7 : 1
              }}
            >
              {isTranslating 
                ? (language === "mr" ? "Translating..." : "Restoring...") 
                : (language === "mr" ? "मराठी → English" : "English → मराठी")
              }
            </button>

            {isMobile && <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }}>☰</button>}
          </div>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '10px 20px', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.7)', borderTop: '1px solid #e0e0e0' }}>
            {navLinks.map((link, i) =>
              link.dropdown ? (
                <DropdownButton
                  key={i}
                  title={link.name}
                  anchor={link.name === "ग्रामपंचायत" ? grampanchayatAnchor : link.name === "निर्देशिका" ? directoryAnchor : link.name === "उपक्रम" ? upkramAnchor : yojnaAnchor}
                  handleOpen={link.name === "ग्रामपंचायत" ? handleOpen(setGrampanchayatAnchor) : link.name === "निर्देशिका" ? handleOpen(setDirectoryAnchor) : link.name === "उपक्रम" ? handleOpen(setUpkramAnchor) : handleOpen(setYojnaAnchor)}
                  handleClose={link.name === "ग्रामपंचायत" ? handleClose(setGrampanchayatAnchor) : link.name === "निर्देशिका" ? handleClose(setDirectoryAnchor) : link.name === "उपक्रम" ? handleClose(setUpkramAnchor) : handleClose(setYojnaAnchor)}
                  items={link.dropdown}
                  parentName={link.name}
                  location={location}
                  language={language}
                />
              ) : (
                <Link key={i} to={link.to} style={{
                  textDecoration: 'none', fontWeight: 'bold', fontSize: '16px', padding: '8px 16px', borderRadius: '25px',
                  transition: 'all 0.3s ease', cursor: 'pointer',
                  color: location.pathname === link.to ? 'white' : 'black',
                  background: location.pathname === link.to ? 'linear-gradient(45deg, #2196f3, #21cbf3)' : 'transparent',
                  boxShadow: location.pathname === link.to ? '0 4px 15px rgba(33, 150, 243, 0.3)' : 'none'
                }}>{translate(link.name, language)}</Link>
              )
            )}
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} navLinks={navLinks} location={location} language={language} />
    </div>
  );
};

export default Navbar;
