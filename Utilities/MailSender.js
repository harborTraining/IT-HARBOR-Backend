const nodemailer = require("nodemailer");

const MailSender = async (email, title, bodyContent) => {
  try {
    require("dotenv").config();

    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "itharbortraining@gmail.com",
        pass: "zseeedobmgeexkqm",
      },
    });

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .header {
            text-align: center;
            background-color: #4caf50;
            color: white;
            padding: 10px 0;
            border-radius: 5px 5px 0 0;
          }
          .content {
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4caf50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          }
          .button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>LMS Notification</h1>
          </div>
          <div class="content">
            <p>Dear User,</p>
            <p>${bodyContent}</p>
            <p>If you have any questions, feel free to reach out.</p>
            <a href="mailto:notionstudy566@gmail.com" class="button">Contact Us</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LMS - Karan Sehgal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    let info = await transporter.sendMail({
      to: email,
      from: `"LMS - Karan Sehgal" <harbortraining@gmail.com>`,
      subject: title,
      html: emailTemplate,
    });

    return info;
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

module.exports = MailSender;