// src/services/email.service.ts
import * as nodemailer from 'nodemailer';
// import * as ejs from 'ejs';
import * as dotenv from 'dotenv';
// import templateRenderer from '../utils/templateRenderer';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class EmailService {
  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, verificationCode: string) {
    const subject = 'Email Verification Code';
    // const html = templateRenderer.renderTemplate('verificationEmail.html', {
    //   verificationCode,
    // });
    const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Email Verification Code</title>
                </head>
                <body>
                    <h1>Email Verification Code</h1>
                    <p>Your verification code is: <strong>${verificationCode}</strong> and will expire in 10min</p>
                    <p>Please enter this code in the verification form to complete your registration.</p>
                </body>
                </html>
        `;
    const text = `Your verification code is: ${verificationCode}`;
    return this.sendEmail(to, subject, text, html);
  }

  async sendWelcomeEmail(to: string, username: string, actionUrl: string) {
    const subject = 'Welcome to Our Platform!';
    // const html = templateRenderer.renderTemplate('welcomeEmail.html', {
    //   username,
    //   actionUrl,
    // });

    const html = `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            color: #555555;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Our Platform!</h1>
        <p>Hi ${username},</p>
        <p>We're excited to have you on board. Thank you for joining our platform. Here are a few things you can do to get started:</p>
        <ul>
            <li>Complete your profile</li>
            <li>Explore our features</li>
            <li>Reach out to our support team if you need help</li>
        </ul>
        <p>If you have any questions, feel free to <a href="mailto:support@example.com">contact us</a>.</p>
        <p>Best regards,<br>The Team</p>
        <a href="${actionUrl}" class="button">Get Started</a>
    </div>
</body>
</html>
        `;
    const text = `Hi ${username},\n\nWelcome to our platform! We're excited to have you on board.`;
    return this.sendEmail(to, subject, text, html);
  }

  // async sendPasswordResetEmail(to: string, resetToken: string) {
  //     const subject = 'Password Reset Request';
  //     const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;
  //     const html = templateRenderer.renderTemplate('passwordResetEmail.html', {
  //         resetLink,
  //     });
  //     const text = `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`;
  //     return this.sendEmail(to, subject, text, html);
  // }

  async sendPasswordResetEmail(
    to: string,
    defaultPassword: string,
    loginUrl: string
  ) {
    const subject = 'Password Reset Request';
    // const html = templateRenderer.renderTemplate('passwordResetEmail.html', {
    //   defaultPassword,
    //   loginUrl,
    // });

    const html = `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px 0;
        }
        .header h1 {
            margin: 0;
            color: #333333;
        }
        .content {
            padding: 20px 0;
        }
        .content p {
            color: #666666;
            line-height: 1.6;
        }
        .button {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-align: center;
            text-decoration: none;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            color: #999999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Your password has been reset. Your new default password is:</p>
            <p><strong>${defaultPassword}</strong></p>
            <p>Please use this password to log in at the link below and change it immediately:</p>
            <a href="${loginUrl}" class="button">Log In</a>
            <p>If you did not request a password reset, please contact our support team immediately.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Your Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    const text = `Your password has been reset. Your new default password is: ${defaultPassword}. Please use this password to log in at the following link and change it immediately:\n\n${loginUrl}`;
    return this.sendEmail(to, subject, text, html);
  }

  async sendUserPasswordEmail(
    to: string,
    firstName: string,
    email: string,
    password: string
  ) {
    const subject = 'Login Details';
    const emailInfo = `${email}`;
    const loginUrl = `http://localhost:3000/login`;
    // const html = templateRenderer.renderTemplate('userPasswordEmail.html', {
    //   emailInfo,
    //   password,
    //   firstName,
    //   loginUrl,
    // });

    const html = `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            color: #555555;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Our Platform!</h1>
        <p>Hi ${firstName},</p>
        <p>We're excited to have you on board. Thank you for joining our platform. Here are a few things you can do to get started:</p>
        <p>Below is your login details</p>
        <ul>
            <li><strong>Email:</strong> ${emailInfo}</li>
            <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Click the link below to login.</p>
        <a href="${loginUrl}" class="button">Login</a>
        <p>If you have any questions, feel free to <a href="mailto:support@example.com">contact us</a>.</p>
        <p>Best regards,<br>The Team ♾️</p>
    </div>
</body>
</html>
        `;
    const text = `Hi ${firstName},\n\nWelcome to our platform! We're excited to have you on board.`;
    return this.sendEmail(to, subject, text, html);
  }
}

export default new EmailService();
