const express = require('express');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');



const labRoutes = require('./routes/labRoutes');
const config = require('./config');
const app = express();

//load configuration from .env file
require('dotenv-flow').config();

const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.DBURI, {})
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB Atlas: ', err);
    });

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies. Useful when testing with Postman

// To remove data using these defaults:
app.use(mongoSanitize());

app.use('/api/lab', labRoutes);

module.exports = app;

