// Comprehensive Marathi to English Translation Dictionary
// Auto-learning system that adds new words automatically

// Base dictionary with all website words
let baseDictionary = {
  // Navigation & Common Terms
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
  
  // Welcome Page
  "ग्रामपंचायत वर": "Gram Panchayat Var",
  "वर": "Var",
  "आपले स्वागत आहे": "Welcome",
  "स्वागत": "Welcome",
  "स्वागत आहे": "Welcome",
  "ग्रामपंचायत पोर्टल मध्ये आपले स्वागत आहे": "Welcome to Gram Panchayat Portal",
  "आमच्या गावाची डिजिटल सेवा आणि माहिती एका ठिकाणी": "Our village's digital services and information in one place",
  "आमच्या": "Our",
  "गावाची": "Village's",
  "डिजिटल": "Digital",
  "सेवा": "Service",
  "आणि": "And",
  "एका": "One",
  "ठिकाणी": "Place",
  "लोड होत आहे": "Loading",
  "डेटा उपलब्ध नाही": "Data not available",
  "उपलब्ध नाही": "Not available",
  "उपलब्ध": "Available",
  
  // Common Words
  "मुख्य": "Main",
  "पृष्ठ": "Page",
  "अधिक": "More",
  "कमी": "Less",
  "पहा": "View",
  "वाचा": "Read",
  "डाउनलोड": "Download",
  "अपलोड": "Upload",
  "जोडा": "Add",
  "हटवा": "Remove",
  "संपादन": "Edit",
  "सेव्ह": "Save",
  "रद्द": "Cancel",
  "होय": "Yes",
  "नाही": "No",
  "ठीक आहे": "OK",
  "बंद": "Close",
  "उघडा": "Open",
  "शोधा": "Search",
  "शोध": "Search",
  "फिल्टर": "Filter",
  "साफ करा": "Clear",
  
  // Information Terms
  "तपशील": "Details",
  "वर्णन": "Description",
  "शीर्षक": "Title",
  "तारीख": "Date",
  "वेळ": "Time",
  "ठिकाण": "Location",
  "पत्ता": "Address",
  "संपर्क": "Contact",
  "ईमेल": "Email",
  "फोन": "Phone",
  "मोबाइल": "Mobile",
  "ग्रामपंचायत विषयी": "About Gram Panchayat",
  "विषयी": "About",
  "माहिती उपलब्ध नाही": "Information not available",
  "कृपया Admin Panel मधून माहिती अपडेट करा": "Please update information from Admin Panel",
  "कृपया": "Please",
  "अपडेट": "Update",
  "करा": "Do",
  
  // Schemes & Programs
  "योजना": "Schemes",
  "केंद्रीय योजना": "Central Schemes",
  "राज्य योजना": "State Schemes",
  "अभियान": "Campaign",
  "प्रकल्प": "Project",
  "उत्सव": "Festival",
  "सण": "Festival",
  
  // Complaints & Services
  "तक्रार": "Complaint",
  "तक्रारी": "Complaints",
  "तक्रार नोंदवा": "Register Complaint",
  "तक्रार नोंदणी": "Complaint Registration",
  "नोंदणी": "Registration",
  "नोंदवा": "Register",
  "दस्तऐवज": "Documents",
  "प्रमाणपत्र": "Certificate",
  
  // Members & Governance
  "सरपंच": "Sarpanch",
  "उपसरपंच": "Deputy Sarpanch",
  "प्रतिनिधी": "Representative",
  "निर्णय": "Decision",
  "बैठक": "Meeting",
  "सभा": "Meeting",
  "ग्रामसभा": "Gram Sabha",
  
  // Facilities & Infrastructure
  "इमारत": "Building",
  "शाळा": "School",
  "आरोग्य केंद्र": "Health Center",
  "केंद्र": "Center",
  "पाणी": "Water",
  "वीज": "Electricity",
  "रस्ते": "Roads",
  "स्वच्छता": "Sanitation",
  "कचरा": "Waste",
  "कचऱ्याचे नियोजन": "Waste Management",
  "नियोजन": "Management",
  
  // Awards & Recognition
  "मान्यता": "Recognition",
  "प्रशस्ती": "Appreciation",
  "कौतुक": "Praise",
  
  // Tourism
  "पर्यटन": "Tourism",
  "पर्यटन स्थळ": "Tourist Place",
  "स्थळ": "Place",
  "दर्शनीय स्थळ": "Sightseeing Place",
  "इतिहास": "History",
  "संस्कृती": "Culture",
  
  // Census & Demographics
  "लोकसंख्या": "Population",
  "गाव": "Village",
  "वार्ड": "Ward",
  "परिवार": "Family",
  "घर": "House",
  "घरे": "Houses",
  
  // Health & Medical
  "आरोग्य": "Health",
  "डॉक्टर": "Doctor",
  "औषध": "Medicine",
  "शिबिर": "Camp",
  "आरोग्य शिबिर": "Health Camp",
  "तपासणी": "Checkup",
  
  // Education
  "शिक्षण": "Education",
  "विद्यार्थी": "Student",
  "शिक्षक": "Teacher",
  "अभ्यास": "Study",
  "परीक्षा": "Exam",
  "शिक्षण अभियान": "Education Campaign",
  
  // Agriculture
  "शेती": "Agriculture",
  "शेतकरी": "Farmer",
  "पीक": "Crop",
  "पिके": "Crops",
  "जमीन": "Land",
  "सिंचन": "Irrigation",
  
  // Business & Economy
  "व्यवसाय": "Business",
  "उद्योग": "Industry",
  "रोजगार": "Employment",
  "नोकरी": "Job",
  "काम": "Work",
  "उत्पन्न": "Income",
  
  // Events & News
  "बातम्या": "News",
  "जाहिरात": "Announcement",
  "जाहिराती": "Announcements",
  "घटना": "Event",
  "सोहळा": "Celebration",
  
  // Contact & Help
  "संपर्क करा": "Contact Us",
  "मदत": "Help",
  "सहाय्य": "Support",
  "प्रश्न": "Question",
  "उत्तर": "Answer",
  
  // Actions
  "क्लिक करा": "Click",
  "निवडा": "Select",
  "प्रिंट": "Print",
  "शेअर": "Share",
  "लाइक": "Like",
  "कमेंट": "Comment",
  
  // Status & Messages
  "यशस्वी": "Success",
  "अयशस्वी": "Failed",
  "प्रतीक्षा करा": "Please Wait",
  "प्रतीक्षा": "Wait",
  "त्रुटी": "Error",
  "सावधान": "Warning",
  "सूचना": "Notice",
  "सूचना": "Notices",
  
  // Time & Date
  "आज": "Today",
  "काल": "Yesterday",
  "उद्या": "Tomorrow",
  "आठवडा": "Week",
  "महिना": "Month",
  "वर्ष": "Year",
  
  // Numbers (Common)
  "एक": "One",
  "दोन": "Two",
  "तीन": "Three",
  "चार": "Four",
  "पाच": "Five",
  
  // Common Phrases
  "धन्यवाद": "Thank You",
  "क्षमस्व": "Sorry",
  "माफ करा": "Excuse Me",
  "बरोबर": "Correct",
  "चुकीचे": "Wrong",
  
  // Footer & Links
  "बद्दल": "About",
  "गोपनीयता": "Privacy",
  "अटी": "Terms",
  "नियम": "Rules",
  "कार्यालय": "Office",
  "वेळापत्रक": "Schedule",
  "सरकारी दुवे": "Government Links",
  "सेवा आणि विभाग": "Services and Departments",
  "महत्वाचे पोर्टल": "Important Portals",
  "शिक्षण आणि माहिती": "Education and Information",
  "वेबसाईट धोरणे": "Website Policies",
  "आमच्याशी संपर्क साधा": "Contact Us",
  "अटी आणि शर्ती": "Terms and Conditions",
  "साईटमॅप": "Sitemap",
  "अभिप्राय": "Feedback",
  "मिडिया गॅलरी": "Media Gallery",
  "कॉपीराइट": "Copyright",
  "सर्व हक्क सुरक्षित": "All Rights Reserved",
  "हक्क": "Rights",
  "सुरक्षित": "Reserved",
  
  // Additional Common Terms
  "फोटो": "Photo",
  "छायाचित्र": "Photo",
  "गॅलरी": "Gallery",
  "व्हिडिओ": "Video",
  "ऑडिओ": "Audio",
  "फाईल": "File",
  "फोल्डर": "Folder",
  "साइट": "Site",
  "वेबसाइट": "Website",
  "अॅप": "App",
  "सॉफ्टवेअर": "Software",
  
  // Form Fields
  "नाव": "Name",
  "आडनाव": "Surname",
  "पूर्ण नाव": "Full Name",
  "वय": "Age",
  "लिंग": "Gender",
  "शहर": "City",
  "जिल्हा": "District",
  "पिन कोड": "PIN Code",
  "राज्य": "State",
  "देश": "Country",
  
  // Buttons & Actions
  "सबमिट": "Submit",
  "पुढे": "Next",
  "मागे": "Back",
  "पहिले": "First",
  "शेवटचे": "Last",
  "पुढील": "Next",
  "मागील": "Previous",
  
  // Status Messages
  "सेव्ह झाले": "Saved",
  "अपडेट झाले": "Updated",
  "हटवले": "Deleted",
  "जोडले": "Added",
  "यशस्वीरित्या": "Successfully",
  
  // Chatbot Related
  "चॅट": "Chat",
  "संदेश": "Message",
  "पाठवा": "Send",
  "टाइप करा": "Type",
  "बोला": "Speak",
  "ऐका": "Listen",
  
  // Budget & Finance
  "अर्थसंकल्प": "Budget",
  "खर्च": "Expense",
  "रक्कम": "Amount",
  "पैसे": "Money",
  "रुपये": "Rupees",
  
  // Clean Village Initiative
  "स्वच्छ": "Clean",
  "गंदगी": "Dirt",
  "पुनर्वापर": "Recycle",
  "कंपोस्ट": "Compost",
  "बायोगॅस": "Biogas",
  
  // Sell to Buy
  "विक्री": "Sale",
  "खरेदी": "Purchase",
  "विका": "Sell",
  "खरेदी करा": "Buy",
  "किंमत": "Price",
  "सवलत": "Discount",
  
  // My Family My Responsibility
  "कुटुंब": "Family",
  "जबाबदारी": "Responsibility",
  "मुलगा": "Son",
  "मुलगी": "Daughter",
  "पालक": "Parent",
  "आई": "Mother",
  "वडील": "Father",
  
  // Conflict Free Village
  "तंटा": "Conflict",
  "शांतता": "Peace",
  "समाधान": "Solution",
  "मध्यस्थी": "Mediation",
  "न्याय": "Justice",
  
  // Water Enriched Area
  "तलाव": "Pond",
  "विहीर": "Well",
  "बांध": "Dam",
  "पाणीपुरवठा": "Water Supply",
  
  // Common Verbs
  "पहा": "See",
  "लिहा": "Write",
  "जा": "Go",
  "ये": "Come",
  "द्या": "Give",
  "घ्या": "Take",
  "खा": "Eat",
  "प्या": "Drink",
  "झोपा": "Sleep",
  "उठा": "Wake Up",
  
  // Common Adjectives
  "मोठे": "Big",
  "लहान": "Small",
  "उंच": "Tall",
  "बुटका": "Short",
  "जुने": "Old",
  "नवीन": "New",
  "चांगले": "Good",
  "वाईट": "Bad",
  "सुंदर": "Beautiful",
  "गरजेचे": "Necessary",
  "महत्वाचे": "Important",
  "आवश्यक": "Required",
  
  // Directions
  "उत्तर": "North",
  "दक्षिण": "South",
  "पूर्व": "East",
  "पश्चिम": "West",
  "वर": "Up",
  "खाली": "Down",
  "डावे": "Left",
  "उजवे": "Right",
  
  // Additional phrases
  "पोर्टल": "Portal",
  "सिस्टम": "System",
  "वापरकर्ता": "User",
  "प्रशासन": "Administration",
  "सरकार": "Government",
  "महाराष्ट्र": "Maharashtra",
  "भारत": "India",
};

// Word-by-word translation for unknown phrases
const wordTranslations = {
  "ग्राम": "Village",
  "पंचायत": "Panchayat",
  "मध्ये": "In",
  "ला": "To",
  "चा": "Of",
  "ची": "Of",
  "चे": "Of",
  "ने": "By",
  "साठी": "For",
  "पासून": "From",
  "पर्यंत": "Until",
  "किंवा": "Or",
  "पण": "But",
  "तर": "Then",
  "जर": "If",
  "जेव्हा": "When",
  "कुठे": "Where",
  "कोण": "Who",
  "काय": "What",
  "कसे": "How",
  "का": "Why",
  "किती": "How Many",
  "केव्हा": "When",
};

// Load learned words from localStorage
const loadLearnedWords = () => {
  try {
    const saved = localStorage.getItem('learnedTranslations');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading learned words:', e);
  }
  return {};
};

// Save learned words to localStorage
const saveLearnedWords = (words) => {
  try {
    localStorage.setItem('learnedTranslations', JSON.stringify(words));
  } catch (e) {
    console.error('Error saving learned words:', e);
  }
};

// Get all learned words
let learnedWords = loadLearnedWords();

// Merge base dictionary with learned words
export const translationDictionary = { ...baseDictionary, ...learnedWords };

// Auto-learn: Add new word to dictionary
export const learnWord = (marathi, english) => {
  if (!marathi || !english || marathi.trim() === '' || english.trim() === '') {
    return;
  }
  
  const trimmedMarathi = marathi.trim();
  const trimmedEnglish = english.trim();
  
  // Don't learn if already exists
  if (translationDictionary[trimmedMarathi]) {
    return;
  }
  
  // Add to learned words
  learnedWords[trimmedMarathi] = trimmedEnglish;
  translationDictionary[trimmedMarathi] = trimmedEnglish;
  
  // Save to localStorage
  saveLearnedWords(learnedWords);
  
  console.log(`✅ Learned: "${trimmedMarathi}" → "${trimmedEnglish}"`);
};

// Function to translate text using dictionary with auto-learning and better word matching
export const translateText = (text, sourceLang = 'mr', targetLang = 'en') => {
  if (!text || typeof text !== 'string') return text;
  if (sourceLang === targetLang) return text;
  
  const trimmedText = text.trim();
  if (trimmedText === '') return text;
  
  // Check exact match first (highest priority)
  if (translationDictionary[trimmedText]) {
    return translationDictionary[trimmedText];
  }
  
  // Try phrase matching - split by spaces, punctuation, and common separators
  // Split more intelligently to handle compound words
  const words = trimmedText.split(/(\s+|[-–—,।।।])/);
  const translatedWords = [];
  let hasTranslation = false;
  
  // Translate each word/segment
  for (let i = 0; i < words.length; i++) {
    const segment = words[i];
    
    // Skip whitespace and separators (keep them as-is)
    if (/^\s*$/.test(segment) || /^[-–—,।।।]+$/.test(segment)) {
      translatedWords.push(segment);
      continue;
    }
    
    // Remove punctuation for matching but keep it
    const cleanWord = segment.replace(/[.,!?;:()\[\]{}'"]/g, '');
    const punctuation = segment.replace(/[^.,!?;:()\[\]{}'"]/g, '');
    
    if (cleanWord === '') {
      translatedWords.push(segment);
      continue;
    }
    
    let translated = segment;
    
    // Strategy 1: Check full dictionary (exact match)
    if (translationDictionary[cleanWord]) {
      translated = translationDictionary[cleanWord] + punctuation;
      hasTranslation = true;
    }
    // Strategy 2: Check word-by-word dictionary
    else if (wordTranslations[cleanWord]) {
      translated = wordTranslations[cleanWord] + punctuation;
      hasTranslation = true;
    }
    // Strategy 3: If word contains Devanagari, try compound word matching
    else if (/[\u0900-\u097F]/.test(cleanWord)) {
      // Try to find partial matches - check if any dictionary key is contained in this word
      let bestMatch = null;
      let bestMatchLength = 0;
      
      for (const [key, value] of Object.entries(translationDictionary)) {
        // Check if dictionary key is part of this word
        if (cleanWord.includes(key) && key.length > bestMatchLength) {
          bestMatch = { key, value };
          bestMatchLength = key.length;
        }
        // Or if this word is part of dictionary key
        else if (key.includes(cleanWord) && cleanWord.length > bestMatchLength) {
          bestMatch = { key, value };
          bestMatchLength = cleanWord.length;
        }
      }
      
      if (bestMatch) {
        // Replace the matched part
        translated = cleanWord.replace(bestMatch.key, bestMatch.value) + punctuation;
        hasTranslation = true;
      }
      // Strategy 4: Try splitting compound words (common in Marathi)
      else {
        // Try to split and translate parts (e.g., "ग्रामपंचायत" -> "ग्राम" + "पंचायत")
        let foundParts = false;
        for (let len = cleanWord.length - 1; len >= 2; len--) {
          for (let start = 0; start <= cleanWord.length - len; start++) {
            const part = cleanWord.substring(start, start + len);
            if (translationDictionary[part] || wordTranslations[part]) {
              const partTranslation = translationDictionary[part] || wordTranslations[part];
              const before = cleanWord.substring(0, start);
              const after = cleanWord.substring(start + len);
              translated = (before ? before + ' ' : '') + partTranslation + (after ? ' ' + after : '') + punctuation;
              hasTranslation = true;
              foundParts = true;
              break;
            }
          }
          if (foundParts) break;
        }
        
        // If still no match, keep original but mark for learning
        if (!foundParts) {
          translated = segment; // Keep original Marathi word
        }
      }
    }
    
    translatedWords.push(translated);
  }
  
  const result = translatedWords.join('');
  
  // If we translated something, return result
  if (hasTranslation && result !== trimmedText) {
    return result.trim();
  }
  
  // If no translation found and it's Marathi text, log for potential learning
  if (/[\u0900-\u097F]/.test(trimmedText) && !hasTranslation) {
    // This word will be kept as-is, but can be learned later
    // The auto-learning system will pick it up if a translation is provided
  }
  
  return result.trim() !== trimmedText ? result.trim() : text;
};

// Batch translation
export const translateBatch = (texts, sourceLang = 'mr', targetLang = 'en') => {
  return texts.map(text => translateText(text, sourceLang, targetLang));
};

// Export function to manually add words
export const addTranslation = (marathi, english) => {
  learnWord(marathi, english);
};

// Export function to get all translations
export const getAllTranslations = () => {
  return { ...translationDictionary };
};
