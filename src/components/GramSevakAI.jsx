import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  Typography, 
  Avatar, 
  Chip,
  CircularProgress,
  Fade,
  Collapse,
  Divider
} from '@mui/material';
import { 
  Send, 
  SmartToy, 
  Close, 
  ChatBubbleOutline,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const GramSevakAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Database mapping configuration - Updated with exact paths and keywords
  const databaseMapping = {
    // 🏠 ग्रामपंचायत माहिती
    'grampanchayat-info': {
      path: 'home/grampanchayat-info',
      keywords: [
        'ग्रामपंचायत', 'माहिती', 'फोटो', 'परिचय', 'ग्रामपंचायतीची माहिती सांगा', 'ग्रामपंचायतीचे फोटो दाखवा',
        'gram panchayat', 'information', 'details', 'village info', 'panchayat info',
        'ग्रामपंचायत माहिती', 'गाव माहिती', 'पंचायत माहिती', 'ग्रामपंचायत परिचय',
        'village information', 'panchayat details', 'gram panchayat info'
      ],
      fields: ['gpName', 'details', 'photos', 'title', 'description', 'date']
    },
    
    // 👥 सदस्य माहिती
    'members': {
      path: 'members',
      keywords: [
        'सदस्य', 'सरपंच', 'उपसरपंच', 'ग्राम सेवक', 'सरपंच कोण आहे', 'सदस्यांची यादी दाखवा',
        'members', 'sarpanch', 'upsarpanch', 'gram sevak', 'who is sarpanch', 'member list',
        'ग्रामपंचायत सदस्य', 'पंचायत सदस्य', 'ग्राम सेवक माहिती', 'सरपंच माहिती',
        'panchayat members', 'village head', 'gram panchayat members', 'leadership'
      ],
      fields: ['name', 'designation', 'imageURL']
    },
    
    // 📜 ग्रामसभा निर्णय
    'decisions': {
      path: 'decisions',
      keywords: [
        'निर्णय', 'ग्रामसभा', 'ठराव', 'ग्रामसभेचे निर्णय काय आहेत',
        'decision', 'resolution', 'meeting', 'gram sabha', 'panchayat decision',
        'ग्रामसभा निर्णय', 'पंचायत निर्णय', 'ठराव माहिती', 'निर्णय सूची',
        'village meeting', 'panchayat meeting', 'decision list', 'resolutions'
      ],
      fields: ['title', 'description', 'date', 'status']
    },
    
    // 🏆 पुरस्कार
    'awards': {
      path: 'awards',
      keywords: [
        'पुरस्कार', 'विजेता', 'award', 'ग्रामपंचायतीला कोणते पुरस्कार मिळाले आहेत',
        'prize', 'recognition', 'achievement', 'honor', 'certificate',
        'पुरस्कार माहिती', 'विजेते', 'यश', 'प्रशस्ती', 'सन्मान',
        'award list', 'achievements', 'recognition list', 'honors'
      ],
      fields: ['title', 'recipient', 'date', 'description']
    },
    
    // 💻 ई-सेवा
    'eseva': {
      path: 'eseva',
      keywords: [
        'ई-सेवा', 'अर्ज', 'प्रमाणपत्र', 'ऑनलाइन सेवा', 'कोणत्या ई-सेवा उपलब्ध आहेत',
        'e-seva', 'e-service', 'online service', 'application', 'certificate', 'digital service',
        'ई-सेवा माहिती', 'डिजिटल सेवा', 'ऑनलाइन अर्ज', 'प्रमाणपत्र सेवा',
        'e-governance', 'digital certificate', 'online application', 'government service'
      ],
      fields: ['name', 'type', 'link']
    },
    
    // 💧 जलयुक्त शिवार
    'jalyuktshivar': {
      path: 'program/jalyuktshivar/items',
      keywords: ['जलयुक्त', 'शिवार', 'पाणी साठवण', 'conservation', 'जलयुक्त शिवार योजना कोणत्या आहेत'],
      fields: ['title', 'description', 'location', 'waterStorage']
    },
    
    // 🌿 सेंद्रिय खत
    'sendriyakhat': {
      path: 'program/sendriyakhat/items',
      keywords: ['सेंद्रिय', 'खत', 'शेतकरी', 'खत निर्मिती', 'सेंद्रिय खत प्रकल्प कोणते आहेत'],
      fields: ['title', 'farmerName', 'status', 'quantity']
    },
    
    // 🧍‍♂️ माझे कुटुंब माझी जबाबदारी
    'maajhekutumb': {
      path: 'program/maajhekutumb/items',
      keywords: ['कुटुंब', 'जबाबदारी', 'kutumb', 'माझे कुटुंब माझी जबाबदारी कार्यक्रम'],
      fields: ['familyName', 'headOfFamily', 'members']
    },
    
    // 💪 तंटामुक्त गाव
    'tantamuktgaav': {
      path: 'program/tantamuktgaav/items',
      keywords: ['तंटा', 'विवाद', 'mediation', 'तंटामुक्त गाव योजनेची माहिती'],
      fields: ['disputeType', 'status', 'resolution']
    },
    
    // 🚮 कचरा नियोजन
    'kachryacheniyojan': {
      path: 'program/kachryacheniyojan/items',
      keywords: ['कचरा', 'waste', 'नियोजन', 'कचरा नियोजनाची माहिती द्या'],
      fields: ['title', 'wasteType', 'disposalMethod']
    },
    
    // 🏅 क्रीडा स्पर्धा
    'kreedaspardha': {
      path: 'program/kreedaspardha/items',
      keywords: ['क्रीडा', 'खेळ', 'sports', 'स्पर्धा', 'कबड्डी स्पर्धा कधी आहे'],
      fields: ['title', 'sportType', 'startDate', 'location']
    },
    
    // 🧑‍⚕️ आरोग्य शिबिर
    'aarogyashibir': {
      path: 'program/aarogyashibir/items',
      keywords: [
        'आरोग्य', 'शिबिर', 'डॉक्टर', 'health camp', 'आरोग्य शिबिरांची माहिती द्या',
        'health', 'medical', 'doctor', 'camp', 'healthcare', 'medical camp',
        'आरोग्य सेवा', 'वैद्यकीय शिबिर', 'डॉक्टर माहिती', 'आरोग्य केंद्र',
        'health service', 'medical service', 'health checkup', 'free medical camp'
      ],
      fields: ['title', 'campType', 'campDate', 'doctorName']
    },
    
    // 🌾 विकेल ते पिकेल
    'vikeltepikel': {
      path: 'program/vikeltepikel/items',
      keywords: ['विकेल', 'पिकेल', 'शेतकरी', 'उत्पादने', 'विकेल ते पिकेल योजना कोणत्या आहेत'],
      fields: ['productType', 'farmerName', 'price']
    },
    
    // 🏫 सर्व शिक्षा अभियान
    'sarvashiksha': {
      path: 'program/sarvashiksha/items',
      keywords: ['शिक्षण', 'विद्यार्थी', 'school', 'सर्व शिक्षा', 'सर्व शिक्षा अभियानातील विद्यार्थी किती आहेत'],
      fields: ['studentName', 'grade', 'status']
    },
    
    // 💰 राज्य सरकार योजना
    'state-yojana': {
      path: 'yojana/state/items',
      keywords: ['राज्य सरकार योजना', 'scheme', 'yojana', 'राज्य सरकारच्या योजना कोणत्या आहेत'],
      fields: ['title', 'department', 'eligibility']
    },
    
    // 🏛️ केंद्र सरकार योजना
    'central-yojana': {
      path: 'yojana/central/items',
      keywords: ['केंद्र सरकार योजना', 'scheme', 'yojana', 'केंद्र सरकारच्या योजना सांगा'],
      fields: ['title', 'department', 'benefits']
    },
    
    // 🏥 रुग्णालये
    'hospitals': {
      path: 'hospitals',
      keywords: ['रुग्णालय', 'हॉस्पिटल', 'आरोग्य केंद्र', 'doctor', 'गावात कोणती रुग्णालये आहेत'],
      fields: ['name', 'contact', 'type', 'address']
    },
    
    // ☎️ हेल्पलाईन
    'helplines': {
      path: 'helplines',
      keywords: ['हेल्पलाईन', 'नंबर', 'police', 'emergency', 'महत्वाचे हेल्पलाईन नंबर सांगा'],
      fields: ['serviceName', 'department', 'number']
    },
    
    // 🌆 पर्यटन स्थळे
    'tourism': {
      path: 'tourism',
      keywords: ['पर्यटन', 'स्थळ', 'temple', 'attraction', 'पर्यटन स्थळांची माहिती द्या'],
      fields: ['name', 'type', 'description']
    },
    
    // 🗳️ मतदार नोंदणी
    'matdaarnondani': {
      path: 'program/matdaarnondani/items',
      keywords: ['मतदार', 'voter', 'booth', 'नवीन मतदारांची माहिती द्या'],
      fields: ['voterName', 'status', 'boothNumber']
    },
    
    // 👨‍🌾 प्रगत शेतकरी
    'pragat-shetkari': {
      path: 'extra/pragat-shetkari/items',
      keywords: ['शेतकरी', 'प्रगत', 'achievement', 'प्रगत शेतकरी कोण आहेत'],
      fields: ['name', 'achievement', 'village']
    },
    
    // 💬 बातम्या
    'batmya': {
      path: 'extra/batmya/items',
      keywords: [
        'बातम्या', 'news', 'घोषणा', 'नवीनतम बातम्या कोणत्या आहेत',
        'announcement', 'latest news', 'village news', 'updates',
        'नवीनतम बातम्या', 'घोषणा माहिती', 'बातम्या सूची', 'अपडेट',
        'news updates', 'announcements', 'village updates', 'latest information'
      ],
      fields: ['title', 'date', 'content', 'description']
    },

    // 🗺️ नकाशा
    'map': {
      path: 'home/grampanchayat-info/map',
      keywords: [
        'नकाशा', 'map', 'स्थान', 'location', 'ग्रामपंचायत नकाशा',
        'village map', 'panchayat map', 'location info', 'geography',
        'गाव नकाशा', 'स्थान माहिती', 'नकाशा दाखवा', 'location details'
      ],
      fields: ['title', 'description', 'coordinates', 'address']
    },

    // 🏢 सुविधा
    'facilities': {
      path: 'facilities',
      keywords: [
        'सुविधा', 'facilities', 'सेवा', 'services', 'ग्रामपंचायत सुविधा',
        'village facilities', 'public services', 'infrastructure', 'amenities',
        'सार्वजनिक सुविधा', 'सेवा माहिती', 'सुविधा सूची', 'infrastructure info'
      ],
      fields: ['title', 'description', 'type', 'location', 'date']
    },

    // 🌍 पर्यटन स्थळे
    'tourism': {
      path: 'tourism',
      keywords: [
        'पर्यटन', 'स्थळ', 'temple', 'attraction', 'पर्यटन स्थळांची माहिती द्या',
        'tourism', 'tourist places', 'attractions', 'places to visit',
        'पर्यटन स्थळे', 'दर्शनीय स्थळे', 'temple info', 'tourist spots',
        'sightseeing', 'places of interest', 'visitor attractions', 'heritage sites'
      ],
      fields: ['name', 'type', 'description', 'location', 'date']
    },

    // 📞 संपर्क
    'contacts': {
      path: 'contacts',
      keywords: [
        'संपर्क', 'contact', 'फोन', 'phone', 'संपर्क माहिती',
        'contact info', 'phone numbers', 'address', 'contact details',
        'संपर्क सूची', 'फोन नंबर', 'पत्ता', 'contact list',
        'emergency contact', 'office contact', 'village contact', 'panchayat contact'
      ],
      fields: ['name', 'designation', 'phone', 'email', 'address']
    },

    // 📝 तक्रार नोंदणी
    'complaints': {
      path: 'complaints',
      keywords: [
        'तक्रार', 'complaint', 'नोंदणी', 'registration', 'तक्रार नोंदणी',
        'complaint registration', 'grievance', 'issue reporting', 'problem',
        'तक्रार सूची', 'समस्या', 'grievance redressal', 'complaint system',
        'issue tracking', 'problem resolution', 'complaint status', 'grievance system'
      ],
      fields: ['title', 'description', 'status', 'date', 'category']
    },

    // 🎓 ई-शिक्षण
    'e-shikshan': {
      path: 'extra/e-shikshan/items',
      keywords: [
        'ई-शिक्षण', 'e-learning', 'शिक्षण', 'education', 'डिजिटल शिक्षण',
        'digital education', 'online learning', 'educational programs', 'learning',
        'डिजिटल शिक्षण', 'ऑनलाइन शिक्षण', 'शैक्षणिक कार्यक्रम', 'education programs',
        'e-education', 'digital learning', 'online education', 'educational content'
      ],
      fields: ['title', 'description', 'type', 'date', 'link']
    },

    // 🏥 रुग्णालये
    'hospitals': {
      path: 'hospitals',
      keywords: [
        'रुग्णालय', 'हॉस्पिटल', 'आरोग्य केंद्र', 'doctor', 'गावात कोणती रुग्णालये आहेत',
        'hospital', 'medical center', 'health center', 'clinic', 'medical facility',
        'आरोग्य सेवा', 'वैद्यकीय केंद्र', 'रुग्णालय माहिती', 'medical services',
        'healthcare', 'medical care', 'hospital services', 'health facilities'
      ],
      fields: ['name', 'contact', 'type', 'address', 'services']
    },

    // ☎️ हेल्पलाईन
    'helplines': {
      path: 'helplines',
      keywords: [
        'हेल्पलाईन', 'नंबर', 'police', 'emergency', 'महत्वाचे हेल्पलाईन नंबर सांगा',
        'helpline', 'emergency number', 'police number', 'urgent contact',
        'आपत्कालीन नंबर', 'पोलीस नंबर', 'हेल्पलाईन सूची', 'emergency contacts',
        'crisis helpline', 'support number', 'emergency services', 'urgent help'
      ],
      fields: ['serviceName', 'department', 'number', 'description']
    },

    // 🏛️ केंद्र सरकार योजना
    'central-yojana': {
      path: 'yojana/central/items',
      keywords: [
        'केंद्र सरकार योजना', 'scheme', 'yojana', 'केंद्र सरकारच्या योजना सांगा',
        'central government scheme', 'central yojana', 'government scheme', 'central scheme',
        'केंद्रीय योजना', 'सरकारी योजना', 'योजना माहिती', 'central programs',
        'federal scheme', 'national scheme', 'central government program', 'government initiative'
      ],
      fields: ['title', 'department', 'benefits', 'eligibility', 'date']
    },

    // 💰 राज्य सरकार योजना
    'state-yojana': {
      path: 'yojana/state/items',
      keywords: [
        'राज्य सरकार योजना', 'scheme', 'yojana', 'राज्य सरकारच्या योजना कोणत्या आहेत',
        'state government scheme', 'state yojana', 'state scheme', 'regional scheme',
        'राज्य योजना', 'प्रादेशिक योजना', 'योजना सूची', 'state programs',
        'provincial scheme', 'state initiative', 'regional program', 'state benefit'
      ],
      fields: ['title', 'department', 'eligibility', 'benefits', 'date']
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      const testCollection = collection(db, 'members');
      const testSnapshot = await getDocs(testCollection);
      console.log('Firebase connection test successful. Members count:', testSnapshot.size);
      
      // Add a message to show the test result
      const testMessage = {
        id: Date.now(),
        text: `🔧 Firebase Connection Test: ${testSnapshot.size} members found in database`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, testMessage]);
      
      return testSnapshot.size > 0;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now(),
        text: `❌ Firebase Connection Failed: ${error.message}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      return false;
    }
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        text: "नमस्कार! मी GramSevak AI आहे. ग्रामपंचायतीच्या कोणत्याही विषयावर माहिती मिळविण्यासाठी मला विचारा. मी आपल्याला मराठीत उत्तर देईन.",
        isUser: false,
        timestamp: new Date()
      }]);
      
      // Test Firebase connection on startup
      testFirebaseConnection();
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced keyword matching function
  const findMatchingDatabase = (query) => {
    const queryLower = query.toLowerCase().trim();
    const matches = [];

    Object.entries(databaseMapping).forEach(([key, config]) => {
      let score = 0;
      const matchedKeywords = [];
      
      // Check each keyword
      config.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // Exact match gets highest score
        if (queryLower === keywordLower) {
          score += 10;
          matchedKeywords.push(keyword);
        }
        // Contains match gets medium score
        else if (queryLower.includes(keywordLower)) {
          score += 5;
          matchedKeywords.push(keyword);
        }
        // Partial match gets lower score
        else if (keywordLower.includes(queryLower) && queryLower.length > 2) {
          score += 2;
          matchedKeywords.push(keyword);
        }
        // Word boundary match
        else if (queryLower.split(' ').some(word => keywordLower.includes(word))) {
          score += 3;
          matchedKeywords.push(keyword);
        }
      });
      
      if (score > 0) {
        matches.push({
          key,
          config,
          matchedKeywords,
          score
        });
      }
    });

    console.log('Query:', query, 'Matches found:', matches);
    return matches.sort((a, b) => b.score - a.score);
  };

  // Enhanced data fetching from Firebase
  const fetchDataFromFirebase = async (path, limitCount = 5) => {
    try {
      console.log('Fetching data from path:', path);
      
      // Handle different path formats
      let collectionRef;
      if (typeof path === 'string') {
        // Split path by '/' to create proper collection reference
        const pathParts = path.split('/');
        collectionRef = collection(db, ...pathParts);
      } else {
        collectionRef = collection(db, path);
      }
      
      let data = [];
      let querySnapshot;
      
      // Try different ordering strategies
      const orderFields = ['date', 'createdAt', 'timestamp', 'order', 'id'];
      
      for (const orderField of orderFields) {
        try {
          console.log(`Trying to order by ${orderField}`);
          const q = query(collectionRef, orderBy(orderField, 'desc'), limit(limitCount));
          querySnapshot = await getDocs(q);
          
          if (querySnapshot.size > 0) {
            console.log(`Successfully fetched ${querySnapshot.size} documents ordered by ${orderField}`);
            break;
          }
        } catch (orderError) {
          console.log(`Ordering by ${orderField} failed:`, orderError.message);
          continue;
        }
      }
      
      // If no ordering worked, try simple query
      if (!querySnapshot || querySnapshot.size === 0) {
        try {
          console.log('Trying simple query without ordering');
          const simpleQuery = query(collectionRef, limit(limitCount));
          querySnapshot = await getDocs(simpleQuery);
          console.log(`Simple query fetched ${querySnapshot.size} documents`);
        } catch (simpleError) {
          console.log('Simple query failed, trying direct collection access');
          querySnapshot = await getDocs(collectionRef);
          console.log(`Direct access fetched ${querySnapshot.size} documents`);
        }
      }
      
      // Process the results
      if (querySnapshot && querySnapshot.size > 0) {
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          data.push({
            id: doc.id,
            ...docData
          });
        });
        
        console.log('Successfully fetched data:', data.length, 'items');
        console.log('Sample data:', data[0]);
      } else {
        console.log('No data found in collection');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching data from path:', path, error);
      return [];
    }
  };

  // Enhanced response formatting with comprehensive data display
  const formatResponse = (data, config, matchedKeywords) => {
    if (!data || data.length === 0) {
      return "क्षमस्व, या विषयाची माहिती डेटाबेसमध्ये सध्या उपलब्ध नाही.";
    }

    let response = `✅ ${data.length} माहिती सापडली:\n\n`;
    
    // Show all available items (up to 5)
    const topItems = data.slice(0, 5);
    
    topItems.forEach((item, index) => {
      response += `📋 ${index + 1}. `;
      
      // Add title if available (most important)
      if (item.title) {
        response += `📌 ${item.title}\n`;
      }
      
      // Add name if available (for members, farmers, etc.)
      if (item.name) {
        response += `   👤 नाव: ${item.name}\n`;
      }
      
      // Add description prominently
      if (item.description) {
        response += `   📝 माहिती: ${item.description}\n`;
      }
      
      // Add date prominently
      if (item.date) {
        response += `   📅 तारीख: ${item.date}\n`;
      }
      
      // Add designation if available
      if (item.designation) {
        response += `   🏛️ पद: ${item.designation}\n`;
      }
      
      // Add location if available
      if (item.location) {
        response += `   📍 स्थान: ${item.location}\n`;
      }
      
      // Add status if available
      if (item.status) {
        response += `   ⚡ स्थिती: ${item.status}\n`;
      }
      
      // Add specific fields based on data type
      if (item.farmerName) {
        response += `   👨‍🌾 शेतकरी: ${item.farmerName}\n`;
      }
      
      if (item.quantity) {
        response += `   📊 प्रमाण: ${item.quantity}\n`;
      }
      
      if (item.price) {
        response += `   💰 किंमत: ₹${item.price}\n`;
      }
      
      if (item.contact) {
        response += `   📞 संपर्क: ${item.contact}\n`;
      }
      
      if (item.address) {
        response += `   🏠 पत्ता: ${item.address}\n`;
      }
      
      if (item.number) {
        response += `   🔢 नंबर: ${item.number}\n`;
      }
      
      if (item.achievement) {
        response += `   🏆 यश: ${item.achievement}\n`;
      }
      
      if (item.village) {
        response += `   🏘️ गाव: ${item.village}\n`;
      }
      
      if (item.doctorName) {
        response += `   👨‍⚕️ डॉक्टर: ${item.doctorName}\n`;
      }
      
      if (item.campType) {
        response += `   🏥 शिबिर प्रकार: ${item.campType}\n`;
      }
      
      if (item.sportType) {
        response += `   ⚽ खेळ प्रकार: ${item.sportType}\n`;
      }
      
      if (item.type) {
        response += `   🏷️ प्रकार: ${item.type}\n`;
      }
      
      if (item.link) {
        response += `   🔗 लिंक: ${item.link}\n`;
      }
      
      // Add photos if available
      if (item.photos && item.photos.length > 0) {
        response += `   📸 फोटो: ${item.photos.length} उपलब्ध\n`;
      }
      
      if (item.imageURL) {
        response += `   🖼️ प्रतिमा: उपलब्ध\n`;
      }
      
      response += '\n';
    });

    if (data.length > 5) {
      response += `... आणि ${data.length - 5} आणखी माहिती उपलब्ध आहे.\n\n`;
    }
    
    response += "💡 आणखी माहिती हवी असल्यास कृपया विषय स्पष्ट करा.";
    
    return response;
  };

  // Handle user input
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Find matching database
      const matches = findMatchingDatabase(inputValue);
      console.log('Found matches:', matches);
      
      if (matches.length > 0) {
        const bestMatch = matches[0];
        console.log('Best match:', bestMatch);
        
        const data = await fetchDataFromFirebase(bestMatch.config.path);
        console.log('Fetched data:', data);
        
        const response = formatResponse(data, bestMatch.config, bestMatch.matchedKeywords);
        
        const botMessage = {
          id: Date.now() + 1,
          text: response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        console.log('No matches found for query:', inputValue);
        
        // Try to provide helpful suggestions based on common queries
        const suggestions = [
          "सरपंच कोण आहे", "पुरस्कार", "ई-सेवा", "आरोग्य शिबिर", 
          "ग्रामसभा निर्णय", "सुविधा", "पर्यटन", "संपर्क",
          "तक्रार नोंदणी", "ई-शिक्षण", "बातम्या", "रुग्णालय",
          "हेल्पलाईन", "योजना", "कार्यक्रम", "सदस्य माहिती"
        ];
        
        const botMessage = {
          id: Date.now() + 1,
          text: `क्षमस्व 🙏, "${inputValue}" या विषयाची माहिती सध्या उपलब्ध नाही.\n\n💡 आपण यापैकी काही विषय विचारू शकता:\n${suggestions.map(s => `• ${s}`).join('\n')}\n\nकिंवा आपला प्रश्न स्पष्ट करा.`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const botMessage = {
        id: Date.now() + 1,
        text: "क्षमस्व, तांत्रिक समस्या आली आहे. कृपया पुन्हा प्रयत्न करा.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsExpanded(true);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Fade in={!isOpen}>
          <IconButton
            onClick={toggleChat}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 60,
              height: 60,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              boxShadow: 3,
            }}
          >
            <ChatBubbleOutline />
          </IconButton>
        </Fade>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Fade in={isOpen}>
          <Paper
            elevation={8}
            sx={{
              width: 350,
              height: isExpanded ? 500 : 400,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                  <SmartToy />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    GramSevak AI
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    ग्राम सेवक AI
                  </Typography>
                </Box>
              </Box>
              <Box>
                <IconButton
                  onClick={toggleExpanded}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <IconButton
                  onClick={toggleChat}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <Close />
                </IconButton>
              </Box>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                bgcolor: '#f5f5f5',
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: message.isUser ? 'primary.main' : 'white',
                      color: message.isUser ? 'white' : 'text.primary',
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.7rem',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'white',
                      boxShadow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="caption">विचार करत आहे...</Typography>
                  </Box>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="आपला प्रश्न टाइप करा..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  multiline
                  maxRows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&:disabled': {
                      bgcolor: 'grey.300',
                      color: 'grey.500',
                    },
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
              
              {/* Quick suggestions */}
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {[
                  'सरपंच कोण आहे', 'पुरस्कार', 'ई-सेवा', 'आरोग्य शिबिर',
                  'ग्रामसभा निर्णय', 'सुविधा', 'पर्यटन', 'संपर्क',
                  'तक्रार नोंदणी', 'ई-शिक्षण', 'बातम्या', 'रुग्णालय'
                ].map((suggestion) => (
                  <Chip
                    key={suggestion}
                    label={suggestion}
                    size="small"
                    onClick={() => setInputValue(suggestion)}
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
                <Chip
                  label="🔧 Test Connection"
                  size="small"
                  onClick={testFirebaseConnection}
                  sx={{ fontSize: '0.7rem', bgcolor: 'secondary.main', color: 'white' }}
                />
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default GramSevakAI;
