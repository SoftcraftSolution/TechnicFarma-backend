
const bcrypt = require('bcryptjs');
const responseStructure = require('../middleware/response');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User= require('../model/user.model');
const ResetCode=require('../model/resetcode.models')

// Register a new user
exports.register = async (req, res) => {
 
  try {
    const { email, password, fullname, gender, phonenumber, dob } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    console.log("in registration call");
    if (user) {
      return res.status(400).json(responseStructure.error('User already exists'));
    }

    // Create a new user
    user = new User({
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
    // Check if the user exists and exclude the password field from the result
    const user = await User.findOne({ email }) // Exclude password field

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
          isAdminApproved: false,
          email: user.email
        }
      });
    }

    // Prepare user data for response without including sensitive information
    const userData = {
      id: user._id,
   
      fullname: user.fullname,
      gender: user.gender,
      phonenumber: user.phonenumber,
      dob: user.dob,
      isAdminApproved: user.isAdminApproved,
      isvalidate: true, // Assuming login success means user is validated
      createdAt: user.createdAt
    };

    // Send successful login response
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
      let user = await User.findById(userId);
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
      const salesman = await User.find()
  
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
      const user = await User.findByIdAndUpdate(
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
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json(responseStructure.error('User not found'));
      }
  
      // Generate a reset code
      const resetCode = crypto.randomInt(100000, 999999).toString(); // 6-digit code
  
      // Create a new reset code document
      const newResetCode = new ResetCode({
        userId: user._id,
        code: resetCode
      });
  
      // Save the reset code document to the database
      await newResetCode.save();
  
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
  
      res.status(200).json(responseStructure.success(`An email has been sent to ${user.email} with the reset code.`));
    } catch (err) {
      console.error('Error sending password reset email:', err);
      res.status(500).json(responseStructure.error('Error sending password reset email', 500));
    }
  };
  exports.verifyCode = async (req, res) => {
    const { email, code } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json(responseStructure.error('User not found'));
      }
  
      // Find the reset code document by userId and code
      const resetCode = await ResetCode.findOne({ userId: user._id, code });
      if (!resetCode) {
        return res.status(400).json(responseStructure.error('Invalid or expired reset code'));
      }
  
      // If the reset code is valid
      res.status(200).json(responseStructure.success('Reset code is valid'));
  
    } catch (err) {
      console.error('Error verifying reset code:', err);
      res.status(500).json(responseStructure.error('Error verifying reset code', 500));
    }
  };
  exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    try {
      // Validate the reset code here if needed, this example assumes the code is correct
      // In a real-world scenario, you might want to add more logic to handle the reset code validation
  
      // Find the user by email
      const user = await User.findOne({ email });
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
  
      console.log('Start of day:', startOfDay);
      console.log('End of day:', endOfDay);
  
      const activeSalesmenCount = await User.countDocuments({
       
        isActive: true,
      });
  
      console.log('Active salesmen count query:', {
     
        isActive: true,
      });
  
      const inactiveSalesmenCount = await User.countDocuments({
      
        isActive: false,
      });
  
      const totalSalesmenCount = await User.countDocuments();
  
      const salesmenBirthdaysToday = await User.find({
        dob: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }, 'fullname dob');
  
      res.status(200).json({
        status: 200,
        message: 'Total salesmen, active/inactive salesmen today, and birthdays fetched successfully',
        body: {
          totalSalesmen: totalSalesmenCount,
          totalActiveSalesmen: activeSalesmenCount,
          totalInactiveSalesmen: inactiveSalesmenCount,
          salesmenBirthdaysToday: salesmenBirthdaysToday,
        }
      });
    } catch (error) {
      console.error('Error fetching salesmen data:', error);
      res.status(500).json({
        status: 500,
        message: 'Server error',
      });
    }
  };
  
  exports.checkAdminApproval = async (req, res) => {
    try {
        const { email } = req.query; // Get email from query parameter

        if (!email) {
            return res.status(400).json(responseStructure.error('Email is required', 400));
        }

        console.log('Searching for email:', email);

        // Find the user by email
        const user = await User.findOne({ email });

        console.log('User found:', user);

        if (!user) {
            // If no user is found, return a 404 status with a suitable message
            return res.status(404).json(responseStructure.error('User not found', 404));
        }

        // Respond with the admin approval status
        res.status(200).json(responseStructure.success({
           user
        }, 'Admin approval status fetched successfully'));
    } catch (error) {
        console.error('Error checking admin approval:', error);
        res.status(500).json(responseStructure.error('Server error', 500));
    }
};

exports.updateLocation = async (req, res) => {
  const { id } = req.query;
  const { lat, log } = req.body.location;

  try {
    // Find user by ID and update location
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          'location.lat': lat,
          'location.log': log
        }
      },
      { new: true } // Return the updated document
    ).select('-password'); // Exclude password from the response

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Location updated successfully',
      body: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Internal server error'
    });
  }
};
