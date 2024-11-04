const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config;

const app = express();
const PORT = process.env.PORT || 3000;

// API endpoint to handle contact form submissions
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  // contact object with timestamp
  const contact = {
    name,
    email,
    message,
    date: new Date().toISOString(),
  };

  // Save contact information to a JSON file
  fs.readFile('contacts.json', 'utf8', (err, data) => {
    let contacts = [];
    if (fs.existsSync('contacts.json')) {
      const data = fs.readFileSync('contacts.json', 'utf8');
      contacts = data ? JSON.parse(data) : [];
    }

    // Add the new contact and write to the JSON file

    contacts.push(contact);
    fs.writeFile('contacts.json', JSON.stringify(contacts, null, 2));
    res.status(201).json({ message: 'Contact Information Saved!' });
  });
});

//Middleware for parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//Serve main page portfolio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Contact form route
app.post('contact', async (req, res) => {
  const { email, message } = req.body;

  try {
    // Setting up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thank you for reaching out!`, //Subject of the email
      html: `
    <h2>Hello,</h2>
    <p>Thank you for contacting us!</p>
    <p><strong>Here's a summary of your submission:</strong></p>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Memo:</strong> ${memo}</li>
    </ul>
    <p>We will get back to you shortly. If you have any further questions, feel free to reply to this email.</p>
    <br>
    <p>Best regards,</p>
    <p>Atharva Chitnis</p>
  `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Confirmation email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending email' });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
