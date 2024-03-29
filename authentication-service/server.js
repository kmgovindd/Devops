const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const config = require('./config');
require('dotenv-flow').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log("The Mongo URL is: " + process.env.DBURI);

mongoose.connect(process.env.DBURI, {})
    .then(() => {
        console.log('Connected to MongoDB Atlas to URL: ');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB Atlas: ', err);
    });

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies. Useful when testing with Postman

app.use('/api', authRoutes);
app.use('/api/user', userRoutes);

module.exports = app;