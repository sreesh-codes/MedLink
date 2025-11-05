import React, { useMemo, useState } from 'react';
import { Languages, Loader2, RotateCcw, Copy } from 'lucide-react';
import api from '../services/api';

const EXAMPLES = [
  {
    jargon: 'Patient in hemorrhagic shock, needs type and cross-match stat.',
    simple: 'The patient is losing a lot of blood and we urgently need to confirm their blood type for a transfusion.',
    terms: ['Hemorrhagic shock', 'Type and cross-match', 'Stat'],
  },
  {
    jargon: 'Administer 5mg nebulized albuterol; monitor SpO2 and respiratory effort.',
    simple: 'Give 5mg of inhaled asthma medicine and watch their oxygen level and breathing.',
    terms: ['Nebulized', 'Albuterol', 'SpO2'],
  },
];

const MAX_HISTORY = 5;

export default function JargonTranslator() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const charCount = text.length;

  async function handleTranslate(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.translateJargon(text.trim());
      setResult(response);
      setHistory((prev) => {
        const next = [{ input: text.trim(), output: response }, ...prev];
        return next.slice(0, MAX_HISTORY);
      });
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to translate medical jargon');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setText('');
    setResult(null);
    setError(null);
  }

  function handleUseExample(example) {
    setText(example.jargon);
    setResult({ simple: example.simple, terms: example.terms, reading_level: 7 });
  }

  const simpleText = result?.simple ?? '';
  const hasTerms = result?.terms && result.terms.length > 0;

  const readingLevel = useMemo(() => {
    if (result?.reading_level) {
      return result.reading_level;
    }
    return 7;
  }, [result]);

  async function handleCopySimple() {
    if (!simpleText) return;
    try {
      await navigator.clipboard.writeText(simpleText);
    } catch (err) {
      console.warn('Clipboard copy failed', err);
    }
  }

  return (
    <div className="jargon-translator-panel">
      <div className="jargon-header">
        <div className="jargon-title-section">
          <Languages size={22} />
          <div>
            <h3 className="jargon-title">Medical Jargon Translator</h3>
            <div className="jargon-subtitle">Convert complex clinical language into patient-friendly terms</div>
          </div>
        </div>
      </div>

      <div className="jargon-content">
        <form className="jargon-input-section" onSubmit={handleTranslate}>
          <div className="jargon-textarea-wrapper">
            <textarea
              className="jargon-textarea"
              placeholder="e.g. Patient in hemorrhagic shock, needs type and cross-match stat..."
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={1000}
            />
            <div className="jargon-char-count">{charCount}/1000</div>
          </div>

          {error && <div className="jargon-error">{error}</div>}

          <div className="jargon-actions">
            <button type="submit" className="jargon-translate-btn" disabled={loading || !text.trim()}>
              {loading ? <Loader2 className="spin" size={18} /> : <Languages size={18} />}
              {loading ? 'Translating...' : 'Translate Medical Jargon'}
            </button>
            <button type="button" className="jargon-clear-btn" onClick={handleClear} disabled={loading && !text}>
              <RotateCcw size={16} />
              Clear
            </button>
          </div>
        </form>

        {result && (
          <div className="jargon-output-section">
            <div className="jargon-output-grid">
              <div className="jargon-translation-box">
                <div className="jargon-box-title">Plain Language Translation</div>
                <div className="jargon-reading-level">Reading level: Grade {readingLevel}</div>
                <p className="jargon-simple-text">{simpleText}</p>
                <button type="button" className="jargon-copy-btn" onClick={handleCopySimple}>
                  <Copy size={14} /> Copy explanation
                </button>
              </div>

              <div className="jargon-terms-box">
                <div className="jargon-box-title">Key Medical Terms</div>
                <div className="jargon-count">{hasTerms ? result.terms.length : 0} detected</div>
                {hasTerms ? (
                  <div className="jargon-terms-list">
                    {result.terms.map((term) => (
                      <span key={term} className="jargon-term-badge">
                        {term}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="jargon-no-terms">No jargon detected in this sentence.</div>
                )}
              </div>
            </div>
          </div>
        )}

        <section className="jargon-examples-section">
          <div className="jargon-examples-title">Quick examples</div>
          <div className="jargon-examples-grid">
            {EXAMPLES.map((example) => (
              <button
                key={example.jargon}
                type="button"
                className="jargon-example-card"
                onClick={() => handleUseExample(example)}
              >
                <div className="jargon-example-jargon">
                  <strong>Jargon</strong>
                  <p>{example.jargon}</p>
                </div>
                <div className="jargon-example-simple">
                  <strong>Plain language</strong>
                  <p>{example.simple}</p>
                </div>
                <div className="jargon-example-terms">
                  {example.terms.map((term) => (
                    <span key={term} className="jargon-example-term">
                      {term}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        {history.length > 0 && (
          <section className="jargon-history">
            <div className="jargon-history-title">Recent translations</div>
            <div className="jargon-history-list">
              {history.map((item, index) => (
                <div key={index} className="jargon-history-item" onClick={() => setText(item.input)}>
                  <div className="jargon-history-input">{item.input}</div>
                  <div className="jargon-history-simple">{item.output?.simple}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
