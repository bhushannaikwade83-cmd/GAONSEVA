import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Maximize2, Minimize2, Sparkles, MessageSquare } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { translateText } from '../utils/translationService';

const GramSevakAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Real-time data cache - automatically updates when backend changes
  const [dataCache, setDataCache] = useState({});
  const unsubscribeRefs = useRef({});

  // Database mapping configuration - LIVE DATA FROM FIREBASE
  const databaseMapping = {
    'grampanchayat-profile': {
      path: 'grampanchayat/profile',
      isDocument: true, // Single document, not collection
      keywords: [
        // Marathi keywords
        'ग्रामपंचायत नाव', 'ग्रामपंचायतीचे नाव', 'नाव काय आहे', 'गावाचे नाव', 'ग्रामपंचायत', 
        'ग्रामपंचायत माहिती', 'ग्रामपंचायतीची माहिती', 'गावाची माहिती',
        // English keywords - comprehensive
        'what is name', 'gram panchayat name', 'village name', 'panchayat name', 
        'name of gram panchayat', 'what is the name', 'panchayat info', 'gram panchayat',
        'what is the name of', 'tell me the name', 'name of village', 'village panchayat name',
        'what is gram panchayat', 'gram panchayat information', 'village information',
        'what is this website', 'what is this village', 'which village', 'which panchayat'
      ],
      fields: ['title', 'name']
    },
    'members': {
      path: 'members',
      keywords: [
        // Marathi keywords
        'सदस्य', 'सरपंच', 'उपसरपंच', 'ग्राम सेवक', 'सदस्यांची यादी', 'ग्रामपंचायत सदस्य', 
        'ग्रामपंचायत सदस्य कोण आहेत', 'ग्राम सेवकाची माहिती', 'सरपंच कोण आहे', 
        'सदस्यांची यादी दाखवा', 'ग्राम सेवक माहिती', 'सरपंच माहिती', 'कोण आहे', 'कोण आहेत',
        // English keywords - comprehensive
        'members', 'gram sevak', 'sarpanch', 'upsarpanch', 'member list', 'who is sarpanch', 
        'gram sevak info', 'members list', 'panchayat members', 'village head', 
        'gram panchayat members', 'leadership', 'who is', 'who are', 'who are the members',
        'tell me members', 'show members', 'list of members', 'who is the sarpanch',
        'who is sarpanch', 'who is the head', 'village head', 'panchayat head',
        'who is gram sevak', 'who is the gram sevak', 'member information', 'members info'
      ],
      fields: ['name', 'designation', 'order', 'imageURL', 'phone', 'email']
    },
    'awards': {
      path: 'awards',
      keywords: [
        'पुरस्कार', 'विजेता', 'award', 'ग्रामपंचायतीला कोणते पुरस्कार मिळाले आहेत',
        'prize', 'recognition', 'achievement', 'honor', 'certificate',
        'पुरस्कार माहिती', 'विजेते', 'यश', 'प्रशस्ती', 'सन्मान'
      ],
      fields: ['title', 'recipient', 'date', 'description']
    },
    'decisions': {
      path: 'decisions',
      keywords: [
        'निर्णय', 'ग्रामसभा', 'ठराव', 'ग्रामसभेचे निर्णय काय आहेत',
        'decision', 'resolution', 'meeting', 'gram sabha', 'panchayat decision',
        'ग्रामसभा निर्णय', 'पंचायत निर्णय', 'ठराव माहिती', 'निर्णय सूची'
      ],
      fields: ['title', 'description', 'date', 'status']
    },
    'eseva': {
      path: 'eseva',
      keywords: [
        'ई-सेवा', 'अर्ज', 'प्रमाणपत्र', 'ऑनलाइन सेवा', 'कोणत्या ई-सेवा उपलब्ध आहेत',
        'e-seva', 'e-service', 'online service', 'application', 'certificate', 'digital service',
        'ई-सेवा माहिती', 'डिजिटल सेवा', 'ऑनलाइन अर्ज', 'प्रमाणपत्र सेवा'
      ],
      fields: ['name', 'type', 'link']
    },
    'aarogyashibir': {
      path: 'program/aarogyashibir/items',
      keywords: [
        'आरोग्य', 'शिबिर', 'डॉक्टर', 'health camp', 'आरोग्य शिबिरांची माहिती द्या',
        'health', 'medical', 'doctor', 'camp', 'healthcare', 'medical camp',
        'आरोग्य सेवा', 'वैद्यकीय शिबिर', 'डॉक्टर माहिती', 'आरोग्य केंद्र'
      ],
      fields: ['title', 'campType', 'campDate', 'doctorName']
    },
    'hospitals': {
      path: 'hospitals',
      keywords: [
        'रुग्णालय', 'हॉस्पिटल', 'आरोग्य केंद्र', 'doctor', 'गावात कोणती रुग्णालये आहेत',
        'hospital', 'medical center', 'health center', 'clinic', 'medical facility'
      ],
      fields: ['name', 'contact', 'type', 'address', 'services']
    },
    'helplines': {
      path: 'helplines',
      keywords: [
        'हेल्पलाईन', 'नंबर', 'police', 'emergency', 'महत्वाचे हेल्पलाईन नंबर सांगा',
        'helpline', 'emergency number', 'police number', 'urgent contact'
      ],
      fields: ['serviceName', 'department', 'number', 'description']
    },
    'tourism': {
      path: 'tourism',
      keywords: [
        'पर्यटन', 'स्थळ', 'temple', 'attraction', 'पर्यटन स्थळांची माहिती द्या',
        'tourism', 'tourist places', 'attractions', 'places to visit', 'मंदिर'
      ],
      fields: ['name', 'type', 'description', 'location']
    },
    'state-yojana': {
      path: 'yojana/state/items',
      keywords: [
        'राज्य सरकार योजना', 'scheme', 'yojana', 'राज्य सरकारच्या योजना कोणत्या आहेत',
        'state government scheme', 'state yojana', 'state scheme'
      ],
      fields: ['title', 'department', 'eligibility', 'benefits']
    },
    'central-yojana': {
      path: 'yojana/central/items',
      keywords: [
        'केंद्र सरकार योजना', 'scheme', 'yojana', 'केंद्र सरकारच्या योजना सांगा',
        'central government scheme', 'central yojana', 'government scheme'
      ],
      fields: ['title', 'department', 'benefits', 'eligibility']
    },
    'batmya': {
      path: 'extra/batmya/items',
      keywords: [
        'बातम्या', 'news', 'घोषणा', 'नवीनतम बातम्या कोणत्या आहेत',
        'announcement', 'latest news', 'village news', 'updates'
      ],
      fields: ['title', 'date', 'content', 'description']
    },
    'contacts': {
      path: 'contacts',
      keywords: [
        'संपर्क', 'contact', 'फोन', 'phone', 'संपर्क माहिती',
        'contact info', 'phone numbers', 'address', 'contact details'
      ],
      fields: ['name', 'designation', 'phone', 'email', 'address']
    },
    'home-info': {
      path: 'home/grampanchayat-info',
      isDocument: true,
      keywords: [
        'ग्रामपंचायत माहिती', 'गावाची माहिती', 'village information', 'gram panchayat info',
        'about village', 'गावाबद्दल', 'ग्रामपंचायत बद्दल', 'details', 'माहिती'
      ],
      fields: ['details', 'gpName', 'photos']
    },
    'home-welcome': {
      path: 'home/welcome',
      isDocument: true,
      keywords: [
        'स्वागत', 'welcome', 'greeting', 'introduction', 'परिचय'
      ],
      fields: ['message', 'stats']
    },
    'budget': {
      path: 'budget',
      keywords: [
        'अर्थसंकल्प', 'बजेट', 'budget', 'financial', 'वित्त', 'finance',
        'बजेट माहिती', 'अर्थसंकल्प माहिती', 'budget information'
      ],
      fields: ['title', 'amount', 'year', 'description']
    },
    'facilities': {
      path: 'facilities',
      keywords: [
        'सुविधा', 'facility', 'facilities', 'amenities', 'सुविधा माहिती',
        'available facilities', 'गावातील सुविधा'
      ],
      fields: ['name', 'type', 'description', 'location']
    },
    'festivals': {
      path: 'festivals',
      keywords: [
        'सण', 'त्योहार', 'festival', 'festivals', 'celebration', 'उत्सव',
        'सण माहिती', 'festival information', 'upcoming festivals'
      ],
      fields: ['name', 'date', 'description', 'type']
    }
  };

  // Language detection - simple but effective
  const detectLanguage = (text) => {
    const marathiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasMarathi = marathiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasMarathi && !hasEnglish) return 'mr';
    if (hasEnglish && !hasMarathi) return 'en';
    if (hasMarathi && hasEnglish) {
      // Count characters to determine dominant language
      const marathiCount = (text.match(/[\u0900-\u097F]/g) || []).length;
      const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
      return marathiCount > englishCount ? 'mr' : 'en';
    }
    return 'en'; // Default to English
  };

  // Translate query to Marathi for better matching (if needed)
  const translateQueryForMatching = async (query, detectedLang) => {
    if (detectedLang === 'mr') {
      return query; // Already in Marathi
    }
    
    try {
      // Translate English query to Marathi for keyword matching
      const translated = await translateText(query, 'en', 'mr');
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return query; // Return original if translation fails
    }
  };

  const quickSuggestions = [
    { icon: '👥', text: 'सरपंच कोण आहे' },
    { icon: '🏆', text: 'पुरस्कार' },
    { icon: '💻', text: 'ई-सेवा' },
    { icon: '🏥', text: 'आरोग्य शिबिर' },
    { icon: '📜', text: 'ग्रामसभा निर्णय' },
    { icon: '🌆', text: 'पर्यटन स्थळे' },
    { icon: '📞', text: 'संपर्क' },
    { icon: '💰', text: 'योजना' }
  ];

  // Set up real-time listeners for all collections and documents - automatically updates when backend changes
  useEffect(() => {
    const setupRealtimeListeners = () => {
      Object.entries(databaseMapping).forEach(([key, config]) => {
        const path = config.path;
        
        // Unsubscribe from previous listener if exists
        if (unsubscribeRefs.current[path]) {
          unsubscribeRefs.current[path]();
        }
        
        // Handle single documents vs collections
        if (config.isDocument) {
          // Single document listener
          const pathParts = path.split('/');
          const docRef = doc(db, ...pathParts);
          
          const unsubscribe = onSnapshot(
            docRef,
            (docSnapshot) => {
              const data = docSnapshot.exists() 
                ? [{ id: docSnapshot.id, ...docSnapshot.data() }]
                : [];
              
              // Update cache with latest data
              setDataCache(prev => ({
                ...prev,
                [path]: {
                  data,
                  lastUpdated: new Date(),
                  isRealTime: true
                }
              }));
              
              console.log(`🔄 Real-time update for document ${path}:`, data.length > 0 ? 'updated' : 'not found');
            },
            (error) => {
              console.error(`❌ Real-time listener error for ${path}:`, error);
              // Fallback to one-time fetch on error
              fetchDataFromFirebase(path, config).then(data => {
                setDataCache(prev => ({
                  ...prev,
                  [path]: {
                    data,
                    lastUpdated: new Date(),
                    isRealTime: false
                  }
                }));
              });
            }
          );
          
          unsubscribeRefs.current[path] = unsubscribe;
        } else {
          // Collection listener
          const pathParts = path.split('/');
          const collectionRef = collection(db, ...pathParts);
          
          let q;
          try {
            if (path === 'members') {
              q = query(collectionRef, orderBy('order', 'asc'));
            } else {
              // Try to order by date, createdAt, timestamp, or order
              const orderFields = ['date', 'createdAt', 'timestamp', 'order'];
              let queryBuilt = false;
              
              for (const orderField of orderFields) {
                try {
                  q = query(collectionRef, orderBy(orderField, 'desc'), limit(50));
                  queryBuilt = true;
                  break;
                } catch {
                  continue;
                }
              }
              
              if (!queryBuilt) {
                q = query(collectionRef, limit(50));
              }
            }
          } catch {
            q = query(collectionRef, limit(50));
          }
          
          // Set up real-time listener
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const data = [];
              snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
              });
              
              // Update cache with latest data
              setDataCache(prev => ({
                ...prev,
                [path]: {
                  data,
                  lastUpdated: new Date(),
                  isRealTime: true
                }
              }));
              
              console.log(`🔄 Real-time update for ${path}:`, data.length, 'items');
            },
            (error) => {
              console.error(`❌ Real-time listener error for ${path}:`, error);
              // Fallback to one-time fetch on error
              fetchDataFromFirebase(path, config).then(data => {
                setDataCache(prev => ({
                  ...prev,
                  [path]: {
                    data,
                    lastUpdated: new Date(),
                    isRealTime: false
                  }
                }));
              });
            }
          );
          
          unsubscribeRefs.current[path] = unsubscribe;
        }
      });
    };
    
    setupRealtimeListeners();
    
    // Cleanup listeners on unmount
    return () => {
      Object.values(unsubscribeRefs.current).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
      unsubscribeRefs.current = {};
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = {
        id: Date.now(),
        text: `नमस्कार! 🙏

मी **GramSevak AI** आहे - आपला डिजिटल ग्राम सेवक!

मी आपल्याला यात मदत करू शकतो:
• ग्रामपंचायत माहिती (Real-time updates)
• सदस्य माहिती (स्वयं अपडेट होते)
• सरकारी योजना
• आरोग्य सेवा
• ई-सेवा
• आणि बरेच काही...

**✨ माझी विशेषता:** मी स्वयंचलितपणे नवीन माहिती अपडेट करतो! जेव्हा बॅकएंडमध्ये बदल होतो, तेव्हा मी ताबडतोब नवीन माहिती दाखवतो.

कृपया खालील सूचनांपैकी एक निवडा किंवा आपला प्रश्न विचारा! 💬`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced query matching with better understanding - handles both English and Marathi
  const findMatchingDatabase = (userQuery) => {
    const queryLower = userQuery.toLowerCase().trim();
    const matches = [];
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    
    // Detect language
    const detectedLang = detectLanguage(userQuery);

    Object.entries(databaseMapping).forEach(([key, config]) => {
      let score = 0;
      
      // Exact match bonus
      config.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        if (queryLower === keywordLower) {
          score += 30; // Exact match
        } else if (queryLower.includes(keywordLower) || keywordLower.includes(queryLower)) {
          score += 15; // Contains match
        } else {
          // Word-by-word matching
          const keywordWords = keywordLower.split(/\s+/);
          queryWords.forEach(qWord => {
            keywordWords.forEach(kWord => {
              if (qWord === kWord && qWord.length > 3) {
                score += 8;
              } else if (kWord.includes(qWord) || qWord.includes(kWord)) {
                score += 4;
              }
            });
          });
        }
      });
      
      // Special patterns for English questions
      if (detectedLang === 'en') {
        // "What is" questions
        if ((queryLower.includes('what is') || queryLower.includes('what\'s')) && queryLower.includes('name')) {
          if (key === 'grampanchayat-profile') score += 25;
        }
        if (queryLower.includes('what is') && (queryLower.includes('gram panchayat') || queryLower.includes('panchayat'))) {
          if (key === 'grampanchayat-profile') score += 20;
        }
        if (queryLower.includes('name of') && (queryLower.includes('gram panchayat') || queryLower.includes('village') || queryLower.includes('panchayat'))) {
          if (key === 'grampanchayat-profile') score += 25;
        }
        if (queryLower.includes('tell me') && queryLower.includes('name')) {
          if (key === 'grampanchayat-profile') score += 15;
        }
        
        // "Who is" questions
        if (queryLower.includes('who is') || queryLower.includes('who are')) {
          if (key === 'members') score += 20;
        }
        
        // "What" questions about website content
        if (queryLower.includes('what') && queryLower.includes('website')) {
          score += 10; // Boost all matches for website questions
        }
        if (queryLower.includes('what') && (queryLower.includes('in') || queryLower.includes('on')) && queryLower.includes('website')) {
          score += 15; // "what is in website" type questions
        }
      }
      
      // Special patterns for Marathi questions
      if (detectedLang === 'mr') {
        if (queryLower.includes('कोण') || queryLower.includes('who')) {
          if (key === 'members') score += 10;
        }
        if (queryLower.includes('नाव') && (queryLower.includes('काय') || queryLower.includes('कोणते'))) {
          if (key === 'grampanchayat-profile') score += 20;
        }
      }
      
      // Common patterns (both languages)
      if (queryLower.includes('किती') || queryLower.includes('how many') || queryLower.includes('list')) {
        score += 5;
      }
      if (queryLower.includes('माहिती') || queryLower.includes('info') || queryLower.includes('information')) {
        score += 5;
      }
      if (queryLower.includes('नवीन') || queryLower.includes('latest') || queryLower.includes('recent')) {
        if (key === 'decisions' || key === 'batmya' || key === 'awards') score += 10;
      }
      
      // Boost for name-related queries
      if (queryLower.includes('name') || queryLower.includes('नाव')) {
        if (key === 'grampanchayat-profile') score += 15;
      }
      
      if (score >= 5) {
        matches.push({ key, config, score });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  };

  // Fetch data from Firebase - uses cached data if available (real-time updated)
  const fetchDataFromFirebase = async (path, config = null, limitCount = 5) => {
    // First check cache - it's automatically updated by real-time listeners
    if (dataCache[path] && dataCache[path].data && dataCache[path].data.length > 0) {
      console.log('📦 Using cached data (real-time updated):', path, dataCache[path].data.length, 'items');
      return dataCache[path].data.slice(0, limitCount);
    }
    
    // Fallback to one-time fetch if cache is empty
    try {
      console.log('🔍 Fetching from Firebase (one-time):', path);
      
      const pathParts = path.split('/');
      
      // Handle single documents
      if (config && config.isDocument) {
        const docRef = doc(db, ...pathParts);
        const docSnapshot = await getDoc(docRef);
        
        const data = docSnapshot.exists() 
          ? [{ id: docSnapshot.id, ...docSnapshot.data() }]
          : [];
        
        // Update cache
        setDataCache(prev => ({
          ...prev,
          [path]: {
            data,
            lastUpdated: new Date(),
            isRealTime: false
          }
        }));
        
        console.log('✅ Fetched document:', data.length > 0 ? 'found' : 'not found');
        return data;
      }
      
      // Handle collections
      const collectionRef = collection(db, ...pathParts);
      let querySnapshot;
      
      if (path === 'members') {
        try {
          const q = query(collectionRef, orderBy('order', 'asc'));
          querySnapshot = await getDocs(q);
        } catch {
          querySnapshot = await getDocs(collectionRef);
        }
      } else {
        const orderFields = ['date', 'createdAt', 'timestamp', 'order'];
        
        for (const orderField of orderFields) {
          try {
            const q = query(collectionRef, orderBy(orderField, 'desc'), limit(limitCount));
            querySnapshot = await getDocs(q);
            if (querySnapshot.size > 0) break;
          } catch {
            continue;
          }
        }
        
        if (!querySnapshot || querySnapshot.size === 0) {
          const simpleQuery = query(collectionRef, limit(limitCount));
          querySnapshot = await getDocs(simpleQuery);
        }
      }
      
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        [path]: {
          data,
          lastUpdated: new Date(),
          isRealTime: false
        }
      }));
      
      console.log('✅ Fetched:', data.length, 'items');
      return data;
    } catch (error) {
      console.error('❌ Firebase Error:', error);
      return [];
    }
  };

  // Format response for members - enhanced with better formatting
  const formatMembersResponse = (data, path) => {
    if (!data || data.length === 0) {
      return "क्षमस्व, सदस्यांची माहिती डेटाबेसमध्ये सध्या उपलब्ध नाही. 😔\n\nकृपया थोड्या वेळानंतर पुन्हा प्रयत्न करा किंवा व्यवस्थापकाशी संपर्क साधा.";
    }

    const cacheInfo = dataCache[path];
    const isRealTime = cacheInfo?.isRealTime;
    const updateInfo = isRealTime ? "🔄 **स्वयं अपडेट होत आहे**" : "";

    let response = `👥 **ग्रामपंचायत सदस्य**\n`;
    response += `📊 एकूण सदस्य: **${data.length}**\n`;
    if (updateInfo) response += `${updateInfo}\n`;
    response += '\n';
    
    data.forEach((member, index) => {
      response += `**${index + 1}. ${member.name || 'नाव उपलब्ध नाही'}**\n`;
      if (member.designation) response += `   🏛️ पद: ${member.designation}\n`;
      if (member.phone) response += `   📞 संपर्क: ${member.phone}\n`;
      if (member.email) response += `   📧 ईमेल: ${member.email}\n`;
      response += '\n';
    });
    
    response += `💡 **टीप:** ही माहिती स्वयंचलितपणे अपडेट होते. जेव्हा बॅकएंडमध्ये बदल होतो, तेव्हा मी ताबडतोब नवीन माहिती दाखवतो.`;
    
    return response;
  };

  // Format response for gram panchayat profile
  const formatGramPanchayatProfileResponse = (data, path) => {
    if (!data || data.length === 0 || !data[0]) {
      return "क्षमस्व, ग्रामपंचायतीचे नाव डेटाबेसमध्ये सध्या उपलब्ध नाही. 😔\n\nकृपया व्यवस्थापकाशी संपर्क साधा.";
    }

    const profile = data[0];
    const cacheInfo = dataCache[path];
    const isRealTime = cacheInfo?.isRealTime;
    const updateInfo = isRealTime ? "🔄 **स्वयं अपडेट होत आहे**" : "";

    const gpName = profile.title || profile.name || 'नाव उपलब्ध नाही';
    
    let response = `🏛️ **ग्रामपंचायत नाव**\n\n`;
    response += `**${gpName}**\n\n`;
    
    if (updateInfo) response += `${updateInfo}\n\n`;
    
    if (profile.description) {
      response += `📝 **माहिती:**\n${profile.description}\n\n`;
    }
    
    response += `💡 **टीप:** ही माहिती स्वयंचलितपणे अपडेट होते. जेव्हा बॅकएंडमध्ये बदल होतो, तेव्हा मी ताबडतोब नवीन माहिती दाखवतो.`;
    
    return response;
  };

  // Format general response - enhanced with better formatting
  const formatResponse = (data, config) => {
    if (!data || data.length === 0) {
      return "क्षमस्व, या विषयाची माहिती डेटाबेसमध्ये सध्या उपलब्ध नाही. 😔\n\nकृपया थोड्या वेळानंतर पुन्हा प्रयत्न करा किंवा व्यवस्थापकाशी संपर्क साधा.";
    }

    if (config.path === 'members') {
      return formatMembersResponse(data, config.path);
    }
    
    if (config.path === 'grampanchayat/profile') {
      return formatGramPanchayatProfileResponse(data, config.path);
    }

    const cacheInfo = dataCache[config.path];
    const isRealTime = cacheInfo?.isRealTime;
    const updateInfo = isRealTime ? "🔄 **स्वयं अपडेट होत आहे**" : "";

    // Get collection name in Marathi
    const collectionNames = {
      'awards': 'पुरस्कार',
      'decisions': 'ग्रामसभा निर्णय',
      'eseva': 'ई-सेवा',
      'aarogyashibir': 'आरोग्य शिबिर',
      'hospitals': 'रुग्णालय',
      'helplines': 'हेल्पलाईन',
      'tourism': 'पर्यटन स्थळे',
      'state-yojana': 'राज्य सरकार योजना',
      'central-yojana': 'केंद्र सरकार योजना',
      'batmya': 'बातम्या',
      'contacts': 'संपर्क माहिती'
    };

    const collectionName = collectionNames[config.path] || 'माहिती';
    let response = `📋 **${collectionName}**\n`;
    response += `📊 एकूण: **${data.length}** माहिती\n`;
    if (updateInfo) response += `${updateInfo}\n`;
    response += '\n';
    
    data.slice(0, 5).forEach((item, index) => {
      response += `**${index + 1}. `;
      if (item.title) response += `${item.title}**\n`;
      else if (item.name) response += `${item.name}**\n`;
      else response += `माहिती ${index + 1}**\n`;
      
      if (item.name && !item.title) response += `   👤 नाव: ${item.name}\n`;
      if (item.description) {
        const desc = item.description.length > 100 
          ? item.description.substring(0, 100) + '...' 
          : item.description;
        response += `   📝 माहिती: ${desc}\n`;
      }
      if (item.date) response += `   📅 तारीख: ${item.date}\n`;
      if (item.designation) response += `   🏛️ पद: ${item.designation}\n`;
      if (item.location) response += `   📍 स्थान: ${item.location}\n`;
      if (item.contact) response += `   📞 संपर्क: ${item.contact}\n`;
      if (item.phone) response += `   📞 फोन: ${item.phone}\n`;
      if (item.email) response += `   📧 ईमेल: ${item.email}\n`;
      if (item.address) response += `   🏠 पत्ता: ${item.address}\n`;
      if (item.doctorName) response += `   👨‍⚕️ डॉक्टर: ${item.doctorName}\n`;
      if (item.campType) response += `   🏥 प्रकार: ${item.campType}\n`;
      if (item.campDate) response += `   📅 तारीख: ${item.campDate}\n`;
      if (item.department) response += `   🏛️ विभाग: ${item.department}\n`;
      if (item.benefits) {
        const benefits = typeof item.benefits === 'string' 
          ? (item.benefits.length > 80 ? item.benefits.substring(0, 80) + '...' : item.benefits)
          : item.benefits;
        response += `   💰 लाभ: ${benefits}\n`;
      }
      if (item.eligibility) {
        const eligibility = typeof item.eligibility === 'string'
          ? (item.eligibility.length > 80 ? item.eligibility.substring(0, 80) + '...' : item.eligibility)
          : item.eligibility;
        response += `   ✅ पात्रता: ${eligibility}\n`;
      }
      if (item.type) response += `   🏷️ प्रकार: ${item.type}\n`;
      if (item.link) response += `   🔗 लिंक: ${item.link}\n`;
      if (item.status) response += `   📊 स्थिती: ${item.status}\n`;
      
      response += '\n';
    });

    if (data.length > 5) {
      response += `\n💡 **टीप:** आणखी ${data.length - 5} माहिती उपलब्ध आहे. संपूर्ण माहितीसाठी संबंधित पृष्ठ पहा.\n`;
    }
    
    response += `\n🔄 **स्वयं अपडेट:** ही माहिती स्वयंचलितपणे अपडेट होते. जेव्हा बॅकएंडमध्ये बदल होतो, तेव्हा मी ताबडतोब नवीन माहिती दाखवतो.`;
    
    return response;
  };

  const simulateTyping = async (response) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
    
    const botMessage = {
      id: Date.now(),
      text: response,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');

    // Find matching database and fetch live data
    const matches = findMatchingDatabase(query);
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      
      setIsTyping(true);
      const data = await fetchDataFromFirebase(bestMatch.config.path);
      const response = formatResponse(data, bestMatch.config);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsTyping(false);
      
      const botMessage = {
        id: Date.now(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } else {
      // Try to provide helpful suggestions based on query
      const queryLower = query.toLowerCase();
      let suggestions = [];
      
      if (queryLower.includes('सदस्य') || queryLower.includes('member') || queryLower.includes('sarpanch')) {
        suggestions = ['सरपंच कोण आहे', 'ग्रामपंचायत सदस्य', 'सदस्यांची यादी'];
      } else if (queryLower.includes('योजना') || queryLower.includes('scheme') || queryLower.includes('yojana')) {
        suggestions = ['राज्य सरकार योजना', 'केंद्र सरकार योजना', 'योजना माहिती'];
      } else if (queryLower.includes('आरोग्य') || queryLower.includes('health') || queryLower.includes('doctor')) {
        suggestions = ['आरोग्य शिबिर', 'रुग्णालय', 'हेल्पलाईन'];
      } else if (queryLower.includes('संपर्क') || queryLower.includes('contact') || queryLower.includes('phone')) {
        suggestions = ['संपर्क माहिती', 'हेल्पलाईन', 'रुग्णालय संपर्क'];
      } else {
        suggestions = ['सरपंच कोण आहे', 'पुरस्कार', 'ई-सेवा', 'आरोग्य शिबिर', 'ग्रामसभा निर्णय', 'योजना', 'पर्यटन स्थळे', 'संपर्क माहिती'];
      }
      
      const response = `मला माफ करा, मला "${query}" बद्दल माहिती सापडली नाही. 😔

💡 **सुझाव:**
${suggestions.map((s, i) => `• ${s}`).join('\n')}

🔍 **किंवा आपण हे विचारू शकता:**
• "सरपंच कोण आहे?"
• "कोणते पुरस्कार मिळाले?"
• "ई-सेवा कोणत्या आहेत?"
• "आरोग्य शिबिर कधी आहे?"
• "ग्रामसभा निर्णय काय आहेत?"
• "योजना माहिती"
• "पर्यटन स्थळे"

किंवा खालील सूचनांपैकी एक निवडा! 👇`;
      
      await simulateTyping(response);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    const userMessage = {
      id: Date.now(),
      text: suggestion.text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Fetch live data based on suggestion
    const matches = findMatchingDatabase(suggestion.text);
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      
      setIsTyping(true);
      const data = await fetchDataFromFirebase(bestMatch.config.path);
      const response = formatResponse(data, bestMatch.config);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsTyping(false);
      
      const botMessage = {
        id: Date.now(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse"
        >
          <MessageSquare className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
            isExpanded ? 'w-[450px] h-[650px]' : 'w-[380px] h-[550px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-white rounded-full p-2">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  GramSevak AI
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </h3>
                <p className="text-xs text-blue-100">ऑनलाइन • तुम्हाला मदत करण्यासाठी तयार</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    message.isUser
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-700 rounded-full border border-gray-200 hover:border-blue-300 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow"
                >
                  <span>{suggestion.icon}</span>
                  <span className="font-medium">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="आपला प्रश्न टाइप करा..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GramSevakAI;