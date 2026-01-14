# Email Verification Setup

## Configuration
To enable email verification, you need to add the following variables to your `.env` file.

### Option 1: Gmail (Recommended for development)
If you are using Gmail, you likely need a **Google App Password**.
1. Go to [Google Account Security](https://myaccount.google.com/security).
2. Enable 2-Step Verification if not enabled.
3. Go to [App Passwords](https://myaccount.google.com/apppasswords).
4. Create a new app password (e.g. named "LifeOS").
5. Use that 16-character password below.

```env
EMAIL_SERVICE=gmail
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password-here
EMAIL_FROM=no-reply@lifeos.app
NEXTAUTH_URL=http://localhost:3000
```

### Option 2: Generic SMTP
For providers like SendGrid, Mailgun, AWS SES, etc.

```env
# EMAIL_SERVICE should be commented out or empty
# EMAIL_SERVICE=
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-username
EMAIL_SERVER_PASSWORD=your-password
EMAIL_SERVER_SECURE=false
EMAIL_FROM=no-reply@lifeos.app
NEXTAUTH_URL=http://localhost:3000
```

## How it works
1. **Registration**: User signs up. A verification token is generated giving them a 24-hour window. An email is sent via the configured transporter.
2. **Access**: User cannot log in until they click the link in the email.
3. **Verification**: Clicking the link verifies the email in the database and cleans up the token.
