const Salesman = require('../model/user.model');
const bcrypt = require('bcryptjs');
const responseStructure = require('../middleware/response');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const userModel = require('../model/user.model');

// Register a new user
exports.register = async (req, res) => {
 
  try {
    const { email, password, fullname, gender, phonenumber, dob } = req.body;

    // Check if the user already exists
    let user = await userModel.findOne({ email });
    console.log("in registration call");
    if (user) {
      return res.status(400).json(responseStructure.error('User already exists'));
    }

    // Create a new user
    user = new userModel({
      email,
      password,
      fullname,
      gender,
      phonenumber,
      dob
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    const savedUser = await user.save();

    console.log(savedUser); // Log the saved user to ensure it includes all fields

    res.status(201).json(responseStructure.success(savedUser, 'User registered successfully'));
  } catch (err) {
    console.error(err.message);
    res.status(500).json(responseStructure.error('Server error', 500));
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 400,
        body: {
          isValid: false
        }
      });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        body: {
          isValid: false
        }
      });
    
    }

    // Check if the user is admin approved
    if (!user.isAdminApproved) {
      return res.status(200).json({
        statusCode: '200',
        message: 'Your account has not been approved by an admin yet.',
        body: {
          isAdminApproved : false
        }
      });
    }

    // Manually set isvalidate in the response
    const userData = {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      gender: user.gender,
      phonenumber: user.phonenumber,
      dob: user.dob,
      isAdminApproved: user.isAdminApproved,
      isvalidate: true, // Assuming login success means user is validated
      createdAt: user.createdAt
    };

    res.status(200).json(responseStructure.success(userData, 'Login successful'));
  } catch (err) {
    console.error(err.message);
    res.status(500).json(responseStructure.error(err.message, 500));
  }
};


exports.updateIsAdminApproved = async (req, res) => {
    const userId = req.query.id;
    const { isAdminApproved} = req.body;
  
    try {
      // Find the user by ID
      let user = await Salesman.findById(userId);
      if (!user) {
        return res.status(404).json(responseStructure.error('User not found'));
      }
  
      // Update the isadminapproved field
      user.isAdminApproved = isAdminApproved;
      await user.save();
  
      res.status(200).json(responseStructure.success(user, 'User approval status updated successfully'));
    } catch (err) {
      console.error(err.message);
      res.status(500).json(responseStructure.error('Server error', 500));
    }
  };
  exports.getUser = async (req, res) => {
   // Assuming userId is passed as a query parameter
  
    try {
      // Fetch the salesman by userId and sort by createdAt descending
      const salesman = await Salesman.find()
  
      // Check if salesman is found
      if (!salesman || salesman.length === 0) {
        return res.status(404).json(responseStructure.error('Salesman not found'));
      }
  
      // Structure the response
      const response = responseStructure.success(salesman, 'Salesman fetched successfully');
  
      // Send the response back to the client
      res.status(200).json(response);
    } catch (error) {
      // Handle errors
      console.error('Error Fetching Salesman:', error);
      const errorMessage = error.message || 'Error fetching salesman';
      res.status(500).json(responseStructure.error(errorMessage));
    }
  };
 exports.updateStatus= async (req, res) => {
    const { id } = req.query;
    const { isActive } = req.body;
  
    try {
      const user = await Salesman.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      );
  
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      res.send(user);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }

  exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Find the user by email
      const user = await Salesman.findOne({ email });
      if (!user) {
        return res.status(404).json(responseStructure.error('User not found'));
      }
  
      // Generate a reset code
      const resetCode = crypto.randomInt(100000, 999999).toString(); // 6-digit code
  
      // Send the reset email
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
  
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Password Reset Code',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Your password reset code is: ${resetCode}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json(responseStructure.success('An email has been sent to ' + user.email + ' with the reset code.'));
    } catch (err) {
      console.error('Error sending password reset email:', err);
      res.status(500).json(responseStructure.error('Error sending password reset email', 500));
    }
  };
  exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    try {
      // Validate the reset code here if needed, this example assumes the code is correct
      // In a real-world scenario, you might want to add more logic to handle the reset code validation
  
      // Find the user by email
      const user = await Salesman.findOne({ email });
      if (!user) {
        return res.status(404).json(responseStructure.error('User not found'));
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
  
      // Save the updated user
      await user.save();
  
      res.status(200).json(responseStructure.success('Password has been reset successfully.'));
    } catch (err) {
      console.error('Error resetting password:', err);
      res.status(500).json(responseStructure.error('Error resetting password', 500));
    }
  };
  exports.getTotalSalesmenToday = async (req, res) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      const activeSalesmenCount = await Salesman.countDocuments({
        lastActive: { $gte: startOfDay, $lte: endOfDay },
        isActive: true,
      });
  
      const inactiveSalesmenCount = await Salesman.countDocuments({
        lastActive: { $gte: startOfDay, $lte: endOfDay },
        isActive: false,
      });
  
      const totalSalesmenCount = await Salesman.countDocuments();
  
      const salesmenBirthdaysToday = await Salesman.find({
        dob: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }, 'fullname dob');
  
      res.status(200).json(responseStructure.success(
        {
          totalSalesmen: totalSalesmenCount,
          totalActiveSalesmen: activeSalesmenCount,
          totalInactiveSalesmen: inactiveSalesmenCount,
          salesmenBirthdaysToday: salesmenBirthdaysToday,
        },
        'Total salesmen, active/inactive salesmen today, and birthdays fetched successfully'
      ));
    } catch (error) {
      console.error('Error fetching salesmen data:', error);
      res.status(500).json(responseStructure.error('Server error', 500));
    }
  };
  