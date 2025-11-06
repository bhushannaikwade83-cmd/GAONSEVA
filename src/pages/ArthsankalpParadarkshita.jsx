import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, FileText, Eye, Calendar } from 'lucide-react';

const ArthsankalpParadarkshita = () => {
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const budgetData = {
    '2024-25': {
      totalBudget: 5000000,
      income: 4800000,
      expenditure: 4200000,
      balance: 600000
    },
    '2023-24': {
      totalBudget: 4500000,
      income: 4300000,
      expenditure: 4100000,
      balance: 200000
    }
  };

  const incomeCategories = [
    { name: 'केंद्र सरकार अनुदान', amount: 2000000, percentage: 42 },
    { name: 'राज्य सरकार अनुदान', amount: 1500000, percentage: 31 },
    { name: 'स्थानिक कर', amount: 800000, percentage: 17 },
    { name: 'इतर स्रोत', amount: 500000, percentage: 10 }
  ];

  const expenditureCategories = [
    { name: 'पायाभूत सुविधा', amount: 1500000, percentage: 36, status: 'completed' },
    { name: 'शिक्षण आणि आरोग्य', amount: 1200000, percentage: 29, status: 'ongoing' },
    { name: 'पाणीपुरवठा आणि स्वच्छता', amount: 800000, percentage: 19, status: 'completed' },
    { name: 'प्रशासकीय खर्च', amount: 700000, percentage: 16, status: 'ongoing' }
  ];

  const recentTransactions = [
    { date: '2024-10-15', description: 'रस्ता बांधकाम', amount: 250000, type: 'expenditure' },
    { date: '2024-10-10', description: 'राज्य अनुदान प्राप्त', amount: 500000, type: 'income' },
    { date: '2024-10-05', description: 'शाळा दुरुस्ती', amount: 150000, type: 'expenditure' },
    { date: '2024-09-28', description: 'स्थानिक कर संकलन', amount: 75000, type: 'income' }
  ];

  const documents = [
    { name: 'वार्षिक अर्थसंकल्प 2024-25', date: '2024-04-01', size: '2.4 MB' },
    { name: 'तिमाही अहवाल Q1', date: '2024-07-15', size: '1.8 MB' },
    { name: 'लेखापरीक्षण अहवाल 2023-24', date: '2024-06-30', size: '3.2 MB' },
    { name: 'खर्च तपशील रजिस्टर', date: '2024-10-01', size: '1.5 MB' }
  ];

  const currentData = budgetData[selectedYear];

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
          >
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
          </select>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">एकूण अर्थसंकल्प</span>
              <FileText className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{(currentData.totalBudget / 100000).toFixed(1)}L</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">एकूण उत्पन्न</span>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{(currentData.income / 100000).toFixed(1)}L</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">एकूण खर्च</span>
              <TrendingDown className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{(currentData.expenditure / 100000).toFixed(1)}L</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">शिल्लक रक्कम</span>
              <Calendar className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{(currentData.balance / 100000).toFixed(1)}L</div>
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
              {incomeCategories.map((category, idx) => (
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
              ))}
            </div>
          </div>

          {/* Expenditure Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-orange-600" />
              खर्चाचा तपशील
            </h2>
            <div className="space-y-4">
              {expenditureCategories.map((category, idx) => (
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
              ))}
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
                {recentTransactions.map((transaction, idx) => (
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
                ))}
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
            {documents.map((doc, idx) => (
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
                  <button className="ml-3 p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
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