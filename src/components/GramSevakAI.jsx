import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Maximize2, Minimize2, Sparkles, MessageSquare } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const GramSevakAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState({});
  const [availableData, setAvailableData] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const messagesEndRef = useRef(null);

  // Enhanced Database mapping - AUTOMATICALLY FETCHES ALL DATA FROM FIREBASE
  const databaseMapping = {
    'grampanchayat-info': {
      path: 'home/grampanchayat-info',
      keywords: [
        'ग्रामपंचायत', 'ग्रामपंचायत माहिती', 'गाव', 'village', 'gram panchayat', 'ग्रामपंचायत विषयी',
        'ग्रामपंचायतीची माहिती', 'गावाची माहिती', 'about village', 'village info', 'ग्रामपंचायत बद्दल',
        'ग्रामपंचायत सांगा', 'गावाचे नाव', 'village name', 'ग्रामपंचायत तपशील'
      ],
      fields: ['gpName', 'details', 'photos', 'title']
    },
    'members': {
      path: 'members',
      keywords: [
        'सदस्य', 'सरपंच', 'उपसरपंच', 'ग्राम सेवक', 'सदस्यांची यादी', 'members', 'gram sevak',
        'sarpanch', 'upsarpanch', 'member list', 'who is sarpanch', 'gram sevak info',
        'members list', 'ग्रामपंचायत सदस्य', 'ग्रामपंचायत सदस्य कोण आहेत', 'ग्राम सेवकाची माहिती',
        'सरपंच कोण आहे', 'सदस्यांची यादी दाखवा', 'ग्राम सेवक माहिती', 'सरपंच माहिती',
        'panchayat members', 'village head', 'gram panchayat members', 'leadership'
      ],
      fields: ['name', 'designation', 'order', 'imageURL']
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
    'facilities': {
      path: 'facilities',
      keywords: [
        'सुविधा', 'facility', 'facilities', 'सुविधा कोणत्या आहेत', 'available facilities',
        'ग्रामपंचायत सुविधा', 'village facilities', 'सुविधा माहिती'
      ],
      fields: ['name', 'type', 'description', 'location', 'contact']
    },
    'census': {
      path: 'census',
      keywords: [
        'जनगणना', 'census', 'लोकसंख्या', 'population', 'जनगणना माहिती',
        'population data', 'demographics', 'लोकसंख्या तपशील'
      ],
      fields: ['totalPopulation', 'male', 'female', 'households', 'year']
    },
    'festivals': {
      path: 'festivals',
      keywords: [
        'कार्यक्रम', 'festival', 'उत्सव', 'events', 'कार्यक्रम कोणते आहेत',
        'festivals', 'celebrations', 'ग्रामपंचायत कार्यक्रम', 'village events'
      ],
      fields: ['name', 'date', 'description', 'location', 'imageURL']
    },
    'pragat-shetkari': {
      path: 'extra/pragat-shetkari/items',
      keywords: [
        'प्रगत शेतकरी', 'progressive farmer', 'शेतकरी', 'farmer', 'कृषी',
        'agriculture', 'शेतकरी माहिती', 'farmer info', 'कृषी माहिती'
      ],
      fields: ['name', 'crop', 'achievement', 'description', 'imageURL']
    },
    'e-shikshan': {
      path: 'extra/e-shikshan/items',
      keywords: [
        'ई-शिक्षण', 'e-learning', 'शिक्षण', 'education', 'ऑनलाइन शिक्षण',
        'online education', 'digital learning', 'शिक्षण माहिती', 'education info'
      ],
      fields: ['title', 'description', 'link', 'type', 'category']
    },
    'svachh-gav': {
      path: 'program/svachhgaav/items',
      keywords: [
        'स्वच्छ गाव', 'clean village', 'स्वच्छता', 'cleanliness', 'स्वच्छ गाव उपक्रम',
        'clean village program', 'sanitation', 'स्वच्छता माहिती'
      ],
      fields: ['title', 'description', 'date', 'location', 'imageURL']
    },
    'vikel-te-pikel': {
      path: 'program/vikeltepikel/items',
      keywords: [
        'विकल-ते-पिकेल', 'sell to buy', 'विक्री', 'selling', 'विक्री माहिती',
        'sales', 'trading', 'व्यापार', 'business'
      ],
      fields: ['title', 'description', 'price', 'imageURL', 'contact']
    },
    'majhe-kutumb': {
      path: 'program/maajhekutumb/items',
      keywords: [
        'माझे कुटुंब', 'my family', 'कुटुंब', 'family', 'कुटुंब उपक्रम',
        'family program', 'कुटुंब माहिती', 'family info'
      ],
      fields: ['title', 'description', 'date', 'benefits']
    },
    'tantamukt-gav': {
      path: 'program/tantamuktgaav/items',
      keywords: [
        'तंटामुक्त गाव', 'conflict free', 'तंटा', 'dispute', 'तंटामुक्त',
        'dispute resolution', 'peace', 'शांतता'
      ],
      fields: ['title', 'description', 'date', 'status']
    },
    'jalyukt-shivar': {
      path: 'program/jalyuktshivar/items',
      keywords: [
        'जलयुक्त शिवार', 'water management', 'पाणी', 'water', 'जल व्यवस्थापन',
        'water conservation', 'irrigation', 'सिंचन'
      ],
      fields: ['title', 'description', 'area', 'benefits']
    }
  };

  // Dynamic quick suggestions based on available data
  const quickSuggestions = [
    { icon: '👥', text: 'सरपंच कोण आहे' },
    { icon: '🏆', text: 'पुरस्कार माहिती' },
    { icon: '💻', text: 'ई-सेवा कोणत्या आहेत' },
    { icon: '🏥', text: 'आरोग्य शिबिर' },
    { icon: '📜', text: 'ग्रामसभा निर्णय' },
    { icon: '🌆', text: 'पर्यटन स्थळे' },
    { icon: '📞', text: 'संपर्क माहिती' },
    { icon: '💰', text: 'सरकारी योजना' },
    { icon: '🏛️', text: 'ग्रामपंचायत माहिती' },
    { icon: '📰', text: 'नवीनतम बातम्या' }
  ];

  // Fetch data from Firebase - moved before useEffect
  const fetchDataFromFirebase = async (path, limitCount = 5) => {
    try {
      console.log('🔍 Fetching from Firebase:', path);
      
      const pathParts = path.split('/');
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
      
      console.log('✅ Fetched:', data.length, 'items');
      return data;
    } catch (error) {
      console.error('❌ Firebase Error:', error);
      return [];
    }
  };

  // Auto-fetch available data on component mount
  useEffect(() => {
    const fetchAvailableData = async () => {
      setIsLoadingData(true);
      const dataMap = {};
      
      // Fetch data from all collections automatically
      for (const [key, config] of Object.entries(databaseMapping)) {
        try {
          const data = await fetchDataFromFirebase(config.path, 3);
          if (data && data.length > 0) {
            dataMap[key] = data.length;
          }
        } catch (error) {
          console.log(`No data found for ${key}`);
        }
      }
      
      setAvailableData(dataMap);
      setIsLoadingData(false);
    };
    
    if (isOpen) {
      fetchAvailableData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const generateWelcomeMessage = () => {
        const availableCount = Object.keys(availableData).length;
        let welcomeText = `नमस्कार! 🙏\n\n`;
        welcomeText += `मी **GramSevak AI** आहे - आपला डिजिटल ग्राम सेवक!\n\n`;
        welcomeText += `✅ **${availableCount}+ डेटाबेस कनेक्टेड** - सर्व माहिती Real-time मध्ये उपलब्ध आहे!\n\n`;
        welcomeText += `मी आपल्याला यात मदत करू शकतो:\n`;
        welcomeText += `• ग्रामपंचायत माहिती (Auto-fetched)\n`;
        welcomeText += `• सदस्य माहिती (Live Data)\n`;
        welcomeText += `• सरकारी योजना (Real-time)\n`;
        welcomeText += `• आरोग्य सेवा & शिबिर\n`;
        welcomeText += `• ई-सेवा & डिजिटल सेवा\n`;
        welcomeText += `• कार्यक्रम & उत्सव\n`;
        welcomeText += `• पर्यटन स्थळे\n`;
        welcomeText += `• संपर्क माहिती\n`;
        welcomeText += `• आणि बरेच काही...\n\n`;
        welcomeText += `💡 **सुचना:** आपण नैसर्गिक भाषेत प्रश्न विचारू शकता!\n`;
        welcomeText += `उदा: "सरपंच कोण आहे?" किंवा "कोणत्या योजना उपलब्ध आहेत?"\n\n`;
        welcomeText += `किंवा खालील सूचनांपैकी एक निवडा! 👇`;
        
        return welcomeText;
      };
      
      const welcomeMsg = {
        id: Date.now(),
        text: generateWelcomeMessage(),
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, availableData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced matching with better NLP-like understanding
  const findMatchingDatabase = (query) => {
    const queryLower = query.toLowerCase().trim();
    const matches = [];
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    Object.entries(databaseMapping).forEach(([key, config]) => {
      let score = 0;
      
      // Exact match - highest priority
      config.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        if (queryLower === keywordLower) {
          score += 30;
        } else if (queryLower.includes(keywordLower)) {
          score += 15;
        } else if (keywordLower.includes(queryLower)) {
          score += 12;
        }
      });
      
      // Word-by-word matching for better understanding
      queryWords.forEach(word => {
        config.keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();
          if (keywordLower.includes(word) || word.includes(keywordLower)) {
            score += 8;
          }
        });
      });
      
      // Context-based matching
      const contextKeywords = {
        'who': ['members', 'सदस्य', 'सरपंच'],
        'what': ['info', 'माहिती', 'details'],
        'where': ['location', 'स्थळ', 'address'],
        'when': ['date', 'तारीख', 'time'],
        'how': ['process', 'प्रक्रिया', 'method'],
        'किती': ['count', 'संख्या', 'quantity'],
        'कोण': ['who', 'person', 'व्यक्ती']
      };
      
      Object.entries(contextKeywords).forEach(([context, relatedKeys]) => {
        if (queryLower.includes(context)) {
          relatedKeys.forEach(relatedKey => {
            if (config.keywords.some(k => k.toLowerCase().includes(relatedKey))) {
              score += 5;
            }
          });
        }
      });
      
      if (score >= 5) {
        matches.push({ key, config, score });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  };

  // Format response for members
  const formatMembersResponse = (data) => {
    if (!data || data.length === 0) {
      return "क्षमस्व, सदस्यांची माहिती डेटाबेसमध्ये सध्या उपलब्ध नाही. 😔";
    }

    let response = `👥 **ग्रामपंचायत सदस्य** (${data.length} सदस्य)\n\n`;
    
    data.forEach((member, index) => {
      response += `${index + 1}. **${member.name}**\n`;
      response += `   🏛️ ${member.designation}\n`;
      if (member.phone) response += `   📞 ${member.phone}\n`;
      response += '\n';
    });
    
    return response;
  };

  // Enhanced response formatting with better structure
  const formatResponse = (data, config, userQuery = '') => {
    if (!data || data.length === 0) {
      return `क्षमस्व, या विषयाची माहिती डेटाबेसमध्ये सध्या उपलब्ध नाही. 😔\n\nकृपया इतर विषय विचारा किंवा खालील सूचना वापरा! 👇`;
    }

    if (config.path === 'members') {
      return formatMembersResponse(data);
    }

    // Personalized greeting based on query
    let response = `✅ **${data.length} माहिती सापडली!** (Real-time Data)\n\n`;
    
    // Show top 3-5 most relevant items
    const itemsToShow = Math.min(data.length, 5);
    data.slice(0, itemsToShow).forEach((item, index) => {
      response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      response += `📋 **${index + 1}. ${item.title || item.name || 'माहिती'}**\n`;
      response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      
      // Smart field detection and formatting
      if (item.name && !item.title) response += `👤 **नाव:** ${item.name}\n`;
      if (item.title) response += `📌 **शीर्षक:** ${item.title}\n`;
      if (item.description) {
        const desc = item.description.length > 150 
          ? item.description.substring(0, 150) + '...' 
          : item.description;
        response += `📝 **तपशील:** ${desc}\n`;
      }
      if (item.designation) response += `🏛️ **पद:** ${item.designation}\n`;
      if (item.date || item.campDate) response += `📅 **तारीख:** ${item.date || item.campDate}\n`;
      if (item.location) response += `📍 **स्थान:** ${item.location}\n`;
      if (item.contact || item.phone) response += `📞 **संपर्क:** ${item.contact || item.phone}\n`;
      if (item.email) response += `📧 **ईमेल:** ${item.email}\n`;
      if (item.address) response += `🏠 **पत्ता:** ${item.address}\n`;
      if (item.doctorName) response += `👨‍⚕️ **डॉक्टर:** ${item.doctorName}\n`;
      if (item.campType) response += `🏥 **प्रकार:** ${item.campType}\n`;
      if (item.department) response += `🏛️ **विभाग:** ${item.department}\n`;
      if (item.benefits) {
        const benefits = typeof item.benefits === 'string' 
          ? item.benefits.substring(0, 100) 
          : item.benefits;
        response += `💰 **लाभ:** ${benefits}\n`;
      }
      if (item.eligibility) {
        const eligibility = typeof item.eligibility === 'string'
          ? item.eligibility.substring(0, 100)
          : item.eligibility;
        response += `✅ **पात्रता:** ${eligibility}\n`;
      }
      if (item.type) response += `🏷️ **प्रकार:** ${item.type}\n`;
      if (item.link) response += `🔗 **लिंक:** ${item.link}\n`;
      if (item.imageURL) response += `📷 **फोटो उपलब्ध आहे**\n`;
      
      response += '\n';
    });

    if (data.length > itemsToShow) {
      response += `\n💡 **+${data.length - itemsToShow} आणखी माहिती उपलब्ध आहे.**\n`;
    }
    
    response += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `✅ **सर्व माहिती Firebase वरून Real-time मध्ये fetch केली आहे!**\n`;
    response += `\nआणखी काही विचारायचे असेल तर मोकळ्या मनाने विचारा! 😊`;
    
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

    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      lastQuery: query,
      timestamp: new Date()
    }));

    // Show typing indicator
    setIsTyping(true);
    
    // Simulate thinking time for more natural feel
    await new Promise(resolve => setTimeout(resolve, 800));

    // Find matching database and fetch live data
    const matches = findMatchingDatabase(query);
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      
      try {
        // Fetch live data from Firebase
        const data = await fetchDataFromFirebase(bestMatch.config.path, 5);
        const response = formatResponse(data, bestMatch.config, query);
        
        // Add slight delay for natural conversation flow
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsTyping(false);
        
        const botMessage = {
          id: Date.now(),
          text: response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        setIsTyping(false);
        const errorMessage = {
          id: Date.now(),
          text: `क्षमस्व, डेटा लोड करताना त्रुटी आली. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा. 😔\n\nत्रुटी: ${error.message}`,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      // Enhanced fallback with suggestions based on available data
      const availableOptions = Object.keys(availableData).slice(0, 6);
      let suggestions = '';
      
      if (availableOptions.length > 0) {
        suggestions = availableOptions.map(key => {
          const config = databaseMapping[key];
          return `• ${config.keywords[0]}`;
        }).join('\n');
      } else {
        suggestions = `• सदस्य माहिती\n• पुरस्कार\n• ई-सेवा\n• आरोग्य शिबिर\n• ग्रामसभा निर्णय\n• योजना`;
      }
      
      const response = `मला माफ करा, मला "${query}" बद्दल माहिती सापडली नाही. 😔\n\n`;
      response += `मी आपल्याला या विषयांवर माहिती देऊ शकतो:\n\n`;
      response += suggestions;
      response += `\n\n💡 **सुचना:** आपण आपला प्रश्न वेगळ्या पद्धतीने विचारू शकता किंवा खालील सूचनांपैकी एक निवडा! 👇`;
      
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
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: '"Roboto", "Arial", sans-serif' }}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)',
            color: 'white',
            borderRadius: '50%',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(2, 136, 209, 0.4)',
            border: '2px solid #0277bd',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            fontFamily: '"Roboto", "Arial", sans-serif'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 16px rgba(2, 136, 209, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(2, 136, 209, 0.4)';
          }}
        >
          <MessageSquare className="w-7 h-7" />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '16px',
            height: '16px',
            background: '#4caf50',
            borderRadius: '50%',
            border: '2px solid white',
            animation: 'pulse 2s infinite'
          }}></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            width: isExpanded ? '450px' : '380px',
            height: isExpanded ? '650px' : '550px',
            fontFamily: '"Roboto", "Arial", sans-serif',
            border: '2px solid #e0e0e0'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #0277bd'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  background: 'white',
                  borderRadius: '50%',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot className="w-6 h-6" style={{ color: '#0288d1' }} />
                </div>
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '12px',
                  height: '12px',
                  background: '#4caf50',
                  borderRadius: '50%',
                  border: '2px solid white'
                }}></span>
              </div>
              <div>
                <h3 style={{
                  fontWeight: '700',
                  fontSize: '18px',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  color: '#FFFFFF',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}>
                  GramSevak AI
                  <Sparkles className="w-4 h-4" style={{ color: '#FFD700' }} />
                </h3>
                <p style={{
                  fontSize: '12px',
                  margin: '4px 0 0 0',
                  opacity: 1,
                  color: '#FFFFFF',
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  fontWeight: '500',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}>
                  ऑनलाइन • तुम्हाला मदत करण्यासाठी तयार
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  marginBottom: '16px',
                  justifyContent: message.isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    borderRadius: message.isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '12px 16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    background: message.isUser 
                      ? 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)'
                      : 'white',
                    color: message.isUser ? 'white' : '#212121',
                    border: message.isUser ? 'none' : '1px solid #e0e0e0',
                    fontFamily: '"Roboto", "Arial", sans-serif'
                  }}
                >
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontFamily: '"Roboto", "Arial", sans-serif'
                  }}>
                    {message.text}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    marginTop: '6px',
                    opacity: 0.8,
                    fontFamily: '"Roboto", "Arial", sans-serif'
                  }}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  background: 'white',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        background: '#0288d1',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite'
                      }}></span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        background: '#0288d1',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite',
                        animationDelay: '0.2s'
                      }}></span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        background: '#0288d1',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite',
                        animationDelay: '0.4s'
                      }}></span>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: '"Roboto", "Arial", sans-serif'
                    }}>
                      Firebase वरून माहिती fetch करत आहे...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {isLoadingData && messages.length === 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  background: 'white',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        background: '#4caf50',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite'
                      }}></span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        background: '#4caf50',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite',
                        animationDelay: '0.2s'
                      }}></span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        background: '#4caf50',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite',
                        animationDelay: '0.4s'
                      }}></span>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: '"Roboto", "Arial", sans-serif'
                    }}>
                      सर्व डेटाबेस कनेक्ट करत आहे...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{
            padding: '12px 16px',
            background: '#f5f5f5',
            borderTop: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: 'white',
                    fontSize: '13px',
                    color: '#0288d1',
                    borderRadius: '20px',
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e1f5fe';
                    e.target.style.borderColor = '#0288d1';
                    e.target.style.boxShadow = '0 2px 6px rgba(2, 136, 209, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <span>{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{
            padding: '16px',
            background: 'white',
            borderTop: '1px solid #e0e0e0',
            borderRadius: '0 0 12px 12px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="आपला प्रश्न टाइप करा..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0288d1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(2, 136, 209, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                style={{
                  background: inputValue.trim() 
                    ? 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)'
                    : '#bdbdbd',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: inputValue.trim() ? '0 2px 8px rgba(2, 136, 209, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (inputValue.trim()) {
                    e.target.style.boxShadow = '0 4px 12px rgba(2, 136, 209, 0.4)';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (inputValue.trim()) {
                    e.target.style.boxShadow = '0 2px 8px rgba(2, 136, 209, 0.3)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default GramSevakAI;