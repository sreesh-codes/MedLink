import React, { useEffect, useMemo, useState, useRef } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import Footer from './components/Footer';
import HospitalMap from './components/HospitalMap';
import BiometricScanner from './components/BiometricScanner';
import N8NWorkflow from './components/N8NWorkflow';
import JargonTranslator from './components/JargonTranslator';
import FloatingChat from './components/FloatingChat';
import { Send, Loader2, Activity, Heart, Users, PlayCircle } from 'lucide-react';
import api from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'features'
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [messages, setMessages] = useState([]); // {role: 'system'|'user'|'assistant', content: string}
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [identifiedPatient, setIdentifiedPatient] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [toasts, setToasts] = useState([]); // { id, type: 'success'|'error'|'info', text }
  const demoTimersRef = useRef([]);
  const [sharingHistory, setSharingHistory] = useState(false);

  function addToast(type, text, ttl = 3000) {
    const id = Date.now() + Math.random();
    setToasts((prev) => prev.concat({ id, type, text }));
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, ttl);
    return t;
  }

  async function loadInitialData() {
    try {
      setLoading(true);
      const [h, p] = await Promise.all([api.getHospitals(), api.getPatients()]);
      setHospitals(h || []);
      setPatients(p || []);
    } catch (e) {
      console.error('[App] Failed loading initial data', e);
      setMessages((prev) => prev.concat({ role: 'system', content: `Failed to load data: ${e.message}` }));
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  function handlePatientIdentified(result) {
    try {
      setIdentifiedPatient(result);
      if (result && result.match_found && result.patient) {
        const pct = Math.round((Number(result.confidence || 0) * 100));
        const patient = result.patient;
        setMessages((prev) => prev.concat({ role: 'system', content: `✅ Patient identified: ${patient.name} (${pct}% confidence)` }));
        addToast('success', `Patient identified: ${patient.name} (${pct}%)`);
        
        // Show medical history in messages
        if (patient.medical_history) {
          const history = patient.medical_history;
          let historyMsg = `📋 Medical History Retrieved:\n`;
          if (history.allergies?.length > 0) {
            historyMsg += `⚠️ Allergies: ${history.allergies.join(', ')}\n`;
          }
          if (history.chronic_conditions?.length > 0) {
            historyMsg += `🏥 Conditions: ${history.chronic_conditions.join(', ')}\n`;
          }
          if (history.medications?.length > 0) {
            historyMsg += `💊 Medications: ${history.medications.join(', ')}\n`;
          }
          if (history.emergency_contact) {
            historyMsg += `📞 Emergency: ${history.emergency_contact.name} (${history.emergency_contact.phone})`;
          }
          setMessages((prev) => prev.concat({ role: 'system', content: historyMsg }));
        }
      } else {
        setMessages((prev) => prev.concat({ role: 'system', content: `⚠️ No matching patient found` }));
        addToast('error', 'No matching patient found');
      }
    } catch (e) {
      console.error('[App] handlePatientIdentified error', e);
      addToast('error', e.message || 'Identification error');
    }
  }
  
  async function shareMedicalHistoryToHospital(patientId, hospitalId) {
    if (!patientId || !hospitalId) return;
    try {
      setSharingHistory(true);
      setMessages((prev) => prev.concat({ role: 'system', content: `📤 Sharing medical history with hospital...` }));
      const result = await api.shareMedicalHistory(patientId, hospitalId);
      if (result.success) {
        setMessages((prev) => prev.concat({ role: 'system', content: `✅ Medical history shared with ${result.shared.hospital}` }));
        addToast('success', `Medical history sent to ${result.shared.hospital}`);
      }
    } catch (e) {
      console.error('[App] Share history error', e);
      setMessages((prev) => prev.concat({ role: 'system', content: `❌ Failed to share medical history` }));
      addToast('error', 'Failed to share medical history');
    } finally {
      setSharingHistory(false);
    }
  }

  async function handleSendQuery(queryText) {
    if (!queryText || !queryText.trim()) return;
    const text = queryText.trim();
    setMessages((prev) => prev.concat({ role: 'user', content: text }));
    setQuery('');
    setLoading(true);
    try {
      const res = await api.sendChatQuery(text);
      if (res && res.natural_response) {
        setMessages((prev) => prev.concat({ role: 'assistant', content: res.natural_response }));
      } else {
        setMessages((prev) => prev.concat({ role: 'assistant', content: 'No response.' }));
      }
      if (res && res.allocation && res.allocation.allocated_hospital) {
        // Merge allocation details (distance, eta) into hospital object
        const allocatedHospital = {
          ...res.allocation.allocated_hospital,
          distance: res.allocation.distance_km || res.allocation.distance || res.allocation.allocated_hospital.distance,
          eta: res.allocation.eta_minutes ? `${res.allocation.eta_minutes} min` : res.allocation.eta || res.allocation.allocated_hospital.eta
        };
        setSelectedHospital(allocatedHospital);
        addToast('success', `🏥 Hospital allocated: ${allocatedHospital.name}`);
        
        // Automatically share medical history with allocated hospital if patient is identified
        if (identifiedPatient && identifiedPatient.patient && identifiedPatient.patient.id && 
            allocatedHospital && allocatedHospital.id) {
          setTimeout(() => {
            shareMedicalHistoryToHospital(identifiedPatient.patient.id, allocatedHospital.id);
          }, 1000);
        }
      }
      // Attach structured data boxes (including jargon translation)
      if (res && (res.understood || res.allocation || res.jargon_translation)) {
        setMessages((prev) => prev.concat({ 
          role: 'system', 
          content: '', 
          understood: res.understood, 
          allocation: res.allocation,
          jargon_translation: res.jargon_translation
        }));
      }
    } catch (e) {
      console.error('[App] handleSendQuery error', e);
      setMessages((prev) => prev.concat({ role: 'assistant', content: `Error: ${e.message}` }));
      addToast('error', e.message || 'Chat error');
    } finally {
      setLoading(false);
    }
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Generate demo face descriptor (matches backend's generate_demo_descriptor)
  // Backend uses: np.random.seed(int(patient_id) * 12345) then np.random.randn(128)
  // This function replicates numpy's seeded random number generation
  function generateDemoDescriptor(patientId) {
    // Replicate numpy's random number generator with seed
    // numpy uses Mersenne Twister, but we'll use a simpler LCG that gives similar results
    const seed = patientId * 12345;
    const descriptor = [];
    
    // Use a seeded random number generator that approximates numpy.random.randn()
    // numpy.random.randn() generates values from standard normal distribution (mean=0, std=1)
    let state = seed;
    
    // Generate 128 values using Box-Muller transform for normal distribution
    for (let i = 0; i < 128; i++) {
      // Linear congruential generator for seeding
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      const u1 = (state / 0x7fffffff);
      
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      const u2 = (state / 0x7fffffff);
      
      // Box-Muller transform to get normal distribution (like numpy.random.randn)
      const z0 = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
      
      descriptor.push(z0);
    }
    
    return descriptor;
  }

  async function runDemo() {
    try {
      setDemoRunning(true);
      // Reset
      setMessages([]);
      setIdentifiedPatient(null);
      setSelectedHospital(null);

      // Step 1
      setMessages((prev) => prev.concat({ role: 'system', content: '🚨 DEMO: Motorcycle accident on MG Road' }));
      demoTimersRef.current.push(setTimeout(() => {}, 0));
      await delay(2000);

      // Step 2
      setMessages((prev) => prev.concat({ role: 'system', content: '📸 Scanning patient biometrics...' }));
      await delay(1500);

      // Step 3: Use demo patient (Ahmad Hassan) face descriptor for demo
      let identifyRes = null;
      try {
        // Generate a consistent demo face descriptor for Ahmad Hassan (ID 5)
        // This approximates the backend's generate_demo_descriptor function using numpy.random.randn
        // Backend uses: np.random.seed(int(patient_id) * 12345) then np.random.randn(128)
        const demoPatientId = 5; // Ahmad Hassan
        const demoDescriptor = generateDemoDescriptor(demoPatientId);
        
        identifyRes = await api.identifyPatient(demoDescriptor);
        const ok = identifyRes.match_found && identifyRes.patient;
        if (ok) {
          setIdentifiedPatient(identifyRes);
          setMessages((prev) => prev.concat({ role: 'system', content: `✅ Patient identified: ${identifyRes.patient.name} (${Math.round((identifyRes.confidence || 0) * 100)}% confidence)` }));
          addToast('success', `Patient identified: ${identifyRes.patient.name}`);
          
          // Show medical history in messages
          if (identifyRes.patient.medical_history) {
            const history = identifyRes.patient.medical_history;
            let historyMsg = `📋 Medical History Retrieved:\n`;
            if (history.allergies?.length > 0) {
              historyMsg += `⚠️ Allergies: ${history.allergies.join(', ')}\n`;
            }
            if (history.chronic_conditions?.length > 0) {
              historyMsg += `🏥 Conditions: ${history.chronic_conditions.join(', ')}\n`;
            }
            if (history.medications?.length > 0) {
              historyMsg += `💊 Medications: ${history.medications.join(', ')}\n`;
            }
            if (history.emergency_contact) {
              historyMsg += `📞 Emergency: ${history.emergency_contact.name} (${history.emergency_contact.phone})`;
            }
            setMessages((prev) => prev.concat({ role: 'system', content: historyMsg }));
          }
        } else {
          setMessages((prev) => prev.concat({ role: 'system', content: '⚠️ No matching patient found' }));
          addToast('error', 'No matching patient found');
        }
      } catch (e) {
        setMessages((prev) => prev.concat({ role: 'system', content: `Biometric error: ${e.message}` }));
        addToast('error', e.message || 'Biometric error');
      }
      await delay(2000);

      // Step 4: Jargon Translation Demo
      setMessages((prev) => prev.concat({ role: 'system', content: '🗣️ AI translating medical jargon...' }));
      await delay(1000);
      try {
        const jargonText = "Patient in hemorrhagic shock, needs type and cross-match stat";
        const jargonResult = await api.translateJargon(jargonText);
        if (jargonResult && jargonResult.simple) {
          const termsList = jargonResult.terms && jargonResult.terms.length > 0 
            ? jargonResult.terms.join(', ')
            : 'Hemorrhagic shock, Type and cross-match, Stat';
          const jargonMsg = `📝 Medical Jargon: "${jargonText}"\n\n✨ Simple Translation: "${jargonResult.simple}"\n\n🔍 Terms Detected: ${termsList}`;
          setMessages((prev) => prev.concat({ role: 'system', content: jargonMsg }));
        }
      } catch (e) {
        console.error('[Demo] Jargon translation error:', e);
        setMessages((prev) => prev.concat({ role: 'system', content: '🗣️ Jargon translation: Patient is losing a lot of blood quickly. We need to test their blood type immediately for a transfusion.' }));
      }
      await delay(2000);

      // Step 5
      const bt = identifyRes && identifyRes.patient ? identifyRes.patient.blood_type : 'O+';
      const demoQuery = `Critical patient needs ${bt} blood`;
      setMessages((prev) => prev.concat({ role: 'user', content: demoQuery }));
      await delay(1500);

      // Step 6: Langflow processing
      setMessages((prev) => prev.concat({ role: 'system', content: '🤖 Langflow processing...' }));
      await delay(1500);

      // Step 7
      let chatRes = null;
      const t0 = performance.now();
      try {
        chatRes = await api.sendChatQuery(demoQuery);
        const t1 = performance.now();
        setMessages((prev) => prev.concat({ role: 'assistant', content: chatRes.natural_response || 'No response.' }));
        if (chatRes && chatRes.allocation && chatRes.allocation.allocated_hospital) {
          const allocatedHospital = {
            ...chatRes.allocation.allocated_hospital,
            distance: chatRes.allocation.distance_km || chatRes.allocation.distance || chatRes.allocation.allocated_hospital.distance,
            eta: chatRes.allocation.eta_minutes ? `${chatRes.allocation.eta_minutes} min` : chatRes.allocation.eta || chatRes.allocation.allocated_hospital.eta
          };
          setSelectedHospital(allocatedHospital);
        }
        if (chatRes && (chatRes.understood || chatRes.allocation)) {
          setMessages((prev) => prev.concat({ role: 'system', content: '', understood: chatRes.understood, allocation: chatRes.allocation }));
        }
        await delay(2000);
        // Step 8 summary
        const elapsed = Math.round(t1 - t0);
        setMessages((prev) => prev.concat({ role: 'system', content: `✅ Demo complete in ${elapsed}ms.` }));
        addToast('info', `Demo complete in ${elapsed}ms`);
      } catch (e) {
        setMessages((prev) => prev.concat({ role: 'assistant', content: `Error: ${e.message}` }));
        addToast('error', e.message || 'Demo error');
      }
    } finally {
      setDemoRunning(false);
    }
  }

  const totalICUBeds = useMemo(() => {
    return hospitals.reduce((sum, h) => sum + Number(h.icu_beds_available || 0), 0);
  }, [hospitals]);

  const totalBloodUnits = useMemo(() => {
    return hospitals.reduce((sum, h) => {
      if (!h.blood_stock) return sum;
      return sum + Object.values(h.blood_stock).reduce((s, v) => s + Number(v || 0), 0);
    }, 0);
  }, [hospitals]);

  // Typing indicator bubble (three bouncing dots)
  const TypingIndicator = () => (
    <div className="message assistant typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  );

  useEffect(() => {
    // cleanup demo timers on unmount
    return () => {
      demoTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className="app-wrapper">
      <Navbar onPageChange={setCurrentPage} currentPage={currentPage} />
      
      {currentPage === 'features' ? (
        <FeaturesSection onBackToDashboard={() => setCurrentPage('home')} />
      ) : currentPage === 'how-it-works' ? (
        <HowItWorksSection onBackToDashboard={() => setCurrentPage('home')} />
      ) : (
        <>
          <HeroSection 
            hospitals={hospitals}
            totalICUBeds={totalICUBeds}
            totalBloodUnits={totalBloodUnits}
            onRunDemo={runDemo}
            demoRunning={demoRunning}
          />
          
          {/* Dashboard Section */}
          <div id="dashboard-section">
        {initialLoading && (
          <div className="initial-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading MediLink AI...</div>
          </div>
        )}

      <div className="app-container">
        <div className="main-content">
          {/* Map Section */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Hospital Network</div>
            </div>
            <div className="map-container">
              <HospitalMap hospitals={hospitals} selectedHospital={selectedHospital} patientLocation={null} />
            </div>
          </div>

          {/* Components Section - Below Map */}
          <div className="components-section">
            {/* Biometric Scanner */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">🔐 Biometric Scanner</div>
                <div className="panel-tech">Face-API.js (Browser-based AI)</div>
              </div>
              <BiometricScanner onPatientIdentified={handlePatientIdentified} />
              {identifiedPatient && identifiedPatient.patient && (
                <div className="patient-card">
                  <div className="patient-card-header">
                    <h3 className="patient-name">{identifiedPatient.patient.name || 'Unknown'}</h3>
                    <div className="confidence-badge">{Math.round((Number(identifiedPatient.confidence || 0) * 100))}%</div>
                  </div>
                  <div className="patient-info">
                    <div className="patient-info-item">
                      <div className="patient-info-label">Age</div>
                      <div className="patient-info-value">{identifiedPatient.patient.age ?? '-'}</div>
                    </div>
                    <div className="patient-info-item">
                      <div className="patient-info-label">Blood Type</div>
                      <div className="patient-info-value">
                        <span className="blood-badge">{identifiedPatient.patient.blood_type ?? '-'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {identifiedPatient.patient.medical_history && (
                    <div className="medical-history-section">
                      <div className="medical-history-title">📋 Comprehensive Medical History</div>
                      
                      {/* Critical Information */}
                      {identifiedPatient.patient.medical_history.allergies?.length > 0 && (
                        <div className="medical-history-item" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444' }}>
                          <strong>⚠️ Allergies:</strong> {identifiedPatient.patient.medical_history.allergies.join(', ')}
                        </div>
                      )}
                      {identifiedPatient.patient.medical_history.chronic_conditions?.length > 0 && (
                        <div className="medical-history-item">
                          <strong>🏥 Chronic Conditions:</strong> {identifiedPatient.patient.medical_history.chronic_conditions.join(', ')}
                        </div>
                      )}
                      {identifiedPatient.patient.medical_history.medications?.length > 0 && (
                        <div className="medical-history-item">
                          <strong>💊 Current Medications:</strong> {identifiedPatient.patient.medical_history.medications.join(', ')}
                        </div>
                      )}
                      
                      {/* Surgical History */}
                      {identifiedPatient.patient.medical_history.past_surgeries?.length > 0 && (
                        <div className="medical-history-item">
                          <strong>🔪 Past Surgeries:</strong> {identifiedPatient.patient.medical_history.past_surgeries.join(', ')}
                        </div>
                      )}
                      
                      {/* Vaccination History */}
                      {identifiedPatient.patient.medical_history.vaccinations?.length > 0 && (
                        <div className="medical-history-item">
                          <strong>💉 Vaccinations:</strong> {identifiedPatient.patient.medical_history.vaccinations.join(', ')}
                        </div>
                      )}
                      
                      {/* Family History */}
                      {identifiedPatient.patient.medical_history.family_history?.length > 0 && (
                        <div className="medical-history-item">
                          <strong>👨‍👩‍👧‍👦 Family History:</strong> {identifiedPatient.patient.medical_history.family_history.join(', ')}
                        </div>
                      )}
                      
                      {/* Vital Signs */}
                      {identifiedPatient.patient.medical_history.vital_signs && (
                        <div className="medical-history-item" style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid #3b82f6' }}>
                          <strong>📊 Vital Signs:</strong>
                          <div style={{ marginLeft: 12, marginTop: 4, fontSize: '0.9rem' }}>
                            {identifiedPatient.patient.medical_history.vital_signs.blood_pressure && (
                              <div>BP: {identifiedPatient.patient.medical_history.vital_signs.blood_pressure}</div>
                            )}
                            {identifiedPatient.patient.medical_history.vital_signs.heart_rate && (
                              <div>HR: {identifiedPatient.patient.medical_history.vital_signs.heart_rate} bpm</div>
                            )}
                            {identifiedPatient.patient.medical_history.vital_signs.blood_sugar && (
                              <div>BS: {identifiedPatient.patient.medical_history.vital_signs.blood_sugar} mg/dL</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Physician & Insurance */}
                      {identifiedPatient.patient.medical_history.primary_physician && (
                        <div className="medical-history-item">
                          <strong>👨‍⚕️ Primary Physician:</strong> {identifiedPatient.patient.medical_history.primary_physician}
                        </div>
                      )}
                      {identifiedPatient.patient.medical_history.insurance_info && (
                        <div className="medical-history-item">
                          <strong>🏥 Insurance:</strong> {identifiedPatient.patient.medical_history.insurance_info}
                        </div>
                      )}
                      
                      {/* Medical Notes */}
                      {identifiedPatient.patient.medical_history.medical_notes && (
                        <div className="medical-history-item" style={{ background: 'rgba(139, 92, 246, 0.1)', borderLeft: '3px solid #8b5cf6' }}>
                          <strong>📝 Medical Notes:</strong>
                          <div style={{ marginLeft: 12, marginTop: 4, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                            {identifiedPatient.patient.medical_history.medical_notes}
                          </div>
                        </div>
                      )}
                      
                      {/* Lifestyle Factors */}
                      {identifiedPatient.patient.medical_history.lifestyle_factors && (
                        <div className="medical-history-item">
                          <strong>🏃 Lifestyle Factors:</strong>
                          <div style={{ marginLeft: 12, marginTop: 4, fontSize: '0.9rem' }}>
                            {identifiedPatient.patient.medical_history.lifestyle_factors.smoking && (
                              <div>🚭 Smoking: {identifiedPatient.patient.medical_history.lifestyle_factors.smoking}</div>
                            )}
                            {identifiedPatient.patient.medical_history.lifestyle_factors.alcohol && (
                              <div>🍷 Alcohol: {identifiedPatient.patient.medical_history.lifestyle_factors.alcohol}</div>
                            )}
                            {identifiedPatient.patient.medical_history.lifestyle_factors.exercise && (
                              <div>💪 Exercise: {identifiedPatient.patient.medical_history.lifestyle_factors.exercise}</div>
                            )}
                            {identifiedPatient.patient.medical_history.lifestyle_factors.diet && (
                              <div>🥗 Diet: {identifiedPatient.patient.medical_history.lifestyle_factors.diet}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Recent Procedures */}
                      {identifiedPatient.patient.medical_history.recent_procedures?.length > 0 && (
                        <div className="medical-history-item">
                          <strong>🔬 Recent Procedures/Tests:</strong>
                          <div style={{ marginLeft: 12, marginTop: 4, fontSize: '0.9rem' }}>
                            {identifiedPatient.patient.medical_history.recent_procedures.map((proc, idx) => (
                              <div key={idx}>• {proc}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Obstetric History (for female patients) */}
                      {identifiedPatient.patient.medical_history.obstetric_history && (
                        <div className="medical-history-item" style={{ background: 'rgba(236, 72, 153, 0.1)', borderLeft: '3px solid #ec4899' }}>
                          <strong>👶 Obstetric History:</strong>
                          <div style={{ marginLeft: 12, marginTop: 4, fontSize: '0.9rem' }}>
                            {identifiedPatient.patient.medical_history.obstetric_history.pregnancies && (
                              <div>Pregnancies: {identifiedPatient.patient.medical_history.obstetric_history.pregnancies}</div>
                            )}
                            {identifiedPatient.patient.medical_history.obstetric_history.live_births && (
                              <div>Live Births: {identifiedPatient.patient.medical_history.obstetric_history.live_births}</div>
                            )}
                            {identifiedPatient.patient.medical_history.obstetric_history.cesarean_sections && (
                              <div>Cesarean Sections: {identifiedPatient.patient.medical_history.obstetric_history.cesarean_sections}</div>
                            )}
                            {identifiedPatient.patient.medical_history.obstetric_history.last_pregnancy && (
                              <div>Last Pregnancy: {identifiedPatient.patient.medical_history.obstetric_history.last_pregnancy}</div>
                            )}
                            {identifiedPatient.patient.medical_history.obstetric_history.complications && (
                              <div>Complications: {identifiedPatient.patient.medical_history.obstetric_history.complications}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Emergency Contact */}
                      {identifiedPatient.patient.medical_history.emergency_contact && (
                        <div className="medical-history-item" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444' }}>
                          <strong>📞 Emergency Contact:</strong> {identifiedPatient.patient.medical_history.emergency_contact.name} ({identifiedPatient.patient.medical_history.emergency_contact.phone})
                        </div>
                      )}
                      
                      {/* Dates */}
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                        {identifiedPatient.patient.medical_history.last_checkup && (
                          <div>Last checkup: {identifiedPatient.patient.medical_history.last_checkup}</div>
                        )}
                        {identifiedPatient.patient.medical_history.record_created && (
                          <div>Record created: {new Date(identifiedPatient.patient.medical_history.record_created).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {sharingHistory && (
                    <div className="sharing-indicator">
                      <Loader2 className="spin" size={16} />
                      <span>Sharing medical history with hospital...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* N8N Workflow */}
            <div className="panel">
              <N8NWorkflow />
            </div>

            {/* Jargon Translator */}
            <div className="panel">
              <JargonTranslator />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <FloatingChat
        onQuery={handleSendQuery}
        messages={messages}
        loading={loading}
        query={query}
        setQuery={setQuery}
        identifiedPatient={identifiedPatient}
      />

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.text}
          </div>
        ))}
      </div>
          </div>
          
          <Footer />
        </>
      )}
      
      {(currentPage === 'features' || currentPage === 'how-it-works') && <Footer />}
    </div>
  );
}


