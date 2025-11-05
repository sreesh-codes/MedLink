import React from 'react';
import { Activity, Heart, Users, PlayCircle } from 'lucide-react';

const formatter = new Intl.NumberFormat('en-US');

export default function HeroSection({
  hospitals = [],
  totalICUBeds = 0,
  totalBloodUnits = 0,
  onRunDemo,
  demoRunning = false,
}) {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h2>Coordinated emergency response in under a minute</h2>
          <p>
            MediLink AI unifies biometric identification, hospital resource tracking, and AI-driven
            workflows to accelerate critical care decisions when every second matters.
          </p>

          <button
            className="demo-button"
            type="button"
            onClick={() => onRunDemo?.()}
            disabled={demoRunning}
          >
            <PlayCircle size={18} />
            {demoRunning ? 'Running Demo...' : 'Run 60s Live Demo'}
          </button>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Activity className="stat-icon" size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatter.format(hospitals.length)}</div>
              <div className="stat-label">Connected Hospitals</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Users className="stat-icon" size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatter.format(totalICUBeds)}</div>
              <div className="stat-label">ICU Beds Available</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Heart className="stat-icon" size={22} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatter.format(totalBloodUnits)}</div>
              <div className="stat-label">Units of Blood Ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
