const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (không dùng các tùy chọn cũ gây cảnh báo)
mongoose.connect('mongodb://127.0.0.1:27017/loginDB')
  .then(() => {
    console.log('✅ MongoDB connected');

    // Chỉ khởi động server sau khi kết nối DB thành công
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// Schema & model
const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  phone: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// GET routes để kiểm tra trong trình duyệt
app.get('/', (req, res) => {
  res.send('🚀 Server is running!');
});

app.get('/register', (req, res) => {
  res.send('🔒 This route is for POST requests only. Use Postman or cURL to register.');
});

// Register (POST)
app.post('/register', async (req, res) => {
  const { fullname, email, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, email, phone, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login (POST)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
