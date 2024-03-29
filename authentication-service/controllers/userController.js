const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role} = req.body;

    if (!username) return res.status(400).json({ message: 'Username not provided. Try again with a valid username' });
    if (!email) return res.status(400).json({ message: 'Email not provided. Try again with a email password' });
    if (!password) return res.status(400).json({ message: 'Password not provided. Try again with a valid password' });

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) 
      return res.status(400).json({ message: 'Valid role not provided. Try again with one of these valid roles: admin, clerk, doctor, nurse or radiologoist' });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getUser = async (req, res) => {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username });

		if (!user) return res.status(404).json({ message: 'User not found' });
		if (user.isDisabled) return res.status(403).json({ message: 'User is disabled' });

		res.status(200).json({ 
			message: 'User found',
			username: user.username,
			email: user.email,
			role: user.role
		});
	} catch (err) {
		res.status(500).json({ message: 'Internal server error.' });
	}
};
  
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find();

		res.status(200).json({ users });
	} catch (err) {
		res.status(500).json({ message: 'Internal server error.' });
	}
};


exports.disableUser = async (req, res) => {
  try {
		const { username } = req.params;
		const user = await User.findOne({ username })

		if (!user) return res.status(404).json({ message: "User does not exist!" });

		if (!user.isDisabled) {
			user.isDisabled = true;
			await user.save();
		}
		else return res.status(404).json({ message: "User is already disabled!" });

		res.status(200).json({
				message: `User successfully disabled!`,
		});
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.modifyRole = async (req, res) => {
  const { username, role } = req.params;
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ message: 'Provided username cannot be found. Try again with a valid username' });
    }

    user.role = role;
    await user.save();
    res.status(200).json({ message: 'Role of given user successfuly changed to: ' + role});
  } catch (err) {
    return res.status(400).json({ message: 'The provided role name is not valid' });
  }
};