const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config;

const app = express();
const PORT = process.env.PORT || 3000;

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
      service: getMaxListeners,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Portfolio Contact Form - Message from ${email}`,
      tetx: message,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).send('Form submitted successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
