const Admin = require('../model/admin.model'); // Adjust the path as necessary
const ResetCode = require('../model/resetcode.models'); // Adjust the path as necessary
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Default admin credentials
const defaultAdmin = {
  email: process.env.DEFAULT_ADMIN_EMAIL,
  password: process.env.DEFAULT_ADMIN_PASSWORD,
};

const ensureDefaultAdminExists = async () => {
  try {
    const admin = await Admin.findOne({ email: defaultAdmin.email });
    if (!admin) {
      await Admin.create(defaultAdmin);
      console.log('Default admin credentials saved.');
    }
  } catch (err) {
    console.error('Error ensuring default admin exists:', err.message);
  }
};

// Ensure default admin exists on server start
ensureDefaultAdminExists();

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const resetCode = crypto.randomInt(1000, 9999).toString(); // 4-digit code

    await ResetCode.findOneAndUpdate(
      { userId: admin._id }, 
      { userId: admin._id, code: resetCode },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: admin.email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `An email has been sent to ${admin.email} with the reset code.` });
  } catch (err) {
    console.error('Error sending password reset email:', err);
    res.status(500).json({ error: 'Error sending password reset email' });
  }
};

// Verify Code
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const resetCode = await ResetCode.findOne({ userId: admin._id, code });
    if (!resetCode) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    res.status(200).json({ message: 'Reset code verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error verifying reset code' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      admin.password = newPassword;
      await admin.save();
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Error resetting password' });
    }
  };
  
