import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div>
          <strong>MediLink AI</strong>
          <span>Emergency Healthcare Resource Network</span>
        </div>
        <div className="footer-links">
          <a href="https://fastapi.tiangolo.com/" target="_blank" rel="noreferrer">FastAPI</a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">React 18</a>
          <a href="https://n8n.io" target="_blank" rel="noreferrer">N8N workflows</a>
        </div>
      </div>
    </footer>
  );
}
