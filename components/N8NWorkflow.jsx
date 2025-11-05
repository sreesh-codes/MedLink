import React, { useState } from 'react';
import { Network, Send } from 'lucide-react';

const SAMPLE_LOG = {
  donors_notified: 3,
  donors: [
    { name: 'Ahmed', distance: 2.3, blood_type: 'O+' },
    { name: 'Sara', distance: 4.1, blood_type: 'O+' },
    { name: 'John', distance: 5.8, blood_type: 'O+' },
  ],
  hospitals_notified: ['Rashid Hospital', 'Dubai Hospital'],
};

export default function N8NWorkflow() {
  const [log, setLog] = useState(null);

  function handleSimulate() {
    setLog({
      timestamp: new Date().toISOString(),
      payload: SAMPLE_LOG,
    });
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Network size={20} />
          N8N Workflow Monitor
        </div>
        <div className="panel-tech">Webhook simulation</div>
      </div>

      <div className="workflow-body">
        <p>
          Track automated donor and hospital notifications triggered through the N8N workflows. In
          production this panel would display live webhook events.
        </p>

        <button type="button" className="secondary-button" onClick={handleSimulate}>
          <Send size={16} /> Simulate donor alert
        </button>

        {log && (
          <div className="workflow-log">
            <div className="workflow-meta">Last webhook: {new Date(log.timestamp).toLocaleString()}</div>
            <pre>{JSON.stringify(log.payload, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
