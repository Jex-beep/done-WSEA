require('dotenv').config(); // Essential: Loads variables from Hostinger Dashboard or .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();

// --- CORS CONFIGURATION (Essential for Production) ---
const allowedOrigins = [
  'http://localhost:4200', 
  'https://mjqualitycars.com', 
  'https://www.mjqualitycars.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE CONNECTION ---
// Ensure MONGODB_URI is set in your Hostinger Environment Variables
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MJ Quality Cars Database: ONLINE"))
  .catch(err => console.log("❌ Connection Error: ", err));

// --- SCHEMAS ---

const CarSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  type: String,
  price: String, 
  image: String, 
  gallery: [String], 
  isAvailable: { type: Boolean, default: true },
  description: String,
  gearbox: String,
  fuel: String,
  engine: String,
  ac: String,
  seats: Number,
  distance: String,
  equipment: [String]
});
const Car = mongoose.model('Car', CarSchema);

// ✅ FIXED: Added imageAlt and inlineImages fields
const BlogSchema = new mongoose.Schema({
  title: String,
  category: { type: String, default: 'Guides' },
  date: String,
  author: { type: String, default: 'M&J Admin' },
  authorImage: String,
  readTime: String,
  image: String,
  imageAlt: String,  // ← NEW: Featured image alt text for SEO
  description: String,
  content: String,
  inlineImages: [{   // ← NEW: Store alt text for inline Quill images
    src: String,
    alt: String
  }]
}, { collection: 'blogs' });
const Blog = mongoose.model('Blog', BlogSchema);

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model('Admin', AdminSchema);

// --- HEALTH CHECK ROUTE ---
// Useful for verifying the backend is "awake" without needing the frontend
app.get('/', (req, res) => {
  res.send('🚀 M&J Quality Cars API is Running Successfully');
});

// --- API ROUTES: CARS ---

app.post('/api/cars', async (req, res) => {
  try {
    const newCar = new Car(req.body);
    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (error) {
    res.status(500).json({ message: "Error adding car", error });
  }
});

app.patch('/api/cars/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: "Error updating car", error });
  }
});

app.get('/api/cars', async (req, res) => {
  try {
    // We add .sort({ _id: -1 }) to bring the newest cars to the top
    const cars = await Car.find().sort({ _id: -1 }); 
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cars", error: err.message });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    res.json(car);
  } catch (err) {
    res.status(404).json({ message: "Car not found" });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicle removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// --- API ROUTES: BLOGS ---

app.post('/api/blogs', async (req, res) => {
  try {
    console.log('📝 Received blog data:', req.body); // ← DEBUG LOG
    console.log('📝 imageAlt received:', req.body.imageAlt); // ← DEBUG LOG
    
    const newBlog = new Blog(req.body);
    const savedBlog = await newBlog.save();
    
    console.log('✅ Saved blog to DB:', savedBlog); // ← DEBUG LOG
    console.log('✅ imageAlt in saved blog:', savedBlog.imageAlt); // ← DEBUG LOG
    
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('❌ Error saving blog:', error); // ← DEBUG LOG
    res.status(500).json({ message: "Error adding blog", error });
  }
});

app.patch('/api/blogs/:id', async (req, res) => {
  try {
    console.log('📝 Updating blog:', req.params.id, req.body); // ← DEBUG LOG
    
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    
    console.log('✅ Updated blog:', updatedBlog); // ← DEBUG LOG
    
    res.json(updatedBlog);
  } catch (error) {
    console.error('❌ Error updating blog:', error); // ← DEBUG LOG
    res.status(500).json({ message: "Error updating blog", error });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    // Using _id: -1 is the standard way to get the latest entries first
    const blogs = await Blog.find().sort({ _id: -1 });
    res.json(blogs);
  } catch (err) {
    // Sending the error message back helps with debugging
    res.status(500).json({ message: "Error fetching blogs", error: err.message });
  }
});
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blog details" });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Article removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// --- AUTH ROUTES ---

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login Successful", user: admin.username });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// --- START SERVER ---
// Hostinger uses process.env.PORT to assign your app a port dynamically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MJ Quality Cars API running on Port: ${PORT}`);
});