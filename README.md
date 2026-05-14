# PerSoMedia News Web Application (PerSoMedia News)

A modern, full-stack news aggregation and analysis platform with fake news detection capabilities. Built with React, Flask and MongoDB.

## 🚀 Features

- **News Aggregation** — Fetch and display news articles from multiple sources
- **User Authentication** — Secure registration and login with session persistence
- **Fake News Detection** — AI-powered detection system to identify misinformation
- **Analytics Dashboard** — Track user engagement and platform analytics
- **Personalized Experience** — Save favorites, watch later, and manage preferences
- **Notifications System** — Real-time notifications for important updates
- **Responsive Design** — Mobile-friendly interface with Tailwind CSS

## 📋 Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

**Backend:**
- Flask with SQLAlchemy
- MongoDB for data storage
- Flask-JWT-Extended for authentication
- SendGrid for email notifications

## 🛠️ Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- MongoDB instance running
- SendGrid API key (for password reset emails)

## 📦 Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file in `backend/` directory with the following environment variables:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-super-secret-key-change-this

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/persomedia?appName=persomedia

# JWT Authentication
JWT_SECRET_KEY=your-jwt-secret-key-change-this

# External APIs
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
OPENAI_API_KEY=sk-proj-your-openai-api-key
YOUTUBE_API_KEY=your-youtube-api-key
NEWS_API_KEY=your-news-api-key

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Environment Variables Guide:**
- `SECRET_KEY` — Flask secret key for session management (generate a random string)
- `MONGO_URI` — MongoDB connection string with credentials
- `JWT_SECRET_KEY` — Secret key for JWT token generation
- `GOOGLE_CLIENT_ID` — OAuth 2.0 client ID from Google Cloud Console
- `OPENAI_API_KEY` — API key from OpenAI for fake news detection
- `YOUTUBE_API_KEY` — YouTube API key for video data
- `NEWS_API_KEY` — News API key for fetching articles
- `SENDGRID_API_KEY` — SendGrid API key for sending emails
- `SENDGRID_FROM_EMAIL` — Sender email address for password reset emails
- `FRONTEND_URL` — Frontend application URL for email links

5. Run the backend server:
```bash
python run.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## � Security & Environment Variables

**⚠️ Important:** Never commit `.env` files to version control. Ensure `.env` is in your `.gitignore`.

### Getting API Keys

- **Google OAuth**: https://console.cloud.google.com/
- **OpenAI API**: https://platform.openai.com/api-keys
- **YouTube API**: https://console.cloud.google.com/apis/
- **News API**: https://newsapi.org/register
- **SendGrid**: https://sendgrid.com/free/

## �📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration & extensions
│   │   ├── modules/        # Feature modules
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   ├── fake_detection/
│   │   │   ├── interactions/
│   │   │   ├── news/
│   │   │   ├── notifications/
│   │   │   └── system/
│   │   └── uploads/        # User-uploaded files
│   ├── test/               # Test suites
│   └── run.py             # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── routes/         # Route definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
```

## 🔑 Key Features Explained

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Session persistence
- Password reset via email

### Fake Detection
- Machine learning-based fake news detection
- Real-time analysis of articles
- Confidence scoring

### Analytics
- Track user engagement metrics
- Monitor platform usage
- Generate insights

### News Management
- Browse news by categories
- Save favorites
- Watch later functionality
- Search and filter

## 🧪 Testing

Run the test suite:
```bash
cd backend
python -m pytest test/
```

Tests cover:
- Authentication flows
- Fake detection accuracy
- Analytics tracking
- API endpoints

## 📧 Email Configuration (SendGrid)

The password reset feature sends emails through SendGrid. Make sure to:

1. Sign up for SendGrid at https://sendgrid.com
2. Create an API key
3. Add to `.env` as shown in Backend Setup
4. Verify sender email in SendGrid

**Note:** If a user enters an email that doesn't exist, the API returns a clear error instead of sending a reset email.

## 🚀 Deployment

### Backend Deployment
- Update `.env` with production database URL
- Set `FLASK_ENV=production`
- Use a production WSGI server (Gunicorn, uWSGI)

### Frontend Deployment
- Build for production: `npm run build`
- Deploy the `dist/` folder to your hosting service
- Update API URL to production backend

## 📝 API Endpoints

Key endpoints include:
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User login
- `GET /api/news` — Fetch news articles
- `POST /api/fake-detection/analyze` — Analyze news for authenticity
- `GET /api/analytics` — Get analytics data
- `POST /api/notifications` — Create notifications

## 🤝 Contributing

1. Create a new branch for features/fixes
2. Make your changes
3. Write tests for new functionality
4. Submit a pull request

## � Author

**S D Hasitha Anjana Gnanarathna**  
University of Plymouth
