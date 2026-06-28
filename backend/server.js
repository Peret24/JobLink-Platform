require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/joblink_demo';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));
// --- СХЕМЫ ---

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'employer'], default: 'user' },
});

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  age: { type: Number },
  city: { type: String },
  phone: { type: String },
  email: { type: String },
  skills: { type: String },
  education: { type: String },
  experience: { type: String },
  about: { type: String },
  // НОВОЕ ПОЛЕ: Видимость резюме для работодателей
  isVisible: { type: Boolean, default: false } 
});

const vacancySchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  salary: { type: String },
  city: { type: String },
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Resume = mongoose.model('Resume', resumeSchema);
const Vacancy = mongoose.model('Vacancy', vacancySchema);

// --- MIDDLEWARE ---

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: role || 'user' });
    await user.save();
    res.status(201).json({ message: 'Registered', user: { id: user._id, name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, 'secret_key', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- RESUME ROUTES ---

app.get('/api/resume', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });
    if (!resume) return res.status(404).json({ message: 'Not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/resume', authMiddleware, async (req, res) => {
  try {
    const { fullName, age, city, phone, email, skills, education, experience, about, isVisible } = req.body;
    let resume = await Resume.findOne({ userId: req.userId });
    if (resume) {
      Object.assign(resume, { fullName, age, city, phone, email, skills, education, experience, about, isVisible });
      await resume.save();
      return res.json({ message: 'Updated', resume });
    }
    resume = new Resume({ userId: req.userId, fullName, age, city, phone, email, skills, education, experience, about, isVisible });
    await resume.save();
    res.status(201).json({ message: 'Created', resume });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// НОВЫЙ МАРШРУТ: Поиск резюме (для работодателей)
// Доступен всем авторизованным, но фильтрует только видимые резюме
app.get('/api/resumes/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query; // поисковый запрос
    const filter = { isVisible: true }; // показываем только те, где стоит галочка
    
    if (q) {
      // Ищем по имени, навыкам или городу
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ];
    }
    
    const resumes = await Resume.find(filter).populate('userId', 'name email');
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- VACANCY ROUTES ---

app.get('/api/vacancies', async (req, res) => {
  try {
    const vacancies = await Vacancy.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.json(vacancies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/vacancies/:id', async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id).populate('createdBy', 'name email');
    if (!vacancy) return res.status(404).json({ message: 'Not found' });
    res.json(vacancy);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/vacancies', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'employer') return res.status(403).json({ message: 'Only employers' });
    const { title, company, salary, city, description } = req.body;
    const vacancy = new Vacancy({ title, company, salary, city, description, createdBy: req.userId });
    await vacancy.save();
    res.status(201).json({ message: 'Created', vacancy });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/vacancies/:id', authMiddleware, async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);
    if (!vacancy) return res.status(404).json({ message: 'Not found' });
    if (vacancy.createdBy.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });
    const { title, company, salary, city, description } = req.body;
    Object.assign(vacancy, { title, company, salary, city, description });
    await vacancy.save();
    res.json({ message: 'Updated', vacancy });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/vacancies/:id', authMiddleware, async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);
    if (!vacancy) return res.status(404).json({ message: 'Not found' });
    if (vacancy.createdBy.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });
    await vacancy.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => res.send('Server is running'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));