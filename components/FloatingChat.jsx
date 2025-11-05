import React, { useEffect, useMemo, useRef } from 'react';
import { Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const EXAMPLE_QUERIES = [
  'Critical patient needs O+ blood near Business Bay',
  'Transfer trauma case from MG Road accident',
  'Locate nearest ICU bed with ventilator support',
];

function StructuredInsights({ understood, allocation, jargonTranslation }) {
  if (!understood && !allocation && !jargonTranslation) {
    return null;
  }

  return (
    <div>
      {understood && (
        <div className="understood-box">
          <strong>AI understanding</strong>
          <div>Severity: {understood.severity ?? 'unknown'}</div>
          {understood.needs_blood && <div className="donors-alert">Blood support required</div>}
          {understood.blood_type && <div>Requested blood type: {understood.blood_type}</div>}
        </div>
      )}

      {allocation && allocation.allocated_hospital && (
        <div className="allocation-box">
          <strong>Recommended hospital</strong>
          <div>{allocation.allocated_hospital.name}</div>
          {allocation.distance_km && (
            <div>Distance: {allocation.distance_km.toFixed ? allocation.distance_km.toFixed(1) : allocation.distance_km} km</div>
          )}
          {allocation.eta_minutes && <div>ETA: {allocation.eta_minutes} minutes</div>}
        </div>
      )}

      {jargonTranslation && (
        <div className="understood-box" style={{ marginTop: 12 }}>
          <strong>Plain language</strong>
          <div>{jargonTranslation.simple}</div>
        </div>
      )}
    </div>
  );
}

export default function FloatingChat({
  onQuery,
  messages,
  loading,
  query,
  setQuery,
  identifiedPatient,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const placeholder = useMemo(() => {
    if (identifiedPatient?.patient?.name) {
      return `Ask MediLink about next steps for ${identifiedPatient.patient.name}...`;
    }
    return 'Describe the emergency scenario...';
  }, [identifiedPatient]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    onQuery?.(trimmed);
  }

  function handleExampleClick(example) {
    setQuery?.(example);
    onQuery?.(example);
  }

  return (
    <div className="panel chat-panel">
      <div className="panel-header">
        <div className="panel-title">
          <CheckCircle size={18} />
          MediLink Incident Chat
        </div>
        {identifiedPatient?.patient?.name && (
          <div className="panel-tech">Linked to {identifiedPatient.patient.name}</div>
        )}
      </div>

      <div className="example-queries">
        {EXAMPLE_QUERIES.map((example) => (
          <button key={example} type="button" className="chip" onClick={() => handleExampleClick(example)}>
            {example}
          </button>
        ))}
      </div>

      <div className="messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="message system">
            🏥 Ask about patient needs, available hospitals, or request jargon translation support.
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role || 'system'}`}>
            {message.content && <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>}
            <StructuredInsights
              understood={message.understood}
              allocation={message.allocation}
              jargonTranslation={message.jargon_translation}
            />
          </div>
        ))}

        {loading && (
          <div className="message assistant typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </div>

      <form className="input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(event) => setQuery?.(event.target.value)}
          disabled={loading}
        />
        <button className="send-button" type="submit" disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
        </button>
      </form>

      {loading && (
        <div className="chat-footer-note">
          <AlertTriangle size={14} /> Gathering live hospital availability...
        </div>
      )}
    </div>
  );
}
