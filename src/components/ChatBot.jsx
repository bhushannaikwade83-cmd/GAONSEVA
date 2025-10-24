import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

// --- Levenshtein Distance Calculation (for fuzzy matching) ---
const levenshteinDistance = (str1 = '', str2 = '') => {
  // ... (Keep the levenshteinDistance function as you provided) ...
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
};

const calculateSimilarity = (str1 = '', str2 = '') => {
  // ... (Keep the calculateSimilarity function as you provided) ...
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
};
// --- End Levenshtein ---


const ChatBot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('marathi');
  const messagesEndRef = useRef(null);

  // --- Caching Logic ---
  const [dataCache, setDataCache] = useState({});
  const [cacheTimestamps, setCacheTimestamps] = useState({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const isCacheValid = (cacheKey) => {
    const timestamp = cacheTimestamps[cacheKey];
    return timestamp && Date.now() - timestamp < CACHE_DURATION;
  };

  const getCachedData = (cacheKey) => {
    return isCacheValid(cacheKey) ? dataCache[cacheKey] : null;
  };

  const setCachedData = (cacheKey, data) => {
    setDataCache(prev => ({ ...prev, [cacheKey]: data }));
    setCacheTimestamps(prev => ({ ...prev, [cacheKey]: Date.now() }));
  };
  // --- End Caching Logic ---

  const getCurrentPageId = () => {
    const path = location.pathname;
    return path === '/' ? 'home' : path.replace(/\//g, '_').replace(/^_/, '');
  };

  useEffect(() => {
    const pageId = getCurrentPageId();
    const storageKey = `chatbot-messages-${pageId}`;
    const savedMessages = localStorage.getItem(storageKey);

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const welcomeMessage = {
        id: Date.now(),
        text: language === 'marathi'
          ? 'नमस्कार! मी तुमचा सहाय्यक आहे. तुम्ही कोणताही प्रश्न विचारू शकता.'
          : 'Hello! I am your assistant. You can ask me any question.',
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [location.pathname, language]);

  useEffect(() => {
    const pageId = getCurrentPageId();
    const storageKey = `chatbot-messages-${pageId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, location.pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectLanguage = (text) => {
    const marathiPattern = /[\u0900-\u097F]/;
    return marathiPattern.test(text) ? 'marathi' : 'english';
  };

  // --- Smart Field Mapping (Keep as is) ---
  const getSmartFieldMapping = (text, language) => {
    // ... (Keep the getSmartFieldMapping function exactly as you provided) ...
      if (language !== 'marathi') return null;
    
    const lowerText = text.toLowerCase();
    console.log('Checking smart mapping for text:', lowerText);
    
    // Smart field mappings for specific questions
    const fieldMappings = {
      // Basic info queries
      'ग्रामपंचायतीचं नाव': { collection: 'grampanchayat', field: 'name' },
      'ग्रामपंचायतचं नाव': { collection: 'grampanchayat', field: 'name' },
      'स्थापन': { collection: 'grampanchayat', field: 'establishedYear' },
      'लोकसंख्या': { collection: 'grampanchayat', field: 'population' },
      'पत्ता': { collection: 'grampanchayat', field: 'address' },
      'संपर्क': { collection: 'grampanchayat', field: 'contact' },
      
      // Member specific queries
      'सरपंच कोण': { collection: 'members', field: 'name', filter: { designation: 'सरपंच' } },
      'उपसरपंच कोण': { collection: 'members', field: 'name', filter: { designation: 'उपसरपंच' } },
      'ग्रामसेवक कोण': { collection: 'members', field: 'name', filter: { designation: 'ग्रामसेवक' } },
      'सचिव': { collection: 'members', field: 'contact', filter: { designation: 'सचिव' } },
      
      // Tourism timing queries
      'भेट कधी': { collection: 'tourism', field: 'timings' },
      'देवळाची भेट': { collection: 'tourism', field: 'timings', filter: { name: 'देवळ' } },
      'वेळापत्रक': { collection: 'tourism', field: 'timings' },
      'कधी करता येईल': { collection: 'tourism', field: 'timings' },
      
      // Facility timing queries
      'ग्रंथालयाची वेळ': { collection: 'facilities', field: 'timings', filter: { name: 'ग्रंथालय' } },
      'आरोग्य केंद्र कुठे': { collection: 'facilities', field: 'location', filter: { name: 'आरोग्य केंद्र' } },
      
      // E-service queries
      'जन्म प्रमाणपत्र': { collection: 'eseva', field: 'link', filter: { name: 'जन्म प्रमाणपत्र' } },
      'मृत्यू प्रमाणपत्र': { collection: 'eseva', field: 'link', filter: { name: 'मृत्यू प्रमाणपत्र' } },
      'प्रॉपर्टी टॅक्स': { collection: 'eseva', field: 'link', filter: { name: 'प्रॉपर्टी टॅक्स' } },
      
      // Decision queries
      'शेवटचा निर्णय': { collection: 'decisions', field: ['title', 'description', 'date'], limit: 1 },
      'मंजूर निर्णय': { collection: 'decisions', field: 'title', filter: { status: 'approved' } },
      'प्रलंबित निर्णय': { collection: 'decisions', field: 'title', filter: { status: 'pending' } },
      
      // Award queries
      'पुरस्कार मिळाले': { collection: 'awards', field: ['title', 'date'] },
      '२०२४ मधील पुरस्कार': { collection: 'awards', field: 'title', filter: { date: '2024' } },
      'राष्ट्रीय पुरस्कार': { collection: 'awards', field: 'title', filter: { type: 'राष्ट्रीय' } },
      
      // Festival queries
      'येत्या महिन्यात': { collection: 'festivals', field: ['name', 'date', 'venue'] },
      'सांस्कृतिक कार्यक्रम': { collection: 'festivals', field: 'name', filter: { type: 'सांस्कृतिक' } },
      'धार्मिक कार्यक्रम': { collection: 'festivals', field: 'name', filter: { type: 'धार्मिक' } },
      'पुढचा कार्यक्रम': { collection: 'festivals', field: ['name', 'date'], limit: 1 },
      
      // Census queries
      '२०२१ च्या जनगणना': { collection: 'census', field: 'population', filter: { year: '2021' } },
      'पुरुष आणि स्त्रिया': { collection: 'census', field: ['male', 'female'] },
      'साक्षरता दर': { collection: 'census', field: 'literacyRate' },
      'घरांची संख्या': { collection: 'census', field: 'households' },
      
      // Program queries - Maps specific questions to specific program types/fields
      'स्वच्छ गाव उपक्रमात किती लोकांनी भाग घेतला': { collection: 'program/svachhgaav/items', field: ['participants', 'title', 'startDate', 'endDate'], programType: 'स्वच्छ गाव' },
      'स्वच्छता कार्यक्रमासाठी काय केले': { collection: 'program/svachhgaav/items', field: ['achievements', 'description', 'status'], programType: 'स्वच्छ गाव' },
      'कोणती उत्पादने विकेल ते पिकेल मध्ये आहेत': { collection: 'program/vikeltepikel/items', field: ['productType', 'quantity', 'price', 'farmerName'], programType: 'विकेल-ते-पिकेल' },
      'कोणत्या शेतकऱ्यांचा विकेल ते पिकेल मध्ये समावेश': { collection: 'program/vikeltepikel/items', field: ['farmerName', 'productType', 'quantity', 'price'], programType: 'विकेल-ते-पिकेल' },
      'विकेल ते पिकेल उत्पादनाची किंमत आणि प्रमाण': { collection: 'program/vikeltepikel/items', field: ['price', 'quantity', 'productType', 'farmerName'], programType: 'विकेल-ते-पिकेल' },
      'माझे कुटुंब कार्यक्रमात कोणती कुटुंबे': { collection: 'program/maajhekutumb/items', field: ['familyName', 'headOfFamily', 'members', 'address'], programType: 'माझे-कुटुंब माझी-जबाबदारी' },
      'माझे कुटुंब कार्यक्रमाचा उद्देश': { collection: 'program/maajhekutumb/items', field: ['title', 'description', 'responsibilities'], programType: 'माझे-कुटुंब माझी-जबाबदारी' },
      'कुटुंबांच्या जबाबदाऱ्या काय': { collection: 'program/maajhekutumb/items', field: ['responsibilities', 'achievements', 'status'], programType: 'माझे-कुटुंब माझी-जबाबदारी' },
      'कोणते तंटे सोडवले गेले': { collection: 'program/tantamuktgaav/items', field: ['disputeType', 'parties', 'resolution', 'resolutionDate'], programType: 'तंटामुक्त गाव' },
      'तंट्यांचे निराकरण कधी झाले': { collection: 'program/tantamuktgaav/items', field: ['resolution', 'resolutionDate', 'mediator', 'status'], programType: 'तंटामुक्त गाव' },
      'जलयुक्त शिवार मध्ये कोणते प्रकल्प': { collection: 'program/jalyuktshivar/items', field: ['title', 'area', 'waterSource', 'farmerName', 'status'], programType: 'जलयुक्त शिवार' },
      'किती पाणीसाठा जलयुक्त शिवार ने झाला': { collection: 'program/jalyuktshivar/items', field: ['waterStorage', 'irrigationArea', 'area', 'farmerName'], programType: 'जलयुक्त शिवार' },
      'जलयुक्त योजनेचा खर्च': { collection: 'program/jalyuktshivar/items', field: ['cost', 'area', 'waterStorage', 'irrigationArea'], programType: 'जलयुक्त शिवार' },
      'तुषार सिंचन योजनेची माहिती': { collection: 'program/tushargav/items', field: ['title', 'description', 'sprinklerType', 'coverageArea', 'cost'], programType: 'तुषारगावड' },
      'कोणत्या शेतकऱ्यांनी तुषार सिंचन बसवले': { collection: 'program/tushargav/items', field: ['farmerName', 'area', 'sprinklerType', 'installationDate'], programType: 'तुषारगावड' },
      'स्प्रिंकलर सिंचनाचा खर्च': { collection: 'program/tushargav/items', field: ['cost', 'area', 'sprinklerType', 'coverageArea'], programType: 'तुषारगावड' },
      'रोटी पूरक व्यवसायात कोणते व्यवसाय': { collection: 'program/rotipoorak/items', field: ['businessType', 'entrepreneurName', 'location', 'status'], programType: 'रोती पूरक व्यवसाय' },
      'रोटी पूरक व्यवसायात किती गुंतवणूक': { collection: 'program/rotipoorak/items', field: ['investment', 'businessType', 'entrepreneurName', 'revenue'], programType: 'रोती पूरक व्यवसाय' },
      'किती लोकांना रोटी पूरक व्यवसायात रोजगार': { collection: 'program/rotipoorak/items', field: ['employment', 'businessType', 'entrepreneurName', 'location'], programType: 'रोती पूरक व्यवसाय' },
      'गादोली कार्यक्रमात कोणत्या ऍक्टिव्हिटीज': { collection: 'program/gadoli/items', field: ['activityType', 'organizerName', 'startDate', 'endDate'], programType: 'गादोली' },
      'गादोली कार्यक्रम कोणी आयोजित केला': { collection: 'program/gadoli/items', field: ['organizerName', 'activityType', 'startDate', 'location'], programType: 'गादोली' },
      'गादोलीत किती लोक सहभागी': { collection: 'program/gadoli/items', field: ['participants', 'activityType', 'organizerName', 'startDate'], programType: 'गादोली' },
      'मतदार नोंदणीची प्रक्रिया': { collection: 'program/matdaarnondani/items', field: ['title', 'description', 'registrationDate', 'status'], programType: 'मतदार नोंदणी' },
      'नवीन मतदारांची माहिती': { collection: 'program/matdaarnondani/items', field: ['voterName', 'age', 'gender', 'address', 'registrationDate'], programType: 'मतदार नोंदणी' },
      'मतदार यादीत नाव कसे तपासायचे': { collection: 'program/matdaarnondani/items', field: ['voterName', 'voterId', 'boothNumber', 'address'], programType: 'मतदार नोंदणी' },
      'कोणते विद्यार्थी सर्व शिक्षा अभियानात': { collection: 'program/sarvashiksha/items', field: ['studentName', 'age', 'grade', 'schoolName', 'parentName'], programType: 'सर्व शिक्षा अभियान' },
      'गावातील शाळेचे नाव काय': { collection: 'program/sarvashiksha/items', field: ['schoolName', 'studentName', 'grade', 'address'], programType: 'सर्व शिक्षा अभियान' }
    };
    
    // Find matching field mapping
    for (const [keyword, mapping] of Object.entries(fieldMappings)) {
      // Use higher similarity threshold for smart mapping
      if (calculateSimilarity(lowerText, keyword.toLowerCase()) > 0.8) {
        console.log('Found matching smart keyword:', keyword, 'Mapping:', mapping);
        return mapping;
      }
    }
    
    console.log('No smart mapping found for:', lowerText);
    return null;
  };

  // --- Updated Keyword Matching ---
  const findMatchingKeywords = (text, language) => {
    const lowerText = text.toLowerCase();

    // Image request keywords
    const imageKeywords = {
      marathi: ['चित्र', 'फोटो', 'इमेज', 'दाखवा', 'प्रतिमा', 'छायाचित्र'],
      english: ['image', 'photo', 'picture', 'show', 'display', 'view', 'gallery']
    };
    const hasImageRequest = imageKeywords[language]?.some(keyword => lowerText.includes(keyword));

    const keywordMappings = {
      marathi: {
        'सदस्य': 'members', 'सरपंच': 'members', 'उपसरपंच': 'members', 'ग्राम सेवक': 'members', /* ... other member keywords */
        'निर्णय': 'decisions', 'ग्रामसभा': 'decisions', /* ... other decision keywords */
        'पुरस्कार': 'awards', 'बक्षीस': 'awards', /* ... other award keywords */
        'सण': 'festivals', 'उत्सव': 'festivals', /* ... other festival keywords */
        'सुविधा': 'facilities', 'शाळा': 'facilities', 'रुग्णालय': 'facilities', /* ... other facility keywords */
        'ई-सेवा': 'eseva', 'ऑनलाइन': 'eseva', /* ... other eseva keywords */
        'पर्यटन': 'tourism', 'स्थळ': 'tourism', 'मंदिर': 'tourism', /* ... other tourism keywords */
        'संपर्क': 'contacts', 'फोन': 'contacts', 'नंबर': 'contacts', /* ... other contact keywords */
        'हेल्पलाईन': 'helplines', /* ... other helpline keywords */
        'रुग्णालय': 'hospitals', 'दवाखाना': 'hospitals', /* ... other hospital keywords */
        'जनगणना': 'census', 'लोकसंख्या': 'census', /* ... other census keywords */
        'योजना': 'yojana', 'सरकार': 'yojana', 'स्कीम': 'yojana', /* ... other yojana keywords */
        'माहिती': 'info', 'विवरण': 'info', 'गॅलरी': 'info', /* ... other info keywords */

        // **Specific Program Keywords Mapped to Identifiers**
        'स्वच्छ गाव': 'svachhgaav', 'स्वच्छता': 'svachhgaav',
        'विकेल ते पिकेल': 'vikeltepikel', 'पिकेल': 'vikeltepikel',
        'माझे कुटुंब': 'maajhekutumb', 'कुटुंब': 'maajhekutumb', 'जबाबदारी': 'maajhekutumb',
        'तंटामुक्त': 'tantamuktgaav', 'तंटा': 'tantamuktgaav',
        'जलयुक्त शिवार': 'jalyuktshivar', 'शिवार': 'jalyuktshivar', 'जलसंधारण': 'jalyuktshivar',
        'तुषार गाव': 'tushargav', 'तुषारगावड': 'tushargav', 'सिंचन': 'tushargav',
        'रोटी पूरक': 'rotipoorak', 'पूरक व्यवसाय': 'rotipoorak',
        'गादोली': 'gadoli',
        'मतदार नोंदणी': 'matdaarnondani', 'मतदार': 'matdaarnondani',
        'सर्व शिक्षा': 'sarvashiksha', 'शिक्षण': 'sarvashiksha',
        'क्रीडा स्पर्धा': 'kreedaspardha', 'क्रीडा': 'kreedaspardha', 'स्पर्धा': 'kreedaspardha',
        'आरोग्य शिबिर': 'aarogyashibir', 'आरोग्य': 'aarogyashibir', 'शिबिर': 'aarogyashibir',
        'कचरा नियोजन': 'kachryacheniyojan', 'कचरा': 'kachryacheniyojan',
        'बायोगॅस': 'biogasnirmiti',
        'सेंद्रिय खत': 'sendriyakhat', 'खत': 'sendriyakhat',

        // General Program Keywords
        'उपक्रम': 'programs_summary', 'कार्यक्रम': 'programs_summary', 'अभियान': 'programs_summary', 'प्रकल्प': 'programs_summary',
      },
      english: {
        'member': 'members', 'sarpanch': 'members', /* ... */
        'decision': 'decisions', 'meeting': 'decisions', /* ... */
        'award': 'awards', 'prize': 'awards', /* ... */
        'festival': 'festivals', 'event': 'festivals', /* ... */
        'facility': 'facilities', 'school': 'facilities', /* ... */
        'e-service': 'eseva', 'online': 'eseva', /* ... */
        'tourism': 'tourism', 'place': 'tourism', /* ... */
        'contact': 'contacts', 'phone': 'contacts', /* ... */
        'helpline': 'helplines', /* ... */
        'hospital': 'hospitals', 'clinic': 'hospitals', /* ... */
        'census': 'census', 'population': 'census', /* ... */
        'scheme': 'yojana', 'government': 'yojana', /* ... */
        'information': 'info', 'details': 'info', 'gallery': 'info', /* ... */

        // Specific Program Keywords
        'clean village': 'svachhgaav', 'cleanliness': 'svachhgaav',
        'vikel te pikel': 'vikeltepikel',
        'my family': 'maajhekutumb', 'family responsibility': 'maajhekutumb',
        'dispute free': 'tantamuktgaav',
        'jalyukt shivar': 'jalyuktshivar', 'water conservation': 'jalyuktshivar',
        'tushar gaon': 'tushargav', 'sprinkler': 'tushargav',
        'roti poorak': 'rotipoorak', 'supplementary business': 'rotipoorak',
        'gadoli': 'gadoli',
        'voter registration': 'matdaarnondani', 'voter': 'matdaarnondani',
        'sarva shiksha': 'sarvashiksha', 'education': 'sarvashiksha',
        'sports competition': 'kreedaspardha', 'sports': 'kreedaspardha',
        'health camp': 'aarogyashibir', 'health': 'aarogyashibir',
        'waste management': 'kachryacheniyojan', 'waste': 'kachryacheniyojan',
        'biogas': 'biogasnirmiti',
        'organic fertilizer': 'sendriyakhat', 'fertilizer': 'sendriyakhat',

        // General Program Keywords
        'program': 'programs_summary', 'initiative': 'programs_summary', 'campaign': 'programs_summary', 'project': 'programs_summary',
      }
    };

    const keywords = keywordMappings[language] || {};
    let matchedCategory = null;
    let bestMatch = { keyword: '', score: 0 };
    const FUZZY_THRESHOLD = 0.7; // Adjust threshold for better accuracy

    // Exact and Fuzzy Matching Logic
    for (const [keyword, category] of Object.entries(keywords)) {
      const lowerKeyword = keyword.toLowerCase();
      if (lowerText.includes(lowerKeyword)) {
        // Higher score for exact contains match
        if (1 > bestMatch.score) {
            bestMatch = { keyword, score: 1 };
            matchedCategory = category;
        }
      } else {
          // Check fuzzy score only if no exact match found yet or if score is better
          const score = calculateSimilarity(lowerText, lowerKeyword);
          if (score > bestMatch.score && score >= FUZZY_THRESHOLD) {
             bestMatch = { keyword, score };
             matchedCategory = category;
          }
      }
    }

    // If still no match, consider partial word matches (e.g., "स्वच्छ" should map to svachhgaav)
    if (!matchedCategory && language === 'marathi') {
        const partialMappings = {
            'स्वच्छ': 'svachhgaav',
            'जलयुक्त': 'jalyuktshivar',
            'तुषार': 'tushargav',
            'रोटी': 'rotipoorak',
            'मतदार': 'matdaarnondani',
            'शिक्षण': 'sarvashiksha',
            'क्रीडा': 'kreedaspardha',
            'आरोग्य': 'aarogyashibir', // Could map to camp or hospital, need context
            'कचरा': 'kachryacheniyojan',
            'बायोगॅस': 'biogasnirmiti',
            'खत': 'sendriyakhat'
        };
        for (const [partial, category] of Object.entries(partialMappings)) {
            if (lowerText.includes(partial)) {
                // Lower confidence for partial match
                if (0.6 > bestMatch.score) {
                    matchedCategory = category;
                    bestMatch = { keyword: partial, score: 0.6 };
                }
                break; // Take the first partial match
            }
        }
    }


    return {
      category: matchedCategory,
      hasImageRequest: hasImageRequest || false,
      confidence: bestMatch.score
    };
  };

  // --- Firebase Data Fetching Functions (Keep existing, add specific program fetch) ---
  const fetchMembers = async () => { /* ... Keep existing ... */
      const cacheKey = 'members';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const membersRef = collection(db, 'members');
      const q = query(membersRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
};
  const fetchDecisions = async () => { /* ... Keep existing ... */
      const cacheKey = 'decisions';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const decisionsRef = collection(db, 'decisions');
      const q = query(decisionsRef, orderBy('createdAt', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching decisions:', error);
      return [];
    }
};
  const fetchAwards = async () => { /* ... Keep existing ... */
      try {
      const awardsRef = collection(db, 'awards');
      const q = query(awardsRef, orderBy('date', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching awards:', error);
      return [];
    }
};
  const fetchFestivals = async () => { /* ... Keep existing ... */
      try {
      const festivalsRef = collection(db, 'festivals');
      const q = query(festivalsRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching festivals:', error);
      return [];
    }
};
  const fetchFacilities = async () => { /* ... Keep existing ... */
      const cacheKey = 'facilities';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const facilitiesRef = collection(db, 'facilities');
      const q = query(facilitiesRef, orderBy('name'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    }
};
  const fetchESeva = async () => { /* ... Keep existing ... */
      try {
      const esevaRef = collection(db, 'eseva');
      const q = query(esevaRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching e-seva:', error);
      return [];
    }
};
  const fetchTourism = async () => { /* ... Keep existing ... */
      const cacheKey = 'tourism';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const tourismRef = collection(db, 'tourism');
      const q = query(tourismRef, orderBy('name'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching tourism:', error);
      return [];
    }
};
  const fetchContacts = async () => { /* ... Keep existing ... */
      try {
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
};
  const fetchHospitals = async () => { /* ... Keep existing ... */
      try {
      const hospitalsRef = collection(db, 'hospitals');
      const q = query(hospitalsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      return [];
    }
};
  const fetchHelplines = async () => { /* ... Keep existing ... */
      try {
      const helplinesRef = collection(db, 'helplines');
      const q = query(helplinesRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching helplines:', error);
      return [];
    }
};
  const fetchCensus = async () => { /* ... Keep existing ... */
      try {
      const censusRef = collection(db, 'census');
      const q = query(censusRef, orderBy('year', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching census:', error);
      return [];
    }
};
  const fetchDigitalSlogans = async () => { /* ... Keep existing ... */
      try {
      const slogansRef = collection(db, 'digitalSlogans');
      const q = query(slogansRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching digital slogans:', error);
      return [];
    }
};
  const fetchGovLogos = async () => { /* ... Keep existing ... */
      try {
      const logosRef = collection(db, 'govLogos');
      const q = query(logosRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching gov logos:', error);
      return [];
    }
};
  const fetchYojana = async () => { /* ... Keep existing ... */
      try {
      const yojanaData = [];
      
      // Fetch state schemes
      try {
        const stateRef = collection(db, 'yojana', 'state', 'items');
        const stateSnapshot = await getDocs(stateRef);
        stateSnapshot.docs.forEach(doc => {
          yojanaData.push({ id: doc.id, ...doc.data(), type: 'state' });
        });
      } catch (error) {
        console.error('Error fetching state yojana:', error);
      }
      
      // Fetch central schemes
      try {
        const centralRef = collection(db, 'yojana', 'central', 'items');
        const centralSnapshot = await getDocs(centralRef);
        centralSnapshot.docs.forEach(doc => {
          yojanaData.push({ id: doc.id, ...doc.data(), type: 'central' });
        });
      } catch (error) {
        console.error('Error fetching central yojana:', error);
      }
      
      return yojanaData;
    } catch (error) {
      console.error('Error fetching yojana:', error);
      return [];
    }
};
  const fetchExtraServices = async () => { /* ... Keep existing ... */
      try {
      const extraTypes = ['pragat-shetkari', 'e-shikshan', 'batmya', 'sampark'];
      const extraData = [];
      
      for (const extraType of extraTypes) {
        try {
          const extraRef = collection(db, 'extra', extraType, 'items');
          const snapshot = await getDocs(extraRef);
          const items = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            extraType: extraType 
          }));
          extraData.push(...items);
        } catch (error) {
          console.error(`Error fetching ${extraType}:`, error);
        }
      }
      
      return extraData;
    } catch (error) {
      console.error('Error fetching extra services:', error);
      return [];
    }
};
  const fetchHomeInfo = async () => { /* ... Keep existing ... */
      try {
      const homeInfoData = {};
      
      // Fetch different types of home info
      const infoTypes = ['weeklyMarkets', 'tourism', 'gallery', 'eServices', 'howToReach', 'healthyHabits'];
      
      for (const infoType of infoTypes) {
        try {
          const infoRef = collection(db, 'home', 'grampanchayat-info', infoType);
          const snapshot = await getDocs(infoRef);
          homeInfoData[infoType] = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
        } catch (error) {
          console.error(`Error fetching ${infoType}:`, error);
          homeInfoData[infoType] = [];
        }
      }
      
      return homeInfoData;
    } catch (error) {
      console.error('Error fetching home info:', error);
      return {};
    }
};

  // NEW: Fetch data for a specific program
  const fetchSpecificProgram = async (programType) => {
    const cacheKey = `program-${programType}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${programType}`);
      return cachedData;
    }

    try {
        console.log(`Fetching specific program data for: ${programType}`);
        const programRef = collection(db, 'program', programType, 'items');
        // Add ordering if needed, e.g., by a date field or title
        // const q = query(programRef, orderBy('startDate', 'desc'));
        const q = query(programRef); // Simple query for now
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            programType: programType // Keep track of the type
        }));
        console.log(`Fetched ${data.length} items for ${programType}`);
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching specific program ${programType}:`, error);
        return [];
    }
  };

   // Fetch data for ALL programs (used for summary)
   const fetchAllPrograms = async () => {
    const cacheKey = 'programs_all';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        console.log("Using cached data for all programs summary");
        return cachedData;
    }
    try {
        console.log("Fetching data for all programs summary...");
        const programTypes = [
            'svachhgaav', 'vikeltepikel', 'maajhekutumb', 'tantamuktgaav',
            'jalyuktshivar', 'tushargav', 'rotipoorak', 'gadoli',
            'matdaarnondani', 'sarvashiksha', 'kreedaspardha', 'aarogyashibir',
            'kachryacheniyojan', 'biogasnirmiti', 'sendriyakhat'
        ];
        const allProgramsData = [];
        for (const type of programTypes) {
            // Fetch only necessary fields like title for summary
            const programRef = collection(db, 'program', type, 'items');
            const snapshot = await getDocs(query(programRef, limit(3))); // Limit results per type for summary
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                allProgramsData.push({
                    id: doc.id,
                    title: data.title || type, // Use type as fallback title
                    programType: type
                });
            });
        }
        console.log(`Fetched summary data for ${allProgramsData.length} program items.`);
        setCachedData(cacheKey, allProgramsData);
        return allProgramsData;
    } catch (error) {
      console.error('Error fetching all programs:', error);
      return [];
    }
  };


  // --- Smart Fetch & Formatting ---
  const smartFetchData = async (mapping) => { /* ... Keep existing ... */
      try {
      const { collection: collectionName, field, filter, limit } = mapping;
      
      console.log('Smart fetch for:', collectionName, 'fields:', field);
      
      // Handle program subcollections
      if (collectionName.includes('program/') && collectionName.includes('/items')) {
        const collectionRef = collection(db, collectionName);
        let q = query(collectionRef);
        
        // Apply ordering by date for programs (if date field exists)
        try {
          q = query(q, orderBy('date', 'desc'));
        } catch (dateError) {
          // If date field doesn't exist, try other common date fields
          try {
            q = query(q, orderBy('startDate', 'desc'));
          } catch (startDateError) {
            try {
              q = query(q, orderBy('createdAt', 'desc'));
            } catch (createdAtError) {
              // If no date field exists, continue without ordering
              console.log('No date field found for ordering');
            }
          }
        }
        
        // Apply limits
        if (limit) {
          q = query(q, limit(limit));
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log('Fetched program data:', data);
        return data;
      }
      
      // Handle regular collections
      let q = query(collection(db, collectionName));
      
      // Apply filters if specified
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          q = query(q, where(key, '==', value));
        });
      }
      
      // Apply ordering and limits
      if (limit) {
        q = query(q, limit(limit));
      }
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log('Fetched regular data:', data);
      return data;
    } catch (error) {
      console.error('Error in smart fetch:', error);
     // Avoid logging collectionName if it's undefined
     if(mapping && mapping.collection) {
        console.error('Collection path:', mapping.collection);
     } else {
        console.error('Collection path information missing in mapping.');
     }
      return [];
    }
};
  const formatSmartResponse = (mapping, data, userMessage) => { /* ... Keep existing ... */
      const { collection, field } = mapping;
    
    if (data.length === 0) {
      return "माफ करा, ह्या प्रश्नाची माहिती उपलब्ध नाही.";
    }
    
    const item = data[0]; // Assume first item is relevant for single-field queries
    
    // Format based on collection and field
    switch (collection) {
      case 'grampanchayat':
        if (field === 'name') return `आपल्या ग्रामपंचायतीचं नाव: ${item.name || 'उपलब्ध नाही'}`;
        if (field === 'establishedYear') return `ग्रामपंचायत ${item.establishedYear || 'वर्ष उपलब्ध नाही'} मध्ये स्थापन झाली.`;
        if (field === 'population') return `गावातील लोकसंख्या: ${item.population || 'उपलब्ध नाही'}`;
        if (field === 'address') return `ग्रामपंचायतचा पत्ता: ${item.address || 'उपलब्ध नाही'}`;
        if (field === 'contact') return `ग्रामपंचायतचा संपर्क: ${item.contact || 'उपलब्ध नाही'}`;
        break;
        
      case 'members':
        if (field === 'name') {
          const names = data.map(m => m.name).join(', ');
          if (userMessage.includes('सरपंच')) return `सरपंच: ${names}`;
          if (userMessage.includes('उपसरपंच')) return `उपसरपंच: ${names}`;
          if (userMessage.includes('ग्रामसेवक')) return `ग्रामसेवक: ${names}`;
          return `सदस्य: ${names}`;
        }
        if (field === 'contact') return `संपर्क: ${item.contact || 'उपलब्ध नाही'}`;
        break;
        
      case 'tourism':
        if (field === 'timings') {
          const timings = data.map(t => `${t.name || 'स्थळ'}: ${t.timings || 'वेळ उपलब्ध नाही'}`).join('\n');
          return `पर्यटन स्थळांची वेळ:\n${timings}`;
        }
        break;
        
      case 'facilities':
        if (field === 'timings') {
          const timings = data.map(f => `${f.name || 'सुविधा'}: ${f.timings || 'वेळ उपलब्ध नाही'}`).join('\n');
          return `सुविधांची वेळ:\n${timings}`;
        }
        if (field === 'location') {
          const locations = data.map(f => `${f.name || 'सुविधा'}: ${f.location || 'स्थान उपलब्ध नाही'}`).join('\n');
          return `सुविधांचे स्थान:\n${locations}`;
        }
        break;
        
      case 'eseva':
        if (field === 'link') {
          const links = data.map(e => `${e.name || 'सेवा'}: ${e.link || 'लिंक उपलब्ध नाही'}`).join('\n');
          return `ई-सेवा लिंक:\n${links}`;
        }
        break;
        
      case 'decisions':
        if (Array.isArray(field)) {
          const decision = data[0];
          return `शेवटचा निर्णय:\n${decision.title || 'शीर्षक नाही'}\n${decision.description || ''}\nदिनांक: ${decision.date || 'तारीख नाही'}`;
        }
        break;
        
      case 'awards':
        if (Array.isArray(field)) {
          const awards = data.map(a => `${a.title || 'पुरस्कार'}: ${a.date || 'तारीख नाही'}`).join('\n');
          return `पुरस्कार:\n${awards}`;
        }
        break;
        
      case 'festivals':
        if (Array.isArray(field)) {
          const festivals = data.map(f => `${f.name || 'कार्यक्रम'}: ${f.date || 'तारीख नाही'} (${f.venue || 'स्थळ नाही'})`).join('\n');
          return `कार्यक्रम:\n${festivals}`;
        }
        break;
        
      case 'census':
        // Make sure 'item' has census data before accessing fields
        const censusData = data[0] || {};
        if (field === 'population' && mapping.filter?.year) return `${mapping.filter.year} च्या जनगणनेनुसार लोकसंख्या: ${censusData.population || 'उपलब्ध नाही'}`;
        if (field === 'population') return `एकूण लोकसंख्या: ${censusData.population || 'उपलब्ध नाही'}`;
        if (Array.isArray(field) && field.includes('male')) {
          return `जनगणना माहिती:\nपुरुष: ${censusData.male || 'उपलब्ध नाही'}\nस्त्रिया: ${censusData.female || 'उपलब्ध नाही'}`;
        }
        if (field === 'literacyRate') return `साक्षरता दर: ${censusData.literacyRate || 'उपलब्ध नाही'}%`;
        if (field === 'households') return `एकूण घरांची संख्या: ${censusData.households || 'उपलब्ध नाही'}`;
        break;
        
        // This case might be redundant now if specific program collections are handled below
      case 'programs':
        if (Array.isArray(field)) {
          const programs = data.map(p => `${p.title || 'कार्यक्रम'}: ${p.date || 'तारीख नाही'} (${p.venue || 'स्थळ नाही'})`).join('\n');
          return `कार्यक्रम:\n${programs}`;
        }
        break;
        
      // Handle program subcollections from smart mapping
      default:
        if (collection.includes('program/') && collection.includes('/items')) {
          const programType = mapping.programType || 'कार्यक्रम';
          if (Array.isArray(field)) {
                // If only specific fields were requested, format them
                const requestedFields = field;
                let response = `${programType} माहिती:\n\n`;
                data.slice(0, 5).forEach((program, index) => { // Limit to 5 results
                    response += `${index + 1}. ${program.title || programType}\n`;
                    requestedFields.forEach(f => {
                       if (program[f]) {
                          response += `   • ${f}: ${program[f]}\n`;
                       }
                    });
                    response += '\n';
                });
                if(data.length > 5) response += `(... आणि ${data.length - 5} इतर)`;
              return response.trim();

          } else if (typeof field === 'string') {
              // If a single field was requested
              const values = data.map(p => p[field]).filter(Boolean).join(', ');
              return `${programType} - ${field}: ${values || 'माहिती नाही'}`;
          }
        }
        break;
    }
    
    // Fallback response if formatting fails for a specific case
    console.warn("Smart response formatting failed for:", mapping, data);
    return "माफ करा, ह्या प्रश्नाची माहिती सध्या उपलब्ध नाही. कृपया वेगळा प्रश्न विचारा.";
  };


  // --- Updated Response Generation ---
  const generateResponse = async (userMessage, detectedLanguage) => {
    console.log('Generating response for:', userMessage, 'Language:', detectedLanguage);

    // 1. Try Smart Mapping First (High Confidence)
    const smartMapping = getSmartFieldMapping(userMessage, detectedLanguage);
    if (smartMapping) {
      console.log('Using smart mapping:', smartMapping);
      const smartData = await smartFetchData(smartMapping);
      if (smartData.length > 0) {
        return formatSmartResponse(smartMapping, smartData, userMessage);
      } else {
        console.log('No data from smart fetch, falling back to keywords.');
      }
    }

    // 2. Fallback to Keyword Matching
    const matchResult = findMatchingKeywords(userMessage, detectedLanguage);
    const category = matchResult.category;
    const hasImageRequest = matchResult.hasImageRequest;
    const confidence = matchResult.confidence;

    console.log('Keyword match result:', matchResult);

    if (!category || confidence < 0.6) { // Add confidence threshold
      // Fallback suggestions
      const suggestions = detectedLanguage === 'marathi'
        ? ['सदस्यांची माहिती', 'ग्रामसभेचे निर्णय', 'संपर्क', 'पर्यटन स्थळे', 'उपक्रम']
        : ['Members info', 'Decisions', 'Contacts', 'Tourism', 'Programs'];
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      return detectedLanguage === 'marathi'
        ? `माफ करा, मला प्रश्न समजला नाही. कदाचित हे विचारा: "${randomSuggestion}"`
        : `Sorry, I didn't understand. Maybe ask about: "${randomSuggestion}"`;
    }

    let data = [];
    let responseText = '';
    const MAX_ITEMS_DISPLAY = 5; // Max items to list in response

    try {
      // Check if category is a specific program identifier
      const programTypes = [
          'svachhgaav', 'vikeltepikel', 'maajhekutumb', 'tantamuktgaav',
          'jalyuktshivar', 'tushargav', 'rotipoorak', 'gadoli',
          'matdaarnondani', 'sarvashiksha', 'kreedaspardha', 'aarogyashibir',
          'kachryacheniyojan', 'biogasnirmiti', 'sendriyakhat'
      ];

      if (programTypes.includes(category)) {
          data = await fetchSpecificProgram(category);
          if (data.length > 0) {
              const programName = detectedLanguage === 'marathi'
                  ? (data[0].title || category).replace(/_/g, ' ') // Make it readable
                  : category;
              responseText = detectedLanguage === 'marathi'
                  ? `${programName} कार्यक्रमाची माहिती:\n\n`
                  : `Information about the ${programName} program:\n\n`;

              responseText += data.slice(0, MAX_ITEMS_DISPLAY).map((item, index) => {
                  let itemText = `• ${item.title || programName + ' ' + (index + 1)}`;
                  // Add 1-2 key details based on program type
                  if (item.description) itemText += ` - ${item.description.substring(0, 50)}...`;
                  if (item.status) itemText += ` (स्थिती: ${item.status})`;
                  if (item.date) itemText += ` (दिनांक: ${item.date})`;
                  if (item.startDate) itemText += ` (सुरुवात: ${item.startDate})`;
                  if (item.farmerName) itemText += ` (शेतकरी: ${item.farmerName})`;
                  if (item.studentName) itemText += ` (विद्यार्थी: ${item.studentName})`;
                  if (hasImageRequest && item.imageUrl) itemText += `\n  🖼️ चित्र: ${item.imageUrl}`;
                  return itemText;
              }).join('\n');
               if (data.length > MAX_ITEMS_DISPLAY) {
                  responseText += `\n\n(... आणि ${data.length - MAX_ITEMS_DISPLAY} इतर)`;
              }

          } else {
             responseText = detectedLanguage === 'marathi' ? `${category.replace(/_/g, ' ')} कार्यक्रमाबद्दल कोणतीही माहिती उपलब्ध नाही.` : `No information found for the ${category} program.`;
          }

      } else {
         // Handle other general categories
          switch (category) {
            case 'members':
              data = await fetchMembers();
              if (data.length > 0) {
                  responseText = detectedLanguage === 'marathi' ? 'ग्रामपंचायत सदस्य:\n\n' : 'Gram Panchayat Members:\n\n';
                  responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(member => {
                      let text = `• ${member.name} - ${member.designation}`;
                      if (hasImageRequest && (member.imageURL || member.photoURL)) text += `\n  🖼️ चित्र: ${member.imageURL || member.photoURL}`;
                      return text;
                  }).join('\n');
                   if (data.length > MAX_ITEMS_DISPLAY) responseText += `\n(... आणि ${data.length - MAX_ITEMS_DISPLAY} इतर सदस्य)`;
              }
              break;
            case 'decisions':
                data = await fetchDecisions();
                 if (data.length > 0) {
                    responseText = detectedLanguage === 'marathi' ? 'नवीनतम ग्रामसभा निर्णय:\n\n' : 'Latest Gram Sabha Decisions:\n\n';
                    responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(d => {
                         let text = `• ${d.title} (${d.date || 'तारीख नाही'}) - ${d.status || 'Pending'}`;
                         if (hasImageRequest && d.imageURL) text += `\n  🖼️ चित्र: ${d.imageURL}`;
                         if (hasImageRequest && d.docURL) text += `\n  📄 दस्तावेज: ${d.docURL}`;
                         return text;
                    }).join('\n');
                 }
                break;
            case 'awards':
                data = await fetchAwards();
                 if (data.length > 0) {
                    responseText = detectedLanguage === 'marathi' ? 'पुरस्कार आणि सन्मान:\n\n' : 'Awards and Recognition:\n\n';
                    responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(a => {
                         let text = `• ${a.title} (${a.date || 'तारीख नाही'}) - ${a.recipient || ''}`;
                         if (hasImageRequest && a.imageURL) text += `\n  🖼️ चित्र: ${a.imageURL}`;
                          if (hasImageRequest && a.docURL) text += `\n  📄 दस्तावेज: ${a.docURL}`;
                         return text;
                    }).join('\n');
                 }
                break;
             case 'festivals':
                 data = await fetchFestivals();
                 if (data.length > 0) {
                     responseText = detectedLanguage === 'marathi' ? 'सण-उत्सव:\n\n' : 'Festivals and Celebrations:\n\n';
                     responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(f => {
                         let text = `• ${f.name} (${f.date || 'तारीख नाही'}) - ${f.venue || ''}`;
                         if (hasImageRequest && f.imageURL) text += `\n  🖼️ चित्र: ${f.imageURL}`;
                          if (hasImageRequest && f.docURL) text += `\n  📄 दस्तावेज: ${f.docURL}`;
                         return text;
                     }).join('\n');
                 }
                 break;
             case 'facilities':
                 data = await fetchFacilities();
                 if (data.length > 0) {
                     responseText = detectedLanguage === 'marathi' ? 'गावातील सुविधा:\n\n' : 'Village Facilities:\n\n';
                     responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(f => {
                         let text = `• ${f.name} - ${f.type || ''} (${f.location || ''})`;
                          if (hasImageRequest && f.imageURL) text += `\n  🖼️ चित्र: ${f.imageURL}`;
                         return text;
                     }).join('\n');
                     if (data.length > MAX_ITEMS_DISPLAY) responseText += `\n(... आणि ${data.length - MAX_ITEMS_DISPLAY} इतर सुविधा)`;
                 }
                 break;
            case 'eseva':
                data = await fetchESeva();
                 if (data.length > 0) {
                     responseText = detectedLanguage === 'marathi' ? 'ई-सेवा:\n\n' : 'E-Services:\n\n';
                     responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(s => `• ${s.name} - [Link](${s.link || '#'})`).join('\n'); // Using Markdown link
                      if (data.length > MAX_ITEMS_DISPLAY) responseText += `\n(... आणि ${data.length - MAX_ITEMS_DISPLAY} इतर सेवा)`;
                 }
                break;
             case 'tourism':
                 data = await fetchTourism();
                 if (data.length > 0) {
                     responseText = detectedLanguage === 'marathi' ? 'पर्यटन स्थळे:\n\n' : 'Tourist Places:\n\n';
                     responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(p => {
                          let text = `• ${p.name} - ${p.type || ''} (${p.location || ''})`;
                          if (hasImageRequest && p.imageURL) text += `\n  🖼️ चित्र: ${p.imageURL}`;
                          return text;
                     }).join('\n');
                      if (data.length > MAX_ITEMS_DISPLAY) responseText += `\n(... आणि ${data.length - MAX_ITEMS_DISPLAY} इतर स्थळे)`;
                 }
                 break;
            case 'contacts':
                 data = await fetchContacts();
                 if (data.length > 0) {
                     responseText = detectedLanguage === 'marathi' ? 'संपर्क माहिती:\n\n' : 'Contact Information:\n\n';
                     responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(c => `• ${c.name} (${c.role || ''}) - ${c.phone || ''}`).join('\n');
                      if (data.length > MAX_ITEMS_DISPLAY) responseText += `\n(... आणि ${data.length - MAX_ITEMS_DISPLAY} इतर संपर्क)`;
                 }
                 break;
            case 'hospitals':
                data = await fetchHospitals();
                if (data.length > 0) {
                    responseText = detectedLanguage === 'marathi' ? 'रुग्णालये:\n\n' : 'Hospitals:\n\n';
                    responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(h => `• ${h.name} - ${h.type || ''} (${h.contact || ''})`).join('\n');
                    if (data.length > MAX_ITEMS_DISPLAY) responseText += `\n(... आणि ${data.length - MAX_ITEMS_DISPLAY} इतर)`;
                }
                break;
            case 'helplines':
                 data = await fetchHelplines();
                 if (data.length > 0) {
                    responseText = detectedLanguage === 'marathi' ? 'हेल्पलाईन नंबर्स:\n\n' : 'Helpline Numbers:\n\n';
                     responseText += data.map(h => `• ${h.serviceName} (${h.department || ''}) - ${h.number || ''}`).join('\n');
                 }
                 break;
            case 'census':
                data = await fetchCensus();
                if (data.length > 0) {
                    const c = data[0]; // Assuming latest census
                    responseText = detectedLanguage === 'marathi'
                        ? `जनगणना (${c.year}):\n• लोकसंख्या: ${c.totalPopulation}\n• पुरुष: ${c.male}\n• महिला: ${c.female}\n• साक्षरता: ${c.literacyRate}%`
                        : `Census (${c.year}):\n• Population: ${c.totalPopulation}\n• Male: ${c.male}\n• Female: ${c.female}\n• Literacy: ${c.literacyRate}%`;
                }
                break;
             case 'yojana':
                 data = await fetchYojana();
                 if (data.length > 0) {
                    responseText = detectedLanguage === 'marathi' ? 'सरकारी योजना:\n\n' : 'Government Schemes:\n\n';
                    responseText += data.slice(0, MAX_ITEMS_DISPLAY).map(y => `• ${y.title} (${y.type === 'state' ? 'राज्य' : 'केंद्र'})`).join('\n');
                    if (data.length > MAX_ITEMS_DISPLAY) responseText += `\n(... आणि ${data.length - MAX_ITEMS_DISPLAY} इतर योजना)`;
                 }
                 break;
             case 'programs_summary': // Handles general program queries
                 data = await fetchAllPrograms();
                 if (data.length > 0) {
                    // Group by type for a better summary
                    const grouped = data.reduce((acc, curr) => {
                       acc[curr.programType] = (acc[curr.programType] || 0) + 1;
                       return acc;
                    }, {});
                    responseText = detectedLanguage === 'marathi' ? 'उपलब्ध कार्यक्रम प्रकार:\n\n' : 'Available Program Types:\n\n';
                    responseText += Object.entries(grouped)
                        .map(([type, count]) => `• ${type.replace(/_/g, ' ')} (${count} नोंदणी)`)
                        .join('\n');
                    responseText += detectedLanguage === 'marathi' ? '\n\nअधिक माहितीसाठी विशिष्ट कार्यक्रमाचे नाव विचारा.' : '\n\nAsk about a specific program for more details.';
                 } else {
                     responseText = detectedLanguage === 'marathi' ? 'सध्या कोणतेही कार्यक्रम उपलब्ध नाहीत.' : 'No programs are currently listed.';
                 }
                 break;
            case 'info':
              const homeInfo = await fetchHomeInfo();
              const extraInfo = await fetchExtraServices(); // Example: fetch other relevant general info
              responseText = detectedLanguage === 'marathi' ? 'ग्रामपंचायत सामान्य माहिती:\n' : 'General Gram Panchayat Information:\n';
              if(homeInfo.weeklyMarkets?.length > 0) responseText += `\n• साप्ताहिक बाजार: ${homeInfo.weeklyMarkets.map(m => m.day).join(', ')}`;
              if(homeInfo.tourism?.length > 0) responseText += `\n• पर्यटन स्थळे: ${homeInfo.tourism.map(p => p.name).join(', ')}`;
              if(extraInfo.length > 0) responseText += `\n• इतर सेवा: ${extraInfo.slice(0,3).map(e => e.title || e.extraType).join(', ')}...`;
              if(!homeInfo.weeklyMarkets?.length && !homeInfo.tourism?.length && !extraInfo.length) {
                 responseText = detectedLanguage === 'marathi' ? 'सामान्य माहितीसाठी, सदस्य, निर्णय, किंवा सुविधांबद्दल विचारा.' : 'For general info, ask about members, decisions, or facilities.';
              }
              break;
            default:
              // This case should ideally not be reached if keyword matching is exhaustive
              responseText = detectedLanguage === 'marathi'
                ? 'माफ करा, याबद्दल माहिती सापडली नाही.'
                : 'Sorry, I could not find information about that.';
          }
      }

    } catch (error) {
      console.error('Error in generateResponse:', error);
      responseText = detectedLanguage === 'marathi'
        ? 'माफ करा, माहिती मिळवताना त्रुटी आली.'
        : 'Sorry, there was an error retrieving the information.';
    }

    // Append a note if confidence is low
     if (confidence < 0.7 && confidence > 0) { // Add lower bound
        responseText += detectedLanguage === 'marathi'
         ? `\n\n(टीप: मला खात्री नाही की हा योग्य प्रतिसाद आहे. आपण प्रश्न अधिक स्पष्ट करू शकता का?)`
         : `\n\n(Note: I'm not fully confident this is the right response. Could you clarify your question?)`;
     }


    return responseText || (detectedLanguage === 'marathi'
      ? 'माफ करा, याबद्दल कोणतीही माहिती उपलब्ध नाही.'
      : 'Sorry, no information is available for that topic.');
  };


  // --- Handle Send Message (Keep as is) ---
  const handleSendMessage = async () => { /* ... Keep existing ... */
      if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Detect language and generate response
    const detectedLanguage = detectLanguage(inputMessage);
    const botResponse = await generateResponse(inputMessage, detectedLanguage);

    setTimeout(() => {
      const matchResult = findMatchingKeywords(inputMessage, detectedLanguage);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date().toISOString(),
        confidence: matchResult.confidence // Pass confidence here
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000); // Simulate bot thinking time
};

  // --- Handle Key Press (Keep as is) ---
  const handleKeyPress = (e) => { /* ... Keep existing ... */
      if (e.key === 'Enter') {
      handleSendMessage();
    }
};

  // --- Clear Cache (Keep as is) ---
  const clearCache = () => { /* ... Keep existing ... */
      setDataCache({});
    setCacheTimestamps({});
      console.log("Chatbot data cache cleared.");
      // Optionally add a user message confirming cache clear
        const cacheClearedMessage = {
            id: Date.now() + 2, // Ensure unique ID
            text: language === 'marathi' ? 'डेटा कॅशे साफ केला.' : 'Data cache cleared.',
            isBot: true,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, cacheClearedMessage]);
};

  // --- Test Database Connection (Keep as is) ---
  const testDatabaseConnection = async () => { /* ... Keep existing ... */
       try {
      console.log('Testing database connection...');
      
      // Test basic collections
      const testCollections = [
        'grampanchayat',
        'members', 
        // Test a few program subcollections specifically
        'program/svachhgaav/items',
        'program/vikeltepikel/items',
        'program/rotipoorak/items',
        'decisions',
        'awards',
        'festivals',
        'facilities',
        'eseva',
        'tourism',
        'contacts',
        'hospitals',
        'helplines',
        'census',
        'yojana/state/items',
        'yojana/central/items',
        'extra/pragat-shetkari/items'
      ];
      
      let allOk = true;
      let results = '';

      for (const collectionPath of testCollections) {
        try {
          const collectionRef = collection(db, collectionPath);
          const snapshot = await getDocs(query(collectionRef, limit(1)));
          const msg = `✅ ${collectionPath}: ${snapshot.docs.length} documents found`;
          console.log(msg);
          results += msg + '\n';
          if (snapshot.docs.length > 0) {
            console.log('Sample document:', snapshot.docs[0].data());
          }
        } catch (error) {
          const errMsg = `❌ ${collectionPath}: Error - ${error.message}`;
          console.log(errMsg);
          results += errMsg + '\n';
          allOk = false;
        }
      }

       const testResultMessage = {
            id: Date.now() + 3, // Unique ID
            text: allOk
             ? (language === 'marathi' ? 'सर्व डेटाबेस कनेक्शन ठीक आहेत.' : 'All database connections seem OK.')
             : (language === 'marathi' ? 'काही डेटाबेस कनेक्शनमध्ये त्रुटी आहेत. तपशीलांसाठी कन्सोल तपासा.' : 'Errors found in some database connections. Check console for details.'),
            details: results, // Add details for debugging
            isBot: true,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, testResultMessage]);

    } catch (error) {
      console.error('Database connection test failed:', error);
       const errorMsg = {
            id: Date.now() + 4,
            text: language === 'marathi' ? `डेटाबेस कनेक्शन तपासणी अयशस्वी: ${error.message}` : `Database connection test failed: ${error.message}`,
            isBot: true,
            timestamp: new Date().toISOString()
        };
      setMessages(prev => [...prev, errorMsg]);
    }
};

  // --- Clear Chat History (Keep as is) ---
  const clearChat = () => { /* ... Keep existing, including clearCache() call ... */
      const pageId = getCurrentPageId();
    const storageKey = `chatbot-messages-${pageId}`;
    setMessages([]);
    localStorage.removeItem(storageKey);
    clearCache(); // Clear data cache as well
    
    // Reset to welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: language === 'marathi' 
        ? 'नमस्कार! मी तुमचा सहाय्यक आहे. तुम्ही कोणताही प्रश्न विचारू शकता.'
        : 'Hello! I am your assistant. You can ask me any question.',
      isBot: true,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
};

  // --- JSX (UI Rendering - Mostly Keep as is, minor adjustments) ---
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Homepage ChatBot Prompt */}
      {location.pathname === '/' && !isOpen && (
         <div className="mb-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl shadow-lg max-w-[280px] opacity-0 animate-fade-in-delay cursor-pointer" onClick={() => setIsOpen(true)}>
          {/* ... (Keep the prompt JSX) ... */}
           <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🤖</span>
            </div>
            <div className="text-sm">
              <p className="font-medium">
                {language === 'marathi' ? 'स्मार्ट सहाय्यक' : 'Smart Assistant'}
              </p>
              <p className="text-xs opacity-90">
                {language === 'marathi' 
                  ? 'स्वच्छ गाव, जलयुक्त शिवार, मतदार नोंदणी इत्यादी माहिती मिळवा'
                  : 'Get info about clean village, water conservation, voter registration, etc.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl w-80 sm:w-96 h-[500px] sm:h-[600px] flex flex-col transform transition-all duration-300 ease-out border border-gray-200 mb-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-4 rounded-t-xl flex justify-between items-center flex-shrink-0">
            {/* ... (Keep Header JSX, maybe adjust padding/gaps slightly) ... */}
             <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-base sm:text-lg truncate">
                  {language === 'marathi' ? 'सहाय्यक' : 'Assistant'}
                </h3>
                <p className="text-xs sm:text-sm opacity-90 truncate">
                  {language === 'marathi' ? 'ग्रामपंचायत माहिती' : 'Gram Panchayat Info'}
                </p>
                 {/* Page ID might be too technical for users, consider removing or simplifying */}
                 {/*
                <p className="text-xs opacity-75 truncate">
                  {language === 'marathi' ? `पेज: ${getCurrentPageId()}` : `Page: ${getCurrentPageId()}`}
                </p>
                 */}
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'marathi' ? 'english' : 'marathi')}
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded-md transition-all duration-200 backdrop-blur-sm"
                title={language === 'marathi' ? 'Switch to English' : 'मराठीमध्ये बदला'}
              >
                {language === 'marathi' ? 'EN' : 'MR'}
              </button>
             {/* Cache Clear Button */}
             <button
                onClick={clearCache}
                className="text-xs bg-purple-500 hover:bg-purple-400 px-2 py-1 rounded-md transition-all duration-200"
                title={language === 'marathi' ? 'कॅशे साफ करा' : 'Clear Cache'}
             >
                🔄
             </button>
             {/* DB Test Button - Keep for debugging if needed, maybe hide in production */}
              {/* <button
                onClick={testDatabaseConnection}
                className="text-xs bg-yellow-500 hover:bg-yellow-400 px-2 py-1 rounded-md transition-all duration-200"
                title={language === 'marathi' ? 'डेटाबेस तपासा' : 'Test Database'}
              >
                🔧
              </button> */}
             {/* Clear Chat Button */}
              <button
                onClick={clearChat}
                className="text-xs bg-red-500 hover:bg-red-400 px-2 py-1 rounded-md transition-all duration-200"
                title={language === 'marathi' ? 'चॅट साफ करा' : 'Clear Chat'}
              >
                🗑️
              </button>
             {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-white hover:bg-opacity-10"
                title={language === 'marathi' ? 'बंद करा' : 'Close'}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50">
            {/* ... (Keep Messages mapping JSX, including image rendering and confidence score) ... */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm ${
                    message.isBot
                      ? 'bg-white text-gray-800 border border-gray-200'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  }`}
                >
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {message.text.split('\n').map((line, index) => {
                      // Check if line contains image URL marker
                      if (line.includes('🖼️ चित्र:') || line.includes('🖼️ Image:')) {
                        const imageUrl = line.match(/https?:\/\/[^\s]+/)?.[0];
                        const textBeforeImage = line.split('🖼️')[0];
                        return (
                          <div key={index} className="mb-1">
                            {textBeforeImage && <p>{textBeforeImage.replace(/चित्र:|Image:/, '').trim()}</p>}
                            {imageUrl && (
                              <div className="mt-1">
                                <img
                                  src={imageUrl}
                                  alt="Chat image"
                                  className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                                  style={{ maxHeight: '150px' }} // Slightly smaller max height
                                  onError={(e) => { e.target.style.display = 'none'; /* Hide broken images */ }}
                                />
                              </div>
                            )}
                          </div>
                        );
                          // Check for document link marker
                       } else if (line.includes('📄 दस्तावेज:') || line.includes('📄 Document:')) {
                            const docUrl = line.match(/https?:\/\/[^\s]+/)?.[0];
                            const textBeforeDoc = line.split('📄')[0];
                             return (
                                <div key={index} className="mb-1">
                                    {textBeforeDoc && <p>{textBeforeDoc.replace(/दस्तावेज:|Document:/, '').trim()}</p>}
                                    {docUrl && (
                                    <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs block mt-1">
                                      {detectedLanguage === 'marathi' ? 'दस्तावेज पहा' : 'View Document'}
                                    </a>
                                    )}
                                </div>
                             );
                      }
                      return <p key={index}>{line}</p>;
                    })}
                  </div>
                  <p className={`text-xs mt-1 ${
                    message.isBot ? 'text-gray-500' : 'text-blue-100'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    {/* Confidence Score Display */}
                    {message.isBot && message.confidence !== undefined && message.confidence < 0.7 && message.confidence > 0 && (
                      <span className="ml-2 text-yellow-600 font-medium">
                        (Low Confidence: {Math.round(message.confidence * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                {/* ... (Keep Typing Indicator JSX) ... */}
                 <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-white rounded-b-xl flex-shrink-0">
            {/* ... (Keep Input field and Send button JSX) ... */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'marathi' ? 'तुमचा प्रश्न टाइप करा...' : 'Type your question...'}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping} // Disable send while bot is typing
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
              >
                {language === 'marathi' ? 'पाठवा' : 'Send'}
              </button>
            </div>
            {/* Helper Text and Sample Question */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              {language === 'marathi'
                ? 'सदस्य, निर्णय, संपर्क, उपक्रम, योजना इत्यादी विषयांवर प्रश्न विचारा'
                : 'Ask questions about members, decisions, contacts, programs, schemes, etc.'}
            </div>
            <div className="mt-1 text-xs text-blue-600 text-center cursor-pointer hover:text-blue-800" onClick={() => {
              const sampleQuestions = language === 'marathi'
                ? [
                  'सरपंच कोण आहेत?',
                  'स्वच्छ गाव उपक्रमात किती लोकांनी भाग घेतला?',
                  'विकेल ते पिकेल योजनेत कोणती उत्पादने आहेत?',
                  'जलयुक्त शिवार अंतर्गत कोणते प्रकल्प आहेत?',
                  'मतदार नोंदणीची प्रक्रिया काय आहे?',
                  'सर्व शिक्षा अभियानात कोणते विद्यार्थी आहेत?',
                  'तुषार सिंचन योजनेची माहिती काय आहे?',
                  'रोटी पूरक व्यवसायात कोणते व्यवसाय आहेत?'
                ]
                : [
                  'Tell me about members',
                  'What are the gram sabha decisions?',
                  'Give me contact information',
                  'Show tourism place images',
                  'Show facility images',
                  'Show award images',
                  'Tell me about programs',
                  'Give me scheme information'
                ];
              setInputMessage(sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)]);
            }}>
              {language === 'marathi' ? '💡 नमुना प्रश्न' : '💡 Sample Question'}
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-2xl sm:text-3xl relative ${
          isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100' // Hide button when chat is open
        }`}
        title={language === 'marathi' ? 'स्मार्ट सहाय्यक उघडा' : 'Open Smart Assistant'}
      >
        🤖
        {/* Notification dot for homepage */}
        {location.pathname === '/' && !isOpen && (
          // ... (Keep Notification dot JSX) ...
           <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping-once"></div>

        )}
      </button>

        {/* Add Tailwind animation classes */}
        <style>{`
            @keyframes ping-once {
                75%, 100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }
            .animate-ping-once {
                animation: ping-once 1s cubic-bezier(0, 0, 0.2, 1) 1s; /* Delay start */
            }

             @keyframes fade-in-delay {
                0% { opacity: 0; transform: translateY(10px); }
                70% { opacity: 0; transform: translateY(10px); } /* Start fade in after delay */
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-delay {
                animation: fade-in-delay 2.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default ChatBot;