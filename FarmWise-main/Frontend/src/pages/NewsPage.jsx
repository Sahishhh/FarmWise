import React, { useState, useEffect } from "react";
import axios from "axios";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState(null);

  const languages = [
    { code: 'en', name: 'English', label: 'English' },
    { code: 'hi', name: 'Hindi', label: 'हिंदी' },
    { code: 'mr', name: 'Marathi', label: 'मराठी' }
  ];

  useEffect(() => {
    fetchNews();
  }, [language]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try both endpoints
      let response;
      try {
        response = await axios.get(`http://localhost:9000/worldnews?language=${language}`);
      } catch (e) {
        console.log("Trying alternative endpoint...");
        response = await axios.get(`http://localhost:9000/indiannews?language=${language}`);
      }
      
      if (response.data.status === "ok" && response.data.articles) {
        setNews(response.data.articles);
      } else {
        setError("No articles found");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(error.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  // Get tag color based on category
  const getTagColor = (tag) => {
    const colors = {
      'Weather': 'bg-blue-100 text-blue-800',
      'Threats': 'bg-red-100 text-red-800',
      'Soil & Nutrients': 'bg-brown-100 text-brown-800',
      'Water Resources': 'bg-cyan-100 text-cyan-800',
      'Crops': 'bg-green-100 text-green-800',
      'Farming': 'bg-emerald-100 text-emerald-800'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Language Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                language === lang.code
                  ? 'bg-green-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
        {language === 'hi' ? 'कृषि समाचार' : 
         language === 'mr' ? 'कृषी बातम्या' : 
         'Agricultural News'}
      </h1>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-2 text-green-700">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <p className="text-lg text-red-800">{error}</p>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-10 bg-yellow-50 rounded-lg">
          <p className="text-lg text-yellow-800">No news articles available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl p-4 border border-gray-200 hover:shadow-xl transition-shadow">
              {article.urlToImage && (
                <div className="relative h-48 mb-4">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=News';
                    }}
                  />
                </div>
              )}
              <div>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tags?.map((tag, i) => (
                    <span 
                      key={i} 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">
                    {article.source.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                  {article.title}
                </h2>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.description}
                </p>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  {language === 'hi' ? 'पूरा पढ़ें' :
                   language === 'mr' ? 'पूर्ण वाचा' :
                   'Read More'}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
