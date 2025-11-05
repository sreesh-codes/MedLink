import React from 'react';
import { Camera, MapPin, Stethoscope, Share } from 'lucide-react';

const STEPS = [
  {
    icon: Camera,
    title: '1. Identify patient',
    description: 'Capture facial biometrics and match against secure records to unlock medical history instantly.',
  },
  {
    icon: Stethoscope,
    title: '2. Understand clinical need',
    description: 'AI agent analyses the scenario, extracts vitals, blood type and urgency directly from the request.',
  },
  {
    icon: MapPin,
    title: '3. Allocate resources',
    description: 'Hospitals are ranked on proximity, ICU capacity, trauma readiness and blood availability in real time.',
  },
  {
    icon: Share,
    title: '4. Synchronise care teams',
    description: 'N8N workflows notify donors and hospitals, and share critical medical history with one click.',
  },
];

export default function HowItWorksSection({ onBackToDashboard }) {
  return (
    <section className="content-section">
      <div className="content-header">
        <h2>How MediLink AI orchestrates emergency care</h2>
        <p>
          A seamless flow from scene to treatment, designed alongside emergency physicians and trauma nurses.
        </p>
      </div>

      <ol className="steps-list">
        {STEPS.map(({ icon: Icon, title, description }) => (
          <li key={title} className="step-card">
            <div className="step-icon">
              <Icon size={22} />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="section-actions">
        <button type="button" className="secondary-button" onClick={() => onBackToDashboard?.()}>
          Back to dashboard
        </button>
      </div>
    </section>
  );
}
