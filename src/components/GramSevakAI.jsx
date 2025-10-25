import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Maximize2, Minimize2, Sparkles, MessageSquare } from 'lucide-react';

const GramSevakAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickSuggestions = [
    { icon: '👥', text: 'सरपंच कोण आहे', category: 'members' },
    { icon: '🏆', text: 'पुरस्कार', category: 'awards' },
    { icon: '💻', text: 'ई-सेवा', category: 'eseva' },
    { icon: '🏥', text: 'आरोग्य शिबिर', category: 'health' },
    { icon: '📜', text: 'ग्रामसभा निर्णय', category: 'decisions' },
    { icon: '🌆', text: 'पर्यटन स्थळे', category: 'tourism' },
    { icon: '📞', text: 'संपर्क', category: 'contact' },
    { icon: '💰', text: 'योजना', category: 'schemes' }
  ];

  const responseTemplates = {
    members: {
      keywords: ['सरपंच', 'सदस्य', 'उपसरपंच', 'ग्राम सेवक', 'member', 'sarpanch'],
      response: `👥 **ग्रामपंचायत सदस्य माहिती**

**सरपंच:** श्री राजेंद्र पाटील
📞 संपर्क: +91 98765 43210

**उपसरपंच:** श्रीमती सुनीता देशमुख
📞 संपर्क: +91 98765 43211

**ग्राम सेवक:** श्री संदीप कुलकर्णी
📞 संपर्क: +91 98765 43212

**पंचायत सदस्य:**
1. श्री विनोद शिंदे - वॉर्ड १
2. श्रीमती मीना जाधव - वॉर्ड २
3. श्री अनिल काळे - वॉर्ड ३
4. श्रीमती रेखा पवार - वॉर्ड ४

💡 अधिक माहितीसाठी ग्रामपंचायत कार्यालयात भेट द्या.`
    },
    awards: {
      keywords: ['पुरस्कार', 'award', 'prize', 'विजेता'],
      response: `🏆 **ग्रामपंचायत पुरस्कार**

**२०२४**
🥇 आदर्श ग्रामपंचायत पुरस्कार
   जिल्हा स्तरावर प्रथम क्रमांक

🥈 स्वच्छता अभियान पुरस्कार
   राज्य स्तरावर द्वितीय क्रमांक

🏅 जलयुक्त शिवार उत्कृष्ट कामगिरी
   तालुका स्तरावर विशेष पुरस्कार

**२०२३**
🏆 डिजिटल ग्रामपंचायत पुरस्कार
   राज्य स्तरावर सन्मानित

आमच्या ग्रामपंचायतीला मिळालेल्या या पुरस्कारांवर आम्हाला अभिमान आहे! 🎉`
    },
    eseva: {
      keywords: ['ई-सेवा', 'e-seva', 'ऑनलाइन', 'प्रमाणपत्र', 'अर्ज'],
      response: `💻 **उपलब्ध ई-सेवा**

📄 **प्रमाणपत्रे:**
• जन्म प्रमाणपत्र
• मृत्यू प्रमाणपत्र
• रहिवासी दाखला
• उत्पन्न प्रमाणपत्र
• जातीचा दाखला

📝 **अर्ज:**
• नवीन वीज जोडणी
• पाणी जोडणी
• मालमत्ता कर
• दुकान परवाना

🌐 **ऑनलाइन:**
esheva.grampanchayat.gov.in

⏰ **वेळ:** सकाळी ८ ते संध्याकाळी ६
📞 **हेल्पलाईन:** 1800-123-4567`
    },
    health: {
      keywords: ['आरोग्य', 'health', 'शिबिर', 'डॉक्टर', 'रुग्णालय'],
      response: `🏥 **आरोग्य सेवा**

**आगामी शिबिर:**
📅 २८ ऑक्टोबर २०२५
🏥 मोफत आरोग्य तपासणी शिबिर
👨‍⚕️ डॉ. प्रशांत देशमुख
📍 ग्रामपंचायत सभागृह
⏰ सकाळी ९ ते दुपारी ४

**उपलब्ध सेवा:**
• रक्तदाब तपासणी
• मधुमेह तपासणी
• वजन आणि उंची मोजमाप
• मोफत औषधे
• आरोग्य सल्ला

📞 **रुग्णालय संपर्क:**
ग्रामीण रुग्णालय: +91 98765 00000
जिल्हा रुग्णालय: 108 (आणीबाणी)`
    },
    decisions: {
      keywords: ['निर्णय', 'ग्रामसभा', 'decision', 'ठराव', 'meeting'],
      response: `📜 **ग्रामसभा निर्णय**

**नवीनतम निर्णय (२० ऑक्टोबर २०२५):**

✅ **निर्णय १:** 
गावातील मुख्य रस्त्याची दुरुस्ती
बजेट: ₹५,००,०००

✅ **निर्णय २:**
सार्वजनिक शौचालय बांधकाम
स्थान: बाजारपेठ
बजेट: ₹३,००,०००

✅ **निर्णय ३:**
खेळाचे मैदान विकास
सुविधा: क्रीडा साहित्य, बेंच, प्रकाश व्यवस्था

✅ **निर्णय ४:**
पाणी टाकी वाढीव क्षमता
नवीन क्षमता: ५०,००० लिटर

📅 **पुढील ग्रामसभा:** १५ नोव्हेंबर २०२५`
    },
    tourism: {
      keywords: ['पर्यटन', 'tourism', 'temple', 'मंदिर', 'दर्शनीय'],
      response: `🌆 **पर्यटन स्थळे**

🛕 **धार्मिक स्थळे:**
• श्री गणेश मंदिर (१५०० वर्ष जुनं)
• हनुमान मंदिर
• मारुती मंदिर

🏞️ **नैसर्गिक सौंदर्य:**
• कृष्णा नदी घाट
• सूर्योदय व्ह्यू पॉइंट
• गडकोट टेकडी

🏛️ **ऐतिहासिक:**
• प्राचीन वाडा (२०० वर्षांपूर्वीचा)
• शिवाजी महाराज स्मारक

🎪 **वार्षिक उत्सव:**
• गणेशोत्सव (सप्टेंबर)
• दसरा उत्सव (ऑक्टोबर)
• होळी मेळावा (मार्च)

📸 अनुभव घ्या आणि आठवणी साठवा!`
    },
    contact: {
      keywords: ['संपर्क', 'contact', 'phone', 'फोन', 'पत्ता'],
      response: `📞 **संपर्क माहिती**

🏢 **ग्रामपंचायत कार्यालय**
📍 मुख्य रस्ता, गाव - ४१५०१०
📞 फोन: +91 2345-678901
📧 ईमेल: grampanchayat@gov.in

⏰ **कार्यालयीन वेळ:**
सोमवार - शुक्रवार: ९:३० - ५:३०
शनिवार: ९:३० - १:०० (पहिली आणि तिसरी)

📞 **आपत्कालीन नंबर:**
• पोलीस: 100
• आणीबाणी: 108
• अग्निशामक: 101
• महिला हेल्पलाईन: 1091

💬 व्हॉट्सअॅप: +91 98765 43210`
    },
    schemes: {
      keywords: ['योजना', 'scheme', 'yojana', 'सरकार'],
      response: `💰 **सरकारी योजना**

**केंद्र सरकार योजना:**
🏠 प्रधानमंत्री आवास योजना
💰 जनधन खाते
👨‍🌾 PM किसान सन्मान निधी
🚰 जल जीवन मिशन

**राज्य सरकार योजना:**
👩‍👧 माझी कन्या भाग्यश्री
🌾 शेतकरी संमान योजना
💡 सौर ऊर्जा योजना
🏥 महात्मा ज्योतिबा फुले योजना

**अर्ज प्रक्रिया:**
१. ग्रामसेवक कार्यालयात भेट द्या
२. आवश्यक कागदपत्रे जमा करा
३. अर्ज भरा आणि सबमिट करा

📞 माहितीसाठी: +91 98765 43212`
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = {
        id: Date.now(),
        text: `नमस्कार! 🙏

मी **GramSevak AI** आहे - आपला डिजिटल ग्राम सेवक!

मी आपल्याला यात मदत करू शकतो:
• ग्रामपंचायत माहिती
• सदस्य माहिती
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

  const findResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    for (const [key, template] of Object.entries(responseTemplates)) {
      if (template.keywords.some(keyword => lowerQuery.includes(keyword))) {
        return template.response;
      }
    }
    
    return `मला माफ करा, मला "${query}" बद्दल माहिती सापडली नाही. 😔

आपण हे विचारू शकता:
• सदस्य माहिती
• पुरस्कार
• ई-सेवा
• आरोग्य सेवा
• योजना
• पर्यटन स्थळे
• संपर्क माहिती

किंवा खालील सूचनांपैकी एक निवडा! 👇`;
  };

  const simulateTyping = async (response) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
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

    const response = findResponse(query);
    await simulateTyping(response);
  };

  const handleSuggestionClick = async (suggestion) => {
    const userMessage = {
      id: Date.now(),
      text: suggestion.text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const response = findResponse(suggestion.text);
    await simulateTyping(response);
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
