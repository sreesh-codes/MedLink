# MediLink AI - Emergency Healthcare Resource Network

A comprehensive AI-powered emergency healthcare management system that connects patients with hospitals, manages medical resources, and provides intelligent allocation based on proximity, availability, and medical history.

## 🎯 Overview

MediLink AI is a full-stack application designed for emergency healthcare scenarios. It combines:
- **Biometric Face Recognition** for instant patient identification
- **AI-Powered Hospital Allocation** using proximity, bed availability, and doctor resources
- **Medical Jargon Translation** for patient-friendly communication
- **Real-time Hospital Mapping** with 15+ connected hospitals
- **Automated Workflow Integration** via N8N for donor alerts and notifications

## 🏗️ Technical Architecture

### Backend (FastAPI + PostgreSQL)
- **Framework**: FastAPI (Python 3.9+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI/ML**: 
  - Ollama for natural language processing (Llama 3.2)
  - NumPy for face descriptor matching (128-dimensional vectors)
  - Face-API.js models for biometric detection
- **External Services**:
  - N8N workflow automation (production webhook)
  - Langflow for AI flow configuration (optional)

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Libraries**:
  - Face-API.js for browser-based face detection
  - Leaflet/React-Leaflet for interactive maps
  - Axios for API communication
  - Lucide React for icons
- **Styling**: Custom CSS with modern medical SaaS design

## 📋 Prerequisites

- **Python 3.9+** with pip
- **Node.js 18+** and npm
- **PostgreSQL 14+** (optional, falls back to in-memory storage)
- **Ollama** (for AI features)
- **Docker** (optional, for N8N)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd medilink-simple
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Setup PostgreSQL
# Create .env file:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medilink
# Then run: bash init_db.sh
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Start Services

#### Option A: Automated Start (Recommended)
```bash
# From project root
bash start-all.sh
```

#### Option B: Manual Start
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### 5. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `backend/`:

```env
# Database (Optional)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medilink

# N8N (Production)
N8N_BASE_URL=https://n8n.srv1045021.hstgr.cloud

# Langflow (Optional)
LANGFLOW_API_KEY=your_api_key_here
```

### Flow Configuration Files

Place these JSON files in `backend/`:
- `Medical-nlp.json` - AI Assistant flow configuration
- `Jargon-translator.json` - Medical jargon translation flow
- `donor-alert.json` - N8N workflow configuration

## 📖 Usage Guide

### For Healthcare Providers

1. **Patient Identification**
   - Click "Start Face Scan" in Biometric Scanner
   - Allow camera access when prompted
   - Position face in center of frame
   - System automatically identifies patient and retrieves medical history

2. **Emergency Allocation**
   - Use AI Assistant chat: "Critical patient needs O+ blood"
   - System analyzes:
     - Patient location
     - Hospital proximity
     - ICU bed availability
     - Blood stock levels
     - Doctor availability
   - Best hospital is automatically allocated

3. **Medical History Sharing**
   - After allocation, medical history is automatically shared with hospital
   - View shared data in N8N Workflow component

### For Patients

1. **Register Your Face**
   - Click "Register My Face" in Biometric Scanner
   - Fill in medical history form
   - Capture face photo
   - System stores your biometric data for future identification

2. **Medical Jargon Translation**
   - Type complex medical terms in Jargon AI Translator
   - Get simplified explanations in plain language
   - Integrated into AI Assistant for automatic translation

### Demo Mode

Click "Run Demo" in Hero Section to see:
1. Emergency scenario simulation
2. Patient identification
3. Medical jargon translation
4. Hospital allocation
5. Medical history sharing

## 🔐 Security Features

### Backend Security
- ✅ **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
- ✅ **Input Validation**: Type checking and sanitization for all endpoints
- ✅ **CORS Configuration**: Restricted origins (localhost only in dev)
- ✅ **Error Handling**: Comprehensive try-catch blocks with fallbacks
- ✅ **Type Safety**: Pydantic models for request validation

### Frontend Security
- ✅ **XSS Protection**: React's built-in escaping, no dangerouslySetInnerHTML
- ✅ **Input Sanitization**: All user inputs validated before API calls
- ✅ **Error Boundaries**: Graceful error handling throughout
- ✅ **Secure API Calls**: Axios with timeout and error normalization

### Edge Cases Handled
- ✅ Empty/null inputs
- ✅ Invalid data types
- ✅ Database connection failures (fallback to in-memory)
- ✅ Missing face descriptors
- ✅ Network timeouts
- ✅ Camera access denied
- ✅ Invalid patient/hospital IDs

## 📁 Project Structure

```
medilink-simple/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── database.py             # PostgreSQL models and connection
│   ├── requirements.txt        # Python dependencies
│   ├── init_db.sh              # Database initialization script
│   ├── Medical-nlp.json        # AI Assistant flow config
│   ├── Jargon-translator.json  # Jargon translator flow config
│   └── donor-alert.json        # N8N workflow config
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── App.css             # Global styles
│   │   ├── main.jsx            # Entry point
│   │   ├── components/         # React components
│   │   │   ├── BiometricScanner.jsx
│   │   │   ├── HospitalMap.jsx
│   │   │   ├── FloatingChat.jsx
│   │   │   ├── JargonTranslator.jsx
│   │   │   ├── N8NWorkflow.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── FeaturesSection.jsx
│   │   │   ├── HowItWorksSection.jsx
│   │   │   └── Footer.jsx
│   │   └── services/
│   │       └── api.js          # API client
│   ├── package.json
│   └── vite.config.js
└── start-all.sh                # Automated startup script
```

## 🔌 API Endpoints

### Hospitals
- `GET /api/hospitals` - Get all hospitals

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients/identify` - Identify patient by face descriptor
  ```json
  {
    "face_descriptor": [128-dim array]
  }
  ```
- `POST /api/patients/register` - Register new patient
  ```json
  {
    "name": "John Doe",
    "age": 30,
    "blood_type": "O+",
    "medical_history": {...},
    "face_descriptor": [128-dim array]
  }
  ```

### Emergency
- `POST /api/emergency/allocate` - Allocate hospital for emergency
  ```json
  {
    "patient_id": "5",
    "latitude": 25.2048,
    "longitude": 55.2708,
    "severity": "critical"
  }
  ```
- `POST /api/emergency/share-medical-history` - Share medical history
  ```json
  {
    "patient_id": "5",
    "hospital_id": "1"
  }
  ```

### AI Assistant
- `POST /api/chat/query` - Send chat query
  ```json
  {
    "query": "Critical patient needs O+ blood"
  }
  ```

### Jargon Translation
- `POST /api/jargon/translate` - Translate medical jargon
  ```json
  {
    "text": "Patient in hemorrhagic shock"
  }
  ```

### N8N Workflow
- `POST /api/n8n/trigger` - Trigger N8N workflow
  ```json
  {
    "workflow_id": "donor-alert",
    "data": {...}
  }
  ```

## 🧪 Testing

### Manual Testing Checklist

1. **Patient Identification**
   - [ ] Face scan identifies registered patient
   - [ ] Medical history retrieved correctly
   - [ ] Demo patient (Ahmad Hassan) works in demo mode

2. **Hospital Allocation**
   - [ ] Allocates based on proximity
   - [ ] Considers bed availability
   - [ ] Considers blood stock
   - [ ] Recommends different hospitals for different scenarios

3. **Medical Jargon Translation**
   - [ ] Translates complex terms
   - [ ] Returns plain text (not JSON)
   - [ ] Auto-triggers in AI Assistant

4. **Error Handling**
   - [ ] Handles missing data gracefully
   - [ ] Shows user-friendly error messages
   - [ ] Falls back to legacy data if database unavailable

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed**
- Check PostgreSQL is running: `psql -U postgres -l`
- Verify DATABASE_URL in .env
- System will fall back to in-memory storage automatically

**Ollama Not Responding**
- Start Ollama: `ollama serve`
- Check if model is available: `ollama list`
- Pull model if needed: `ollama pull llama3.2:latest`

### Frontend Issues

**Camera Not Working**
- Check browser permissions
- Try "Test Camera" button first
- Use HTTPS in production (required for camera access)

**Face Detection Not Working**
- Ensure good lighting
- Position face in center
- Check browser console for errors
- Models load from CDN (may take time)

**API Calls Failing**
- Verify backend is running on port 8000
- Check CORS configuration
- Check browser console for errors

## 🔄 Deployment

### Production Checklist

1. **Backend**
   - [ ] Set `DATABASE_URL` environment variable
   - [ ] Restrict CORS origins to production domain
   - [ ] Use production-grade WSGI server (Gunicorn/Uvicorn workers)
   - [ ] Set up SSL/TLS certificates
   - [ ] Configure proper logging

2. **Frontend**
   - [ ] Update API base URL in `api.js`
   - [ ] Build production bundle: `npm run build`
   - [ ] Serve with HTTPS (required for camera access)
   - [ ] Configure proper caching headers

3. **Database**
   - [ ] Run migrations: `bash init_db.sh`
   - [ ] Set up database backups
   - [ ] Configure connection pooling

## 📊 Performance

- **Face Detection**: ~200-300ms per frame
- **Patient Identification**: ~50-100ms (database) or ~10ms (legacy)
- **Hospital Allocation**: ~100-200ms (includes scoring algorithm)
- **AI Query Response**: ~2-5s (depends on Ollama)

## 🤝 Contributing

1. Follow code style guidelines
2. Add error handling for all edge cases
3. Test thoroughly before submitting
4. Update documentation for new features

## 📄 License

Built for Jargon AI Hackathon 2024

## 🆘 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation at `/docs`
3. Check browser/backend console logs

---

**Built with ❤️ for Emergency Healthcare**

