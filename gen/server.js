const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to handle contact form submissions
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Add contact to file
  const contact = { name, email, message, date: new Date().toISOString() };
  const contactsFile = 'contacts.json';
  const contacts = fs.existsSync(contactsFile)
    ? JSON.parse(fs.readFileSync(contactsFile, 'utf8'))
    : [];

  contacts.push(contact);
  fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

  // Send confirmation email
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thank you for reaching out!`,
      html: `
        <h2>Hello, ${name}!</h2>
        <p>Thank you for contacting us! We have received your message:</p>
        <p><strong>${message}</strong></p>
        <p>We will get back to you shortly. If you have any further questions, feel free to reply to this email.</p>
        <br>
        <p>Best regards,</p>
        <p>Atharva Chitnis</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ message: 'Contact saved and confirmation email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending confirmation email' });
  }
});

// Serve the main portfolio page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
