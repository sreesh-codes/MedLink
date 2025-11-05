import React, { useState } from 'react';
import { Camera, RefreshCw, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function BiometricScanner({ onPatientIdentified }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to scan biometrics');
  const [error, setError] = useState(null);

  async function handleIdentifyDemo() {
    setLoading(true);
    setError(null);
    setStatus('Scanning for patient match...');
    try {
      const result = await api.identifyPatient([]);
      setStatus(result.match_found ? 'Patient identified successfully' : 'No match found');
      onPatientIdentified?.(result);
    } catch (err) {
      const message = err?.error || err?.message || 'Identification failed';
      setError(message);
      setStatus('Unable to identify patient');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStatus('Ready to scan biometrics');
    setError(null);
    onPatientIdentified?.(null);
  }

  const statusClass = loading
    ? 'scanner-status searching'
    : status.includes('identified')
      ? 'scanner-status detected'
      : 'scanner-status';

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Camera size={20} />
          Biometric Scanner
        </div>
        <div className="panel-tech">Face recognition demo</div>
      </div>

      <div className={statusClass}>
        <Sparkles size={18} />
        <span>{status}</span>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="scanner-controls">
        <button
          type="button"
          className="scanner-button primary"
          onClick={handleIdentifyDemo}
          disabled={loading}
        >
          {loading ? 'Scanning...' : 'Identify Demo Patient'}
        </button>
        <button
          type="button"
          className="scanner-button secondary"
          onClick={handleReset}
          disabled={loading}
        >
          <RefreshCw size={16} /> Reset
        </button>
      </div>

      <div className="help-text">
        The demo uses pre-generated face descriptors so you can preview how MediLink unlocks medical history in
        seconds. Connect a camera to run full biometric identification.
      </div>
    </div>
  );
}
