# GramSevak AI - Marathi Language Chatbot Documentation

## 🎯 Overview
GramSevak AI is an intelligent Marathi-language chatbot designed for the Gram Panchayat website. It provides dynamic information retrieval from Firebase Firestore based on keyword detection and database mapping.

## 🚀 Features

### ✅ Implemented Features
- **Marathi Language Support**: Responds in Marathi with polite, accurate answers
- **Dynamic Firebase Integration**: Fetches real-time data from 17+ Firestore collections
- **Intelligent Keyword Matching**: Supports both Marathi and English queries
- **Modern UI**: Material-UI based responsive chat interface
- **Real-time Chat**: Instant responses with loading indicators
- **Expandable Interface**: Collapsible chat window for better UX

### 🔧 Technical Implementation

#### Database Mapping
The chatbot maps user queries to 17 different Firebase collections:

1. **Gram Panchayat Info** (`home/grampanchayat-info`)
2. **Members** (`members`)
3. **Member Bio** (`members-bio`)
4. **Gramsabha Decisions** (`decisions`)
5. **Facilities** (`facilities`)
6. **Awards** (`awards`)
7. **E-Seva** (`eseva`)
8. **State Schemes** (`yojana/state/items`)
9. **Central Schemes** (`yojana/central/items`)
10. **Programs** (15 different program collections)
11. **Helplines** (`helplines`)
12. **Hospitals** (`hospitals`)
13. **Census** (`census`)
14. **Tourism** (`tourism`)
15. **Contacts** (`contacts`)
16. **News & Announcements** (`extra/batmya/items`)
17. **Pragat Shetkari** (`extra/pragat-shetkari/items`)
18. **E-Shikshan** (`extra/e-shikshan/items`)

#### Keyword Matching System
- **Marathi Keywords**: ग्रामपंचायत, सदस्य, सुविधा, योजना, etc.
- **English Keywords**: members, facilities, schemes, programs, etc.
- **Smart Matching**: Scores keywords and returns best matches
- **Fallback Response**: Polite message when no match found

#### Response Formatting
- **Top 3 Items**: Shows most recent/relevant data
- **Structured Information**: Title, description, date, location
- **Photo Support**: Indicates available photos
- **Helpful Endings**: Always ends with assistance offer

## 📱 User Interface

### Chat Interface
- **Floating Button**: Fixed position chat toggle
- **Expandable Window**: 350px width, expandable height
- **Message Bubbles**: User (right, blue) and Bot (left, white)
- **Quick Suggestions**: Pre-defined query chips
- **Loading States**: Visual feedback during processing

### Responsive Design
- **Mobile Optimized**: Works on all screen sizes
- **Material Design**: Consistent with app theme
- **Smooth Animations**: Fade and slide transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔍 Usage Examples

### Sample Queries in Marathi
```
"ग्रामपंचायतीची माहिती सांगा"
"सरपंच कोण आहे?"
"ग्रामपंचायतीमध्ये कोणत्या सुविधा आहेत?"
"राज्य सरकारच्या योजना कोणत्या आहेत?"
"स्वच्छ गाव उपक्रमाची माहिती"
```

### Sample Queries in English
```
"Who is the sarpanch?"
"What facilities are available?"
"Show me the latest news"
"Tell me about government schemes"
```

## 🛠️ Technical Details

### Dependencies
- **React 18**: Modern React with hooks
- **Material-UI 5**: Component library
- **Firebase 12**: Database and authentication
- **Firestore**: NoSQL database queries

### File Structure
```
src/
├── components/
│   └── GramSevakAI.jsx          # Main chatbot component
├── App.jsx                       # App integration
└── firebase.js                   # Firebase configuration
```

### Key Functions
- `findMatchingDatabase()`: Keyword matching logic
- `fetchDataFromFirebase()`: Firestore data retrieval
- `formatResponse()`: Response formatting
- `handleSendMessage()`: Message processing

## 🎨 Customization

### Adding New Keywords
```javascript
const databaseMapping = {
  'new-collection': {
    path: 'collection/path',
    keywords: ['नवीन', 'keywords', 'new', 'keywords'],
    fields: ['field1', 'field2', 'field3']
  }
};
```

### Modifying Response Format
```javascript
const formatResponse = (data, config, matchedKeywords) => {
  // Custom response formatting logic
  return formattedResponse;
};
```

### Styling Customization
```javascript
// Chat window styling
sx={{
  width: 350,           // Adjust width
  height: 500,          // Adjust height
  borderRadius: 2,      // Adjust border radius
}}
```

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- Firebase project configured
- Firestore collections populated

### Installation
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Firestore
3. Configure security rules
4. Populate collections with data

### Environment Variables
```javascript
// firebase.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-domain",
  projectId: "your-project-id",
  // ... other config
};
```

## 📊 Performance

### Optimization Features
- **Lazy Loading**: Components load on demand
- **Query Limiting**: Maximum 3 items per response
- **Caching**: Firebase handles caching automatically
- **Debouncing**: Prevents multiple rapid requests

### Monitoring
- **Error Handling**: Graceful fallbacks
- **Loading States**: User feedback
- **Console Logging**: Debug information

## 🎯 Future Enhancements

### Planned Features
- **Voice Input**: Speech-to-text support
- **File Uploads**: Document sharing
- **Multi-language**: Hindi and English support
- **Analytics**: Usage tracking
- **Admin Panel**: Chatbot management

### Technical Improvements
- **Caching**: Response caching
- **Offline Support**: PWA capabilities
- **Push Notifications**: Real-time updates
- **AI Integration**: Advanced NLP

## 🐛 Troubleshooting

### Common Issues
1. **Firebase Connection**: Check configuration
2. **Data Not Loading**: Verify Firestore rules
3. **Keywords Not Matching**: Update keyword lists
4. **UI Issues**: Check Material-UI imports

### Debug Mode
```javascript
// Enable debug logging
console.log('Matching databases:', matches);
console.log('Fetched data:', data);
```

## 📞 Support

For technical support or feature requests:
- Check Firebase console for errors
- Verify Firestore data structure
- Test keyword matching manually
- Review browser console for errors

---

**GramSevak AI** - Empowering Gram Panchayats with intelligent information access! 🚀
