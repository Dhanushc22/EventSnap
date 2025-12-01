const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

console.log('📧 Nodemailer loaded:', typeof nodemailer);

// Create transporter - Try real email first, fallback to file-based
const createTransporter = async () => {
  console.log('🔧 Creating email transporter');
  
  try {
    // Try to use Gmail with app password from environment
    if (process.env.GMAIL_APP_PASSWORD) {
      console.log('✅ Using Gmail with app password');
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER || 'dhanushcs@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
    }
    
    // Try using environment variables if provided
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('✅ Using custom SMTP from environment');
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
    
    console.log('⚠️ No email credentials configured, using file-based storage');
    // Return a mock transporter that saves to file
    return {
      sendMail: async (mailOptions) => {
        const emailData = {
          timestamp: new Date().toISOString(),
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          message: 'Email would be sent here'
        };
        
        // Save to file for debugging
        const emailLogDir = path.join(__dirname, '../../emails');
        if (!fs.existsSync(emailLogDir)) {
          fs.mkdirSync(emailLogDir, { recursive: true });
        }
        
        const emailFile = path.join(emailLogDir, `email_${Date.now()}.json`);
        fs.writeFileSync(emailFile, JSON.stringify(emailData, null, 2));
        console.log('💾 Email saved to file:', emailFile);
        
        return { messageId: `mock_${Date.now()}@eventsnap.local` };
      }
    };
  } catch (error) {
    console.error('🔴 Error creating transporter:', error.message);
    throw error;
  }
};

// Send event credentials to host
const sendEventCredentials = async (hostEmail, eventData) => {
  try {
    console.log('📧 Creating transporter for email send');
    const transporter = await createTransporter();
    
    console.log('📧 Preparing email to:', hostEmail);
    const mailOptions = {
      from: 'noreply@eventsnap.com',
      to: hostEmail,
      subject: `Your EventSnap Event Access - ${eventData.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #2563eb; margin: 0; }
                .content { line-height: 1.6; color: #333; }
                .credentials { background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
                .credentials h3 { margin-top: 0; color: #2563eb; }
                .cred-item { margin: 10px 0; }
                .cred-label { font-weight: bold; color: #4b5563; }
                .cred-value { font-family: monospace; background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; }
                .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>EventSnap</h1>
                    <p>Your event has been created successfully!</p>
                </div>
                
                <div class="content">
                    <h2>Event Details</h2>
                    <p><strong>Event Name:</strong> ${eventData.title}</p>
                    <p><strong>Description:</strong> ${eventData.description}</p>
                    <p><strong>Date:</strong> ${new Date(eventData.date).toLocaleDateString()}</p>
                    
                    <div class="credentials">
                        <h3>Your Login Credentials</h3>
                        <div class="cred-item">
                            <span class="cred-label">Event ID:</span> 
                            <span class="cred-value">${eventData.eventId}</span>
                        </div>
                        <div class="cred-item">
                            <span class="cred-label">Password:</span> 
                            <span class="cred-value">${eventData.password}</span>
                        </div>
                    </div>
                    
                    <p>Use these credentials to log in as an Event Host and manage your event:</p>
                    
                    <a href="${process.env.FRONTEND_URL}/login" class="button">
                        Access Your Event
                    </a>
                    
                    <h3>What you can do:</h3>
                    <ul>
                        <li>View all photos uploaded to your event</li>
                        <li>Approve or reject photos</li>
                        <li>Manage event settings</li>
                        <li>Share your event QR code with participants</li>
                    </ul>
                    
                    <p><strong>Important:</strong> Keep these credentials secure. Anyone with this Event ID and password can access your event.</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated message from EventSnap. Please do not reply to this email.</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    // For development with ethereal email, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      } catch (previewErr) {
        console.log('⚠️ Could not generate preview URL');
      }
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // For authentication errors, log the credentials that should be sent
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.warn('⚠️ Email authentication failed');
      console.log('📧 EMAIL CREDENTIALS TO SEND (In Development Mode):');
      console.log(`📧 ===================================`);
      console.log(`📧 TO: ${hostEmail}`);
      console.log(`📧 EVENT ID: ${eventData.eventId}`);
      console.log(`📧 PASSWORD: ${eventData.password}`);
      console.log(`📧 EVENT NAME: ${eventData.title}`);
      console.log(`📧 ===================================`);
      console.warn('📧 Configure Gmail App Password in production for real email sending');
      
      return {
        success: true, // Event was created, email is just a notification
        error: 'Email service not configured',
        message: 'Event created successfully. Email service needs configuration for production.',
        credentials: {
          eventId: eventData.eventId,
          password: eventData.password,
          hostEmail: hostEmail
        }
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendEventCredentials
};