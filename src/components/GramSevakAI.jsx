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
  const messagesEndRef = useRef(null);

  // Database mapping configuration - LIVE DATA FROM FIREBASE
  const databaseMapping = {
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

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = {
        id: Date.now(),
        text: `नमस्कार! 🙏

मी **GramSevak AI** आहे - आपला डिजिटल ग्राम सेवक!

मी **Live Database** मधून माहिती आणतो:
• ग्रामपंचायत माहिती
• सदस्य माहिती (Real-time)
• सरकारी योजना
• आरोग्य सेवा
• ई-सेवा
• आणि बरेच काही...

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

  // Find matching database
  const findMatchingDatabase = (query) => {
    const queryLower = query.toLowerCase().trim();
    const matches = [];

    Object.entries(databaseMapping).forEach(([key, config]) => {
      let score = 0;
      
      config.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        if (queryLower === keywordLower) {
          score += 20;
        } else if (queryLower.includes(keywordLower) || keywordLower.includes(queryLower)) {
          score += 10;
        } else if (queryLower.split(' ').some(word => keywordLower.includes(word) && word.length > 3)) {
          score += 5;
        }
      });
      
      if (score >= 5) {
        matches.push({ key, config, score });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  };

  // Fetch data from Firebase
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

  // Format general response
  const formatResponse = (data, config) => {
    if (!data || data.length === 0) {
      return "क्षमस्व, या विषयाची माहिती डेटाबेसमध्ये सध्या उपलब्ध नाही. 😔";
    }

    if (config.path === 'members') {
      return formatMembersResponse(data);
    }

    let response = `✅ **${data.length} माहिती सापडली:**\n\n`;
    
    data.slice(0, 5).forEach((item, index) => {
      response += `📋 **${index + 1}.**\n`;
      
      if (item.title) response += `   📌 ${item.title}\n`;
      if (item.name) response += `   👤 ${item.name}\n`;
      if (item.description) response += `   📝 ${item.description}\n`;
      if (item.date) response += `   📅 ${item.date}\n`;
      if (item.designation) response += `   🏛️ ${item.designation}\n`;
      if (item.location) response += `   📍 ${item.location}\n`;
      if (item.contact) response += `   📞 ${item.contact}\n`;
      if (item.phone) response += `   📞 ${item.phone}\n`;
      if (item.email) response += `   📧 ${item.email}\n`;
      if (item.address) response += `   🏠 ${item.address}\n`;
      if (item.doctorName) response += `   👨‍⚕️ ${item.doctorName}\n`;
      if (item.campType) response += `   🏥 ${item.campType}\n`;
      if (item.campDate) response += `   📅 ${item.campDate}\n`;
      if (item.department) response += `   🏛️ ${item.department}\n`;
      if (item.benefits) response += `   💰 ${item.benefits}\n`;
      if (item.eligibility) response += `   ✅ ${item.eligibility}\n`;
      if (item.type) response += `   🏷️ ${item.type}\n`;
      if (item.link) response += `   🔗 ${item.link}\n`;
      
      response += '\n';
    });

    if (data.length > 5) {
      response += `... आणि ${data.length - 5} आणखी माहिती उपलब्ध आहे.\n`;
    }
    
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
      const response = `मला माफ करा, मला "${query}" बद्दल माहिती सापडली नाही. 😔

आपण हे विचारू शकता:
• सदस्य माहिती
• पुरस्कार
• ई-सेवा
• आरोग्य शिबिर
• ग्रामसभा निर्णय
• योजना
• पर्यटन स्थळे
• संपर्क माहिती

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
                <p className="text-xs text-blue-100">🔴 Live Database Connected</p>
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
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="ml-2 text-xs text-gray-500">Fetching from database...</span>
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
