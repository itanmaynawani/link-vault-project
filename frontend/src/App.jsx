import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://link-vault-project.onrender.com';
const funnyQuotes = [
  "🧠 Consulting Albert Einstein to compress space-time into a micro-URL...",
  "📐 Applying the Pythagorean theorem to straighten your chaotic link...",
  "⚛️ Splitting the digital bits inside our quantum vault...",
  "🧙‍♂️ Waving a magic wand over your marathon-length URL...",
  "☕ Bribing the local server hamster with extra espresso...",
  "🚀 Calculating orbital trajectory for your shiny new short link..."
];

const analyticsQuotes = [
  "Albert Einstein checked the math: these clicks are expanding faster than the universe! 🌌",
  "Pythagoras himself verified that the shortest distance between a user and your destination is this exact link. 📐",
  "Quantum entanglement confirmed: every click here instantly warms up your database. 🔥",
  "Certified by Schrödinger's cat: this link is simultaneously clicked and not clicked until you check it. 🐈",
  "Newton's third law in action: every share of this link results in an equal and opposite surge of traffic. 🍏"
];

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [currentAnalyticsQuote, setCurrentAnalyticsQuote] = useState('');
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let interval;
    if (loading) {
      let index = 0;
      setLoadingMessage(funnyQuotes[index]);
      interval = setInterval(() => {
        index = (index + 1) % funnyQuotes.length;
        setLoadingMessage(funnyQuotes[index]);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setAnalytics(null);
    setCopied(false);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await axios.post(`${API_URL}/api/shorten`, {
        originalUrl,
        customAlias
      });
      setShortUrl(`${API_URL}/${response.data.shortCode || response.data.shortUrl}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Catastrophe! Failed to shorten URL.';
      setError(`💥 ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const fetchAnalytics = async (code) => {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/${code}`);
      setAnalytics(response.data);
      const randomQuote = analyticsQuotes[Math.floor(Math.random() * analyticsQuotes.length)];
      setCurrentAnalyticsQuote(randomQuote);
    } catch (err) {
      setError('📊 Could not retrieve analytics from the matrix.');
    }
  };

  return (
    <>
      <div className="vault-container">
        <div className="header">
          <div className="status-badge">
            <span className="status-dot"></span> Quantum Reactor Online
          </div>
          <h1>Link Vault</h1>
          <p>The Ultimate Quantum URL Shortener & Analytics Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="url"
            placeholder="Paste your marathon-length URL here..."
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
          <div className="input-row">
            <input
              type="text"
              placeholder="Custom alias (optional, e.g. my-cool-link)"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Shrinking...' : 'Shorten ⚡'}
            </button>
          </div>
        </form>

        {loading && <div className="flavor-text">{loadingMessage}</div>}

        {error && <div className="error-box">{error}</div>}

        {shortUrl && (
          <div className="result-card">
            <h3>🎉 Success! Your microscopic link is ready:</h3>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.1rem', color: '#58a6ff', wordBreak: 'break-all' }}>
              {shortUrl}
            </a>
            
            <div className="action-row">
              <button onClick={handleCopy} className="copy-btn">
                {copied ? 'Copied to Clipboard! ✓' : 'Copy Link 📋'}
              </button>
            </div>

            <div className="qr-container">
              <QRCodeSVG value={shortUrl} size={130} />
              <span style={{ fontSize: '0.8rem', color: '#21262d', marginTop: '6px', fontWeight: 'bold' }}>Scan to Open</span>
            </div>

            <button
              onClick={() => {
                const code = shortUrl.split('/').pop();
                fetchAnalytics(code);
              }}
              className="analytics-btn"
            >
              📊 View Classified Analytics
            </button>
          </div>
        )}

        {analytics && (
          <div className="analytics-card">
            <h3>📈 Live Link Intelligence</h3>
            <p><strong>Target URL:</strong> {analytics.originalUrl}</p>
            <p><strong>Secret Code:</strong> {analytics.shortCode}</p>
            <p><strong>Total Clicks Warmed Up:</strong> {analytics.clicks} 🔥</p>
            <p><strong>Born On:</strong> {new Date(analytics.createdAt).toLocaleString()}</p>
            
            <div style={{ marginTop: '15px', padding: '12px 16px', background: 'rgba(88, 166, 255, 0.08)', borderLeft: '3px solid #58a6ff', borderRadius: '6px', fontSize: '0.9rem', fontStyle: 'italic', color: '#8b949e' }}>
              💡 <strong>Quantum Insight:</strong> {currentAnalyticsQuote}
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="creator-tag">✨ Engineered with 💻 & ⚡ by Tanmay Rakeshkumar Nawani</div>
      </footer>
    </>
  );
}

export default App;