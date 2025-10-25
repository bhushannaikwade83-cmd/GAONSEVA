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
        'सदस्य', 'सरपंच', 'उपसरपंच', 'ग्राम सेवक', 'सदस्यांची यादी', 'members', 'gram sevak', 
        'sarpanch', 'upsarpanch', 'member list', 'who is sarpanch', 'gram sevak info', 
        'members list', 'ग्रामपंचायत सदस्य', 'ग्रामपंचायत सदस्य कोण आहेत', 'ग्राम सेवकाची माहिती',
        'सरपंच कोण आहे', 'सदस्यांची यादी दाखवा', 'ग्राम सेवक माहिती', 'सरपंच माहिती',
        'panchayat members', 'village head', 'gram panchayat members', 'leadership',
        'ग्रामपंचायत अधिकारी', 'पंचायत अधिकारी', 'ग्राम सेवक नाव', 'सरपंच नाव',
        'village officer', 'panchayat officer', 'gram sevak name', 'sarpanch name',
        'ग्रामपंचायत प्रमुख', 'पंचायत प्रमुख', 'ग्राम प्रमुख', 'village chief',
        'panchayat chief', 'gram chief', 'ग्रामपंचायत नेता', 'पंचायत नेता',
        'village leader', 'panchayat leader', 'ग्रामपंचायत अध्यक्ष', 'पंचायत अध्यक्ष',
        'village president', 'panchayat president', 'ग्रामपंचायत मुख्य', 'पंचायत मुख्य',
        'village main', 'panchayat main', 'ग्रामपंचायत प्रतिनिधी', 'पंचायत प्रतिनिधी',
        'village representative', 'panchayat representative', 'ग्रामपंचायत सभासद',
        'पंचायत सभासद', 'village councilor', 'panchayat councilor', 'ग्रामपंचायत पदाधिकारी',
        'पंचायत पदाधिकारी', 'village official', 'panchayat official', 'ग्रामपंचायत कर्मचारी',
        'पंचायत कर्मचारी', 'village employee', 'panchayat employee', 'ग्रामपंचायत कामगार',
        'पंचायत कामगार', 'village worker', 'panchayat worker', 'ग्रामपंचायत सेवक',
        'पंचायत सेवक', 'village servant', 'panchayat servant', 'ग्रामपंचायत कार्यकर्ता',
        'पंचायत कार्यकर्ता', 'village activist', 'panchayat activist', 'ग्रामपंचायत सहायक',
        'पंचायत सहायक', 'village assistant', 'panchayat assistant', 'ग्रामपंचायत मदतनीस',
        'पंचायत मदतनीस', 'village helper', 'panchayat helper', 'ग्रामपंचायत सहकारी',
        'पंचायत सहकारी', 'village cooperator', 'panchayat cooperator', 'ग्रामपंचायत भागीदार',
        'पंचायत भागीदार', 'village partner', 'panchayat partner', 'ग्रामपंचायत सहयोगी',
        'पंचायत सहयोगी', 'village collaborator', 'panchayat collaborator'
      ],
      fields: ['name', 'designation', 'order', 'imageURL', 'createdAt', 'updatedAt']
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
        'sightseeing', 'places of interest', 'visitor attractions', 'heritage sites',
        'पर्यटन स्थळ', 'दर्शनीय स्थान', 'पर्यटक स्थळ', 'tourist destination',
        'heritage', 'monument', 'historical place', 'religious place',
        'वारसा', 'स्मारक', 'ऐतिहासिक स्थळ', 'धार्मिक स्थळ',
        'temple', 'mandir', 'church', 'mosque', 'gurudwara',
        'मंदिर', 'चर्च', 'मशीद', 'गुरुद्वारा',
        'natural beauty', 'scenic spot', 'viewpoint', 'garden',
        'नैसर्गिक सौंदर्य', 'दृश्य स्थळ', 'दृष्टिकोन', 'बाग',
        'waterfall', 'lake', 'river', 'hill', 'mountain',
        'धबधबा', 'तळे', 'नदी', 'टेकडी', 'पर्वत',
        'beach', 'coast', 'seaside', 'resort', 'hotel',
        'समुद्रकिनारा', 'समुद्र तट', 'समुद्र किनारा', 'रिसॉर्ट', 'हॉटेल',
        'museum', 'gallery', 'exhibition', 'cultural center',
        'वस्तुसंग्रहालय', 'गॅलरी', 'प्रदर्शन', 'सांस्कृतिक केंद्र',
        'festival', 'fair', 'mela', 'celebration', 'event',
        'उत्सव', 'जत्रा', 'मेळा', 'साजरा', 'कार्यक्रम',
        'adventure', 'sports', 'recreation', 'entertainment',
        'साहस', 'खेळ', 'मनोरंजन', 'मनोरंजन',
        'local attraction', 'famous place', 'popular spot', 'must visit',
        'स्थानिक आकर्षण', 'प्रसिद्ध स्थळ', 'लोकप्रिय स्थळ', 'भेट द्यावे',
        'guide', 'information', 'details', 'timings', 'entry fee',
        'मार्गदर्शक', 'माहिती', 'तपशील', 'वेळ', 'प्रवेश शुल्क'
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
        'emergency contact', 'office contact', 'village contact', 'panchayat contact',
        'संपर्क क्रमांक', 'फोन नंबर', 'मोबाइल नंबर', 'phone number',
        'contact number', 'mobile number', 'telephone', 'call',
        'संपर्क करा', 'फोन करा', 'call now', 'contact us',
        'office address', 'residence address', 'work address',
        'कार्यालय पत्ता', 'निवास पत्ता', 'कामाचा पत्ता',
        'email', 'ईमेल', 'email address', 'electronic mail',
        'संपर्क तपशील', 'contact information', 'reach us',
        'get in touch', 'connect', 'communication',
        'संवाद', 'संपर्क साधा', 'जोडणी', 'संपर्क करा',
        'helpline', 'support', 'customer service', 'assistance',
        'हेल्पलाईन', 'सहाय्य', 'ग्राहक सेवा', 'मदत',
        'information desk', 'reception', 'front desk',
        'माहिती डेस्क', 'रिसेप्शन', 'फ्रंट डेस्क',
        'official contact', 'government contact', 'authority contact',
        'अधिकृत संपर्क', 'सरकारी संपर्क', 'अधिकारी संपर्क'
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
        'issue tracking', 'problem resolution', 'complaint status', 'grievance system',
        'तक्रार दाखल', 'complaint file', 'issue report', 'problem report',
        'तक्रार करा', 'file complaint', 'report issue', 'lodge complaint',
        'grievance redressal', 'complaint resolution', 'issue resolution',
        'तक्रार निराकरण', 'समस्या निराकरण', 'issue solving',
        'complaint tracking', 'status check', 'track complaint',
        'तक्रार ट्रॅकिंग', 'स्थिती तपासा', 'तक्रार पाहा',
        'online complaint', 'digital complaint', 'e-complaint',
        'ऑनलाइन तक्रार', 'डिजिटल तक्रार', 'ई-तक्रार',
        'complaint form', 'grievance form', 'issue form',
        'तक्रार फॉर्म', 'समस्या फॉर्म', 'तक्रार पत्रक',
        'complaint number', 'reference number', 'tracking number',
        'तक्रार क्रमांक', 'संदर्भ क्रमांक', 'ट्रॅकिंग क्रमांक',
        'complaint department', 'grievance cell', 'redressal cell',
        'तक्रार विभाग', 'समस्या सेल', 'निराकरण सेल',
        'citizen complaint', 'public complaint', 'resident complaint',
        'नागरिक तक्रार', 'सार्वजनिक तक्रार', 'रहिवासी तक्रार',
        'complaint helpline', 'grievance helpline', 'support helpline',
        'तक्रार हेल्पलाईन', 'समस्या हेल्पलाईन', 'सहाय्य हेल्पलाईन',
        'complaint feedback', 'resolution feedback', 'satisfaction survey',
        'तक्रार अभिप्राय', 'निराकरण अभिप्राय', 'समाधान सर्वेक्षण',
        'complaint escalation', 'higher authority', 'appeal',
        'तक्रार वाढवणे', 'उच्च अधिकारी', 'अपील',
        'complaint history', 'past complaints', 'complaint record',
        'तक्रार इतिहास', 'मागील तक्रार', 'तक्रार नोंद',
        'complaint statistics', 'complaint report', 'grievance report',
        'तक्रार सांख्यिकी', 'तक्रार अहवाल', 'समस्या अहवाल'
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
        'e-education', 'digital learning', 'online education', 'educational content',
        'ई-शिक्षण', 'e-shikshan', 'digital shikshan', 'online shikshan',
        'virtual learning', 'remote learning', 'distance learning',
        'व्हर्च्युअल शिक्षण', 'दूरस्थ शिक्षण', 'अंतर शिक्षण',
        'online courses', 'digital courses', 'e-courses',
        'ऑनलाइन अभ्यासक्रम', 'डिजिटल अभ्यासक्रम', 'ई-अभ्यासक्रम',
        'educational videos', 'learning videos', 'tutorial videos',
        'शैक्षणिक व्हिडिओ', 'अध्ययन व्हिडिओ', 'ट्यूटोरियल व्हिडिओ',
        'online classes', 'virtual classes', 'digital classes',
        'ऑनलाइन वर्ग', 'व्हर्च्युअल वर्ग', 'डिजिटल वर्ग',
        'educational apps', 'learning apps', 'study apps',
        'शैक्षणिक अॅप्स', 'अध्ययन अॅप्स', 'शिक्षण अॅप्स',
        'online training', 'digital training', 'e-training',
        'ऑनलाइन प्रशिक्षण', 'डिजिटल प्रशिक्षण', 'ई-प्रशिक्षण',
        'skill development', 'vocational training', 'technical training',
        'कौशल्य विकास', 'व्यावसायिक प्रशिक्षण', 'तांत्रिक प्रशिक्षण',
        'computer education', 'IT training', 'digital literacy',
        'संगणक शिक्षण', 'आयटी प्रशिक्षण', 'डिजिटल साक्षरता',
        'online exams', 'digital assessment', 'e-assessment',
        'ऑनलाइन परीक्षा', 'डिजिटल मूल्यांकन', 'ई-मूल्यांकन',
        'educational content', 'learning material', 'study material',
        'शैक्षणिक सामग्री', 'अध्ययन सामग्री', 'शिक्षण सामग्री',
        'online library', 'digital library', 'e-library',
        'ऑनलाइन ग्रंथालय', 'डिजिटल ग्रंथालय', 'ई-ग्रंथालय',
        'educational games', 'learning games', 'educational toys',
        'शैक्षणिक खेळ', 'अध्ययन खेळ', 'शैक्षणिक खेळणी',
        'online workshops', 'digital workshops', 'virtual workshops',
        'ऑनलाइन कार्यशाळा', 'डिजिटल कार्यशाळा', 'व्हर्च्युअल कार्यशाळा',
        'educational technology', 'edtech', 'learning technology',
        'शैक्षणिक तंत्रज्ञान', 'एडटेक', 'अध्ययन तंत्रज्ञान',
        'online certification', 'digital certificate', 'e-certificate',
        'ऑनलाइन प्रमाणपत्र', 'डिजिटल प्रमाणपत्र', 'ई-प्रमाणपत्र',
        'educational platform', 'learning platform', 'study platform',
        'शैक्षणिक प्लॅटफॉर्म', 'अध्ययन प्लॅटफॉर्म', 'शिक्षण प्लॅटफॉर्म'
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
    },

    // 📊 जनगणना
    'census': {
      path: 'census',
      keywords: [
        'जनगणना', 'census', 'लोकसंख्या', 'population', 'जनगणना माहिती',
        'population data', 'demographics', 'census data', 'village population',
        'लोकसंख्या माहिती', 'जनगणना डेटा', 'गाव लोकसंख्या', 'demographic data',
        'census information', 'population statistics', 'village demographics', 'census report',
        'लोकसंख्या सांख्यिकी', 'जनगणना अहवाल', 'गाव माहिती', 'village info',
        'पुरुष', 'स्त्री', 'मुले', 'वृद्ध', 'कुटुंब', 'साक्षरता',
        'male', 'female', 'children', 'seniors', 'families', 'literacy',
        'लोकसंख्या वाढ', 'जन्मदर', 'मृत्युदर', 'लिंग गुणोत्तर',
        'population growth', 'birth rate', 'death rate', 'sex ratio'
      ],
      fields: ['year', 'totalPopulation', 'male', 'female', 'children', 'seniors', 'families', 'literacyRate']
    },

    // 🏘️ गावदोली
    'gadoli': {
      path: 'program/gadoli/items',
      keywords: [
        'गावदोली', 'gadoli', 'गादोली', 'गावदोली कार्यक्रम', 'gadoli program',
        'गावदोली योजना', 'gadoli scheme', 'गावदोली माहिती', 'gadoli information',
        'गावदोली कार्यक्रम माहिती', 'gadoli program info', 'गावदोली स्थानिक कार्यक्रम',
        'local gadoli program', 'गावदोली उपक्रम', 'gadoli initiative',
        'वृक्षारोपण', 'tree plantation', 'स्वच्छता अभियान', 'cleanliness drive',
        'पर्यावरण संवर्धन', 'environmental conservation', 'सार्वजनिक आरोग्य', 'public health',
        'युवक मंडळ', 'youth group', 'सक्रिय', 'active', 'स्थान', 'location',
        'सहभागी', 'participants', 'अंदाज', 'budget', 'estimate'
      ],
      fields: ['title', 'type', 'organizer', 'status', 'endDate', 'participants', 'location', 'budget', 'description']
    }
  };

  // Show more options with comprehensive navigation menu
  const showMoreOptions = () => {
    const moreOptionsMessage = {
      id: Date.now(),
      text: `💡 आपण या सर्व विषयांवर माहिती मिळवू शकता:\n\n🏛️ **ग्रामपंचायत**\n   • माहिती\n   • नकाशा\n   • सदस्य\n   • ग्रामसभेचे निर्णय\n   • पुरस्कार\n   • कार्यक्रम\n   • सुविधा\n   • ई-सेवा\n   • पर्यटन स्थळे\n\n📋 **निर्देशिका**\n   • उपक्रम\n   • योजना\n   • प्रगत शेतकरी\n   • ई-शिक्षण\n   • बातम्या\n   • संपर्क\n   • तक्रार नोंदणी\n\n🏥 **आरोग्य सेवा**\n   • रुग्णालय\n   • हेल्पलाईन\n   • आरोग्य शिबिर\n\n📊 **माहिती**\n   • जनगणना\n   • गावदोली\n   • सांख्यिकी\n\nकृपया आपला प्रश्न स्पष्ट करा.`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, moreOptionsMessage]);
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
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced keyword matching function with strict matching
  const findMatchingDatabase = (query) => {
    const queryLower = query.toLowerCase().trim();
    const matches = [];

    Object.entries(databaseMapping).forEach(([key, config]) => {
      let score = 0;
      const matchedKeywords = [];
      
      // Check each keyword with multiple matching strategies
      config.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // Exact match gets highest score
        if (queryLower === keywordLower) {
          score += 20;
          matchedKeywords.push(keyword);
        }
        // Starts with match
        else if (queryLower.startsWith(keywordLower) || keywordLower.startsWith(queryLower)) {
          score += 15;
          matchedKeywords.push(keyword);
        }
        // Contains match (but not too broad)
        else if (queryLower.includes(keywordLower) && keywordLower.length > 3) {
          score += 10;
          matchedKeywords.push(keyword);
        }
        // Word boundary match (more strict)
        else if (queryLower.split(' ').some(word => 
          keywordLower.includes(word) && word.length > 3 && keywordLower.length > 3
        )) {
          score += 8;
          matchedKeywords.push(keyword);
        }
        // Fuzzy match for similar words (higher threshold)
        else if (calculateSimilarity(queryLower, keywordLower) > 0.8) {
          score += 5;
          matchedKeywords.push(keyword);
        }
      });
      
      // Only add if score is significant
      if (score >= 8) {
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

  // Calculate similarity between two strings
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  // Calculate Levenshtein distance
  const levenshteinDistance = (str1, str2) => {
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

  // Enhanced data fetching from Firebase with special handling for members
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
      
      // Special handling for members collection
      if (path === 'members') {
        try {
          console.log('Fetching members with order field');
          const q = query(collectionRef, orderBy('order', 'asc'));
          querySnapshot = await getDocs(q);
          console.log(`Successfully fetched ${querySnapshot.size} members ordered by order field`);
        } catch (orderError) {
          console.log('Order field failed, trying simple query for members');
          querySnapshot = await getDocs(collectionRef);
          console.log(`Simple query fetched ${querySnapshot.size} members`);
        }
      } else {
        // Try different ordering strategies for other collections
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

  // Special formatting for members response
  const formatMembersResponse = (data, matchedKeywords) => {
    if (!data || data.length === 0) {
      return "क्षमस्व, सदस्यांची माहिती डेटाबेसमध्ये सध्या उपलब्ध नाही.";
    }

    // Check if user is asking for specific role
    const query = matchedKeywords.join(' ').toLowerCase();
    const isAskingForSarpanch = query.includes('सरपंच') || query.includes('sarpanch') || query.includes('who is');
    const isAskingForGramSevak = query.includes('ग्राम सेवक') || query.includes('gram sevak');
    
    let response = '';
    
    if (isAskingForSarpanch) {
      // Show only Sarpanch
      const sarpanch = data.find(member => 
        member.designation && member.designation.toLowerCase().includes('सरपंच')
      );
      if (sarpanch) {
        response = `👤 ${sarpanch.name} – ${sarpanch.designation}`;
      } else {
        response = "क्षमस्व, सरपंचाची माहिती सध्या उपलब्ध नाही.";
      }
    } else if (isAskingForGramSevak) {
      // Show only Gram Sevak
      const gramSevak = data.find(member => 
        member.designation && member.designation.toLowerCase().includes('ग्राम सेवक')
      );
      if (gramSevak) {
        response = `👤 ${gramSevak.name} – ${gramSevak.designation}`;
      } else {
        response = "क्षमस्व, ग्राम सेवकाची माहिती सध्या उपलब्ध नाही.";
      }
    } else {
      // Show all members
      response = `👥 ग्रामपंचायत सदस्य (${data.length} सदस्य):\n\n`;
      data.forEach((member, index) => {
        response += `${index + 1}. ${member.name} – ${member.designation}\n`;
      });
    }
    
    return response;
  };

  // Enhanced response formatting with comprehensive data display
  const formatResponse = (data, config, matchedKeywords) => {
    if (!data || data.length === 0) {
      return "क्षमस्व, या विषयाची माहिती डेटाबेसमध्ये सध्या उपलब्ध नाही.";
    }

    // Special formatting for members
    if (config.path === 'members') {
      return formatMembersResponse(data, matchedKeywords);
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
      
      // Add specific fields for different data types
      if (item.totalPopulation) {
        response += `   👥 एकूण लोकसंख्या: ${item.totalPopulation}\n`;
      }
      
      if (item.male) {
        response += `   👨 पुरुष: ${item.male}\n`;
      }
      
      if (item.female) {
        response += `   👩 स्त्री: ${item.female}\n`;
      }
      
      if (item.children) {
        response += `   👶 मुले: ${item.children}\n`;
      }
      
      if (item.seniors) {
        response += `   👴 वृद्ध: ${item.seniors}\n`;
      }
      
      if (item.families) {
        response += `   🏠 कुटुंब: ${item.families}\n`;
      }
      
      if (item.literacyRate) {
        response += `   📚 साक्षरता दर: ${item.literacyRate}%\n`;
      }
      
      if (item.year) {
        response += `   📅 वर्ष: ${item.year}\n`;
      }
      
      if (item.organizer) {
        response += `   🏢 आयोजक: ${item.organizer}\n`;
      }
      
      if (item.endDate) {
        response += `   📅 समाप्ती: ${item.endDate}\n`;
      }
      
      if (item.participants) {
        response += `   👥 सहभागी: ${item.participants}\n`;
      }
      
      if (item.budget) {
        response += `   💰 अंदाज: ₹${item.budget}\n`;
      }
      
      if (item.estimate) {
        response += `   💰 अंदाज: ₹${item.estimate}\n`;
      }
      
      if (item.waterStorage) {
        response += `   💧 पाणी साठवण: ${item.waterStorage}\n`;
      }
      
      if (item.wasteType) {
        response += `   🗑️ कचरा प्रकार: ${item.wasteType}\n`;
      }
      
      if (item.disposalMethod) {
        response += `   ♻️ निपटारा पद्धत: ${item.disposalMethod}\n`;
      }
      
      if (item.disputeType) {
        response += `   ⚖️ विवाद प्रकार: ${item.disputeType}\n`;
      }
      
      if (item.resolution) {
        response += `   ✅ निराकरण: ${item.resolution}\n`;
      }
      
      if (item.familyName) {
        response += `   👨‍👩‍👧‍👦 कुटुंब नाव: ${item.familyName}\n`;
      }
      
      if (item.headOfFamily) {
        response += `   👨‍👩‍👧‍👦 कुटुंब प्रमुख: ${item.headOfFamily}\n`;
      }
      
      if (item.members) {
        response += `   👥 सदस्य: ${item.members}\n`;
      }
      
      if (item.voterName) {
        response += `   🗳️ मतदार नाव: ${item.voterName}\n`;
      }
      
      if (item.boothNumber) {
        response += `   🏛️ बूथ क्रमांक: ${item.boothNumber}\n`;
      }
      
      if (item.studentName) {
        response += `   🎓 विद्यार्थी नाव: ${item.studentName}\n`;
      }
      
      if (item.grade) {
        response += `   📚 वर्ग: ${item.grade}\n`;
      }
      
      if (item.productType) {
        response += `   🌾 उत्पादन प्रकार: ${item.productType}\n`;
      }
      
      if (item.farmerName) {
        response += `   👨‍🌾 शेतकरी नाव: ${item.farmerName}\n`;
      }
      
      if (item.quantity) {
        response += `   📊 प्रमाण: ${item.quantity}\n`;
      }
      
      if (item.achievement) {
        response += `   🏆 यश: ${item.achievement}\n`;
      }
      
      if (item.village) {
        response += `   🏘️ गाव: ${item.village}\n`;
      }
      
      if (item.recipient) {
        response += `   🏆 प्राप्तकर्ता: ${item.recipient}\n`;
      }
      
      if (item.department) {
        response += `   🏛️ विभाग: ${item.department}\n`;
      }
      
      if (item.benefits) {
        response += `   💰 लाभ: ${item.benefits}\n`;
      }
      
      if (item.eligibility) {
        response += `   ✅ पात्रता: ${item.eligibility}\n`;
      }
      
      if (item.services) {
        response += `   🏥 सेवा: ${item.services}\n`;
      }
      
      if (item.phone) {
        response += `   📞 फोन: ${item.phone}\n`;
      }
      
      if (item.email) {
        response += `   📧 ईमेल: ${item.email}\n`;
      }
      
      if (item.category) {
        response += `   🏷️ श्रेणी: ${item.category}\n`;
      }
      
      if (item.content) {
        response += `   📄 सामग्री: ${item.content}\n`;
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
                  'तक्रार नोंदणी', 'ई-शिक्षण', 'बातम्या', 'रुग्णालय',
                  'जनगणना', 'गावदोली', 'हेल्पलाईन', 'योजना'
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
                  label="💡 More Options"
                  size="small"
                  onClick={showMoreOptions}
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
