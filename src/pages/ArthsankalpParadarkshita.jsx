import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, FileText, Eye, Calendar } from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';

const ArthsankalpParadarkshita = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(`${currentYear}-${String(currentYear + 1).slice(-2)}`);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // State for Firebase data
  const [loading, setLoading] = useState(true);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    totalIncome: 0,
    totalExpenditure: 0,
    balance: 0
  });
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenditureCategories, setExpenditureCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  // Convert year format from "2024-25" to "2024" for Firebase
  const getYearForFirebase = (yearStr) => {
    return yearStr.split('-')[0];
  };

  // Fetch data from Firebase
  useEffect(() => {
    const firebaseYear = getYearForFirebase(selectedYear);
    setLoading(true);

    // Firebase collections
    const budgetCollection = collection(db, 'budget');
    const incomeCollection = collection(db, 'budget-income');
    const expenditureCollection = collection(db, 'budget-expenditure');
    const transactionsCollection = collection(db, 'budget-transactions');
    const documentsCollection = collection(db, 'budget-documents');

    // Fetch budget summary
    const budgetDocRef = doc(budgetCollection, `year-${firebaseYear}`);
    const budgetUnsub = onSnapshot(
      budgetDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const totalBudget = data.totalBudget || 0;
          const totalIncome = data.totalIncome || 0;
          const totalExpenditure = data.totalExpenditure || 0;
          setBudgetSummary({
            totalBudget,
            totalIncome,
            totalExpenditure,
            balance: totalBudget - totalExpenditure
          });
        } else {
          setBudgetSummary({ totalBudget: 0, totalIncome: 0, totalExpenditure: 0, balance: 0 });
        }
      },
      (error) => {
        console.error('Error fetching budget summary:', error);
      }
    );

    // Fetch income sources
    const incomeUnsub = onSnapshot(
      query(incomeCollection, where('year', '==', firebaseYear)),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by amount descending
        items.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        setIncomeCategories(items.map(item => ({
          name: item.source,
          amount: item.amount || 0,
          percentage: parseFloat(item.percentage) || 0
        })));
      },
      (error) => {
        console.error('Error fetching income sources:', error);
      }
    );

    // Fetch expenditure categories
    const expenditureUnsub = onSnapshot(
      query(expenditureCollection, where('year', '==', firebaseYear)),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by amount descending
        items.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        setExpenditureCategories(items.map(item => ({
          name: item.category,
          amount: item.amount || 0,
          percentage: parseFloat(item.percentage) || 0,
          status: item.status || 'ongoing'
        })));
      },
      (error) => {
        console.error('Error fetching expenditure categories:', error);
      }
    );

    // Fetch transactions
    const transactionsUnsub = onSnapshot(
      query(transactionsCollection, where('year', '==', firebaseYear)),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by date descending
        items.sort((a, b) => {
          const dateA = a.date || '';
          const dateB = b.date || '';
          return dateB.localeCompare(dateA);
        });
        setRecentTransactions(items.map(item => ({
          date: item.date,
          description: item.description,
          amount: item.amount || 0,
          type: item.type || 'expense'
        })));
      },
      (error) => {
        console.error('Error fetching transactions:', error);
      }
    );

    // Fetch documents
    const documentsUnsub = onSnapshot(
      query(documentsCollection, where('year', '==', firebaseYear)),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by date descending
        items.sort((a, b) => {
          const dateA = a.date || '';
          const dateB = b.date || '';
          return dateB.localeCompare(dateA);
        });
        setDocuments(items.map(item => ({
          name: item.title,
          date: item.date,
          size: item.fileSize || 'N/A',
          url: item.fileUrl
        })));
      },
      (error) => {
        console.error('Error fetching documents:', error);
      }
    );

    // Fetch available years from budget collection
    const yearsUnsub = onSnapshot(budgetCollection, (snapshot) => {
      const years = snapshot.docs
        .map(d => {
          const data = d.data();
          const year = data.year || d.id.replace('year-', '');
          if (year && !isNaN(year)) {
            const yearNum = parseInt(year);
            return `${yearNum}-${String(yearNum + 1).slice(-2)}`;
          }
          return null;
        })
        .filter(Boolean)
        .sort()
        .reverse();
      
      if (years.length > 0) {
        setAvailableYears(years);
        // Set default year if current selection is not available
        if (!years.includes(selectedYear) && years.length > 0) {
          setSelectedYear(years[0]);
        }
      } else {
        // Default years if no data
        const defaultYears = [];
        for (let i = 0; i < 5; i++) {
          const year = currentYear - i;
          defaultYears.push(`${year}-${String(year + 1).slice(-2)}`);
        }
        setAvailableYears(defaultYears);
      }
    });

    setLoading(false);

    return () => {
      budgetUnsub();
      incomeUnsub();
      expenditureUnsub();
      transactionsUnsub();
      documentsUnsub();
      yearsUnsub();
    };
  }, [selectedYear, currentYear]);

  const currentData = budgetSummary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-orange-500">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            अर्थसंकल्प आणि पारदर्शकता
          </h1>
          <p className="text-gray-600">
            ग्रामपंचायतीचे वार्षिक अर्थसंकल्प, उत्पन्न आणि खर्चाचा संपूर्ण तपशील
          </p>
        </div>

        {/* Year Selection */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            आर्थिक वर्ष निवडा
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            disabled={loading}
          >
            {availableYears.length > 0 ? (
              availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            ) : (
              <>
                <option value={`${currentYear}-${String(currentYear + 1).slice(-2)}`}>
                  {currentYear}-{String(currentYear + 1).slice(-2)}
                </option>
                <option value={`${currentYear - 1}-${String(currentYear).slice(-2)}`}>
                  {currentYear - 1}-{String(currentYear).slice(-2)}
                </option>
              </>
            )}
          </select>
          {loading && (
            <p className="text-sm text-gray-500 mt-2">डेटा लोड होत आहे...</p>
          )}
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">एकूण अर्थसंकल्प</span>
              <FileText className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">
              {loading ? '...' : `₹${(currentData.totalBudget / 100000).toFixed(1)}L`}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">एकूण उत्पन्न</span>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">
              {loading ? '...' : `₹${(currentData.totalIncome / 100000).toFixed(1)}L`}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">एकूण खर्च</span>
              <TrendingDown className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">
              {loading ? '...' : `₹${(currentData.totalExpenditure / 100000).toFixed(1)}L`}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">शिल्लक रक्कम</span>
              <Calendar className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">
              {loading ? '...' : `₹${(currentData.balance / 100000).toFixed(1)}L`}
            </div>
          </div>
        </div>

        {/* Income and Expenditure Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Income Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              उत्पन्नाचा तपशील
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500">लोड होत आहे...</div>
              ) : incomeCategories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">उत्पन्न स्रोत उपलब्ध नाहीत</div>
              ) : (
                incomeCategories.map((category, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(category.amount / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{category.percentage}%</div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Expenditure Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-orange-600" />
              खर्चाचा तपशील
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500">लोड होत आहे...</div>
              ) : expenditureCategories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">खर्च श्रेणी उपलब्ध नाहीत</div>
              ) : (
                expenditureCategories.map((category, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        category.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {category.status === 'completed' ? 'पूर्ण' : 'सुरू'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(category.amount / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-orange-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{category.percentage}%</div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            अलीकडील व्यवहार
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">तारीख</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">तपशील</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">प्रकार</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">रक्कम</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      लोड होत आहे...
                    </td>
                  </tr>
                ) : recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      व्यवहार उपलब्ध नाहीत
                    </td>
                  </tr>
                ) : (
                  recentTransactions.slice(0, 10).map((transaction, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{transaction.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'उत्पन्न' : 'खर्च'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{(transaction.amount / 1000).toFixed(0)}K
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            कागदपत्रे आणि अहवाल
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-8 text-gray-500">लोड होत आहे...</div>
            ) : documents.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">दस्तावेज उपलब्ध नाहीत</div>
            ) : (
              documents.map((doc, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{doc.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    ) : (
                      <button className="ml-3 p-2 text-gray-400 cursor-not-allowed rounded-lg">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transparency Notice */}
        <div className="mt-6 bg-gradient-to-r from-orange-100 to-green-100 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="font-bold text-gray-800 mb-2">पारदर्शकता आणि जबाबदारी</h3>
          <p className="text-sm text-gray-700">
            सर्व आर्थिक व्यवहार आणि खर्च महाराष्ट्र ग्रामपंचायत अधिनियम अंतर्गत नियमानुसार केले जातात. 
            नागरिक कोणत्याही वेळी ग्रामपंचायत कार्यालयात येऊन आर्थिक नोंदी पाहू शकतात.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArthsankalpParadarkshita;