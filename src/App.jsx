import React, { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [error, setError] = useState("");
  const [shortUrls, setShortUrls] = useState([]);

  useEffect(() => {
    const storedUrls = localStorage.getItem("shortUrls");
    if (storedUrls) setShortUrls(JSON.parse(storedUrls));
  }, []);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateShortUrl = () => {
    setError("");

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    if (!validateUrl(url)) {
      setError("Invalid URL format.");
      return;
    }

    if (
      customUrl &&
      shortUrls.some((item) => item.id.toLowerCase() === customUrl.toLowerCase())
    ) {
      setError("Custom URL already exists. Choose another one.");
      return;
    }

    const shortUrlId = customUrl || Math.random().toString(36).substring(2, 8);
    const newShortUrl = {
      id: shortUrlId,
      original: url,
      short: `${window.location.origin}/${shortUrlId}`,
      clicks: 0,
    };

    const updatedUrls = [...shortUrls, newShortUrl];
    setShortUrls(updatedUrls);
    localStorage.setItem("shortUrls", JSON.stringify(updatedUrls));
    setUrl("");
    setCustomUrl("");
  };

  const handleRedirect = (id) => {
    const updatedUrls = shortUrls.map((url) =>
      url.id === id ? { ...url, clicks: url.clicks + 1 } : url
    );
    setShortUrls(updatedUrls);
    localStorage.setItem("shortUrls", JSON.stringify(updatedUrls));

    const originalUrl = updatedUrls.find((url) => url.id === id).original;
    window.open(originalUrl, "_blank");
  };

  const deleteUrl = (id) => {
    const filteredUrls = shortUrls.filter((url) => url.id !== id);
    setShortUrls(filteredUrls);
    localStorage.setItem("shortUrls", JSON.stringify(filteredUrls));
  };

  const clearInputs = () => {
    setUrl("");
    setCustomUrl("");
  };

  return (
    <div className="app">
      <h1>🌐 URL Shortener</h1>

      <div className="input-container">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to shorten"
          className="input"
        />
        <input
          type="text"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="Custom URL (optional)"
          className="input"
        />
        <div className="button-group">
          <button onClick={generateShortUrl} className="btn">
            Shorten
          </button>
          <button onClick={clearInputs} className="btn clear">
            Clear
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="shortened-urls">
        <h2>Shortened URLs</h2>
        {shortUrls.length === 0 ? (
          <p>No URLs shortened yet.</p>
        ) : (
          <ul>
            {shortUrls.map(({ id, original, short, clicks }) => (
              <li key={id} className="url-item">
                <p>
                  <strong>Original:</strong> {original}
                </p>
                <p>
                  <strong>Shortened:</strong>{" "}
                  <a
                    href={short}
                    target="_blank"
                    onClick={(e) => e.preventDefault()}
                  >
                    {short}
                  </a>{" "}
                  <button
                    onClick={() => handleRedirect(id)}
                    className="btn small"
                  >
                    Open
                  </button>
                </p>
                <p>
                  <strong>Clicks:</strong> {clicks}
                </p>
                <div className="actions">
                  <CopyToClipboard text={short}>
                    <button className="btn small">
                      <i className="fa fa-copy"></i> Copy
                    </button>
                  </CopyToClipboard>
                  <button
                    onClick={() => deleteUrl(id)}
                    className="btn small danger"
                  >
                    <i className="fa fa-trash"></i> Delete
                  </button>
                </div>
                <div className="qr-code">
                  <QRCodeCanvas value={short} size={128} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
