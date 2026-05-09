# PerSoMedia-News-Web-Application

## Forgot password email setup

The password reset flow sends email through SendGrid. Add these environment variables in `backend/.env`:

```env
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=no-reply@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

If a user enters an email address that does not exist in the app, the API now returns a clear error instead of sending a reset email.