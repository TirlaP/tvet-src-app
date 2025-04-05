// netlify/functions/send-otp.js
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Log environment variables (without revealing sensitive info)
  console.log("EMAIL_USER configured:", !!process.env.EMAIL_USER);
  console.log("EMAIL_PASS configured:", !!process.env.EMAIL_PASS);

  try {
    // Parse request body
    const { email, otp } = JSON.parse(event.body);
    
    if (!email || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and OTP are required' })
      };
    }
    
    console.log(`Attempting to send OTP ${otp} to ${email}`);

    // Create reusable transporter with explicit settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'petru.tirla@gmail.com',
        pass: process.env.EMAIL_PASS || 'fyvi xynp lgfw iimz',
      },
      debug: true, // Enable debug output
      logger: true  // Log information to console
    });
    
    // Verify connection before sending
    await transporter.verify();
    console.log("SMTP connection verified successfully");
    
    // Send email
    const info = await transporter.sendMail({
      from: `"SRC Nomination System" <${process.env.EMAIL_USER || 'petru.tirla@gmail.com'}>`,
      to: email,
      subject: 'Your OTP for SRC Nomination System',
      text: `Your One-Time Password (OTP) is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">SRC Nomination System</h2>
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">You are receiving this email because you requested to log in to the SRC Nomination System.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; margin: 0;">Your One-Time Password (OTP) is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; margin: 10px 0; color: #007bff;">${otp}</h1>
            <p style="font-size: 14px; margin: 0;">This OTP will expire in 10 minutes.</p>
          </div>
          <p style="font-size: 16px;">If you did not request this OTP, please ignore this email.</p>
          <p style="font-size: 16px;">Thank you,<br>SRC Nomination System Team</p>
        </div>
      `
    });

    console.log(`Email sent successfully to ${email}`, info.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'OTP email sent successfully',
        messageId: info.messageId
      })
    };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send OTP email',
        details: error.message,
        stack: error.stack // Including stack trace for debugging
      })
    };
  }
};