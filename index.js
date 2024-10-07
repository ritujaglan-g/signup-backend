const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://ritu:ritu12@cluster0.v8dkyy1.mongodb.net/')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  purchasedCourses: [
    {
      courseId: String,
      courseName: String,
      isCompleted: Boolean,
    },
  ],
});

const User = mongoose.model('User', userSchema);


app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = new User({ username, password, email });
  await user.save();
  res.json({ message: 'User created successfully' });
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', user });
});

app.put('/update-login', async (req, res) => {
  const { username, password, newPassword } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});


app.post('/purchase-course', async (req, res) => {
  const { username, courseId, courseName } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  user.purchasedCourses.push({ courseId, courseName, isCompleted: false });
  await user.save();
  res.json({ message: 'Course purchased successfully' });
});

// View Purchased Courses Route
app.get('/view-courses/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  res.json({ courses: user.purchasedCourses });
});

// Complete Course Route
app.post('/complete-course', async (req, res) => {
  const { username, courseId } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  const course = user.purchasedCourses.find(course => course.courseId === courseId);
  if (course) {
    course.isCompleted = true;
    await user.save();
    res.json({ message: 'Course marked as completed' });
  } else {
    res.status(400).json({ message: 'Course not found' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
