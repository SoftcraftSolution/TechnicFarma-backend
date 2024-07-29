require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./src/route/user.route');
const cors = require('cors');
const path = require('path');
const http = require('http');


const app = express();
const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ extended: true }));

const mongoDB_String="mongodb+srv://Rahul:myuser@rahul.fack9.mongodb.net/Databaserahul?authSource=admin&replicaSet=atlas-117kuv-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true";

// MongoDB Connection
mongoose.connect(mongoDB_String, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Serve Uploaded Images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create HTTP server for socket.io
const server = http.createServer(app);

// Integrate socket.io






// User Routes
app.use('/user', userRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Add the trackDriver route


// Start the HTTP server
server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

// Create a WebSocket server


  


