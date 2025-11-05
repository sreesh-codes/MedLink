import React from 'react';
import { Shield, Brain, LineChart, Share2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Biometric security',
    description: 'Face recognition with medical-history safeguards for rapid, accurate patient identification.',
  },
  {
    icon: Brain,
    title: 'AI-assisted triage',
    description: 'Langflow and Ollama workflows understand clinician intent and recommend best-fit hospitals.',
  },
  {
    icon: LineChart,
    title: 'Operational intelligence',
    description: 'Live ICU capacity, blood stock tracking, and trauma readiness across the hospital network.',
  },
  {
    icon: Share2,
    title: 'Automated coordination',
    description: 'One-click medical history sharing through N8N workflows keeps emergency teams in sync.',
  },
];

export default function FeaturesSection({ onBackToDashboard }) {
  return (
    <section className="content-section">
      <div className="content-header">
        <h2>Why emergency teams choose MediLink AI</h2>
        <p>
          The platform combines trusted medical data, AI reasoning, and workflow automation to compress the
          golden hour and deliver better outcomes.
        </p>
      </div>

      <div className="feature-grid">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <article key={title} className="feature-card">
            <div className="feature-icon">
              <Icon size={22} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <div className="section-actions">
        <button type="button" className="secondary-button" onClick={() => onBackToDashboard?.()}>
          Back to dashboard
        </button>
      </div>
    </section>
  );
}
