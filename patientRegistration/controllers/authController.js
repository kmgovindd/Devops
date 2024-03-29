const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid username or password' });

        const isMatch = await user.verifyPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });
        if (user.isDisabled) return res.status(401).json({ message: 'The provided user is disabled and therefore cannot be logged into' });

        const token = jwt.sign({ userId: user._id, role: user.role }, config.jwtSecret, { expiresIn: '6h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.roleCreate = async (req, res) => {
    try {
        const { role, permission } = req.body;
        console.log(role + " " + permission);
        await Role.updateOne({ role }, { $addToSet: { permissions: permission } }, { upsert: true });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Unable to create role' });
        return;
    }

    res.status(200).json({ message: "Created role" });
}

exports.authTest = async (req, res) => {
    console.log("Executed function after auth");
    return res.status(200).json({ message: "Authentication was done properly" });
};