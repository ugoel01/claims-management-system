require('dotenv').config(); // Load .env file
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const claimRoutes = require('./routes/claimRoutes');
const policyRoutes = require('./routes/policyRoutes');

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/users', userRoutes);
app.use('/claims', claimRoutes);
app.use('/policies', policyRoutes);

// Home route
app.get('/', (req, res) => res.send('Claims Management API is running!'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));