require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  'http://localhost:4200',
  'https://mjqualitycars.com',
  'https://www.mjqualitycars.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* =========================================================
   DATABASE
========================================================= */

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MJ Quality Cars Database: ONLINE"))
  .catch(err => console.log("❌ Connection Error:", err));

/* =========================================================
   SLUG HELPER
========================================================= */

function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* =========================================================
   SCHEMAS
========================================================= */

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

/* ---------------- BLOG SCHEMA WITH SLUG ---------------- */

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, index: true }, // no unique constraint for now

  category: { type: String, default: 'Guides' },
  date: String,
  author: { type: String, default: 'M&J Admin' },
  authorImage: String,
  readTime: String,
  image: String,
  imageAlt: String,
  description: String,
  content: String,
  inlineImages: [{
    src: String,
    alt: String
  }]
}, { collection: 'blogs' });

/* SIMPLE SLUG GENERATION */
BlogSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  next();
});

const Blog = mongoose.model('Blog', BlogSchema);

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model('Admin', AdminSchema);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get('/', (req, res) => {
  res.send('🚀 M&J Quality Cars API is Running Successfully');
});

/* =========================================================
   CARS ROUTES
========================================================= */

app.post('/api/cars', async (req, res) => {
  try {
    const savedCar = await new Car(req.body).save();
    res.status(201).json(savedCar);
  } catch (error) {
    res.status(500).json({ message: "Error adding car", error });
  }
});

app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ _id: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cars" });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch {
    res.status(404).json({ message: "Car not found" });
  }
});

app.patch('/api/cars/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedCar);
  } catch {
    res.status(500).json({ message: "Error updating car" });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicle removed successfully" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

/* =========================================================
   BLOG ROUTES (ORDER MATTERS)
========================================================= */

app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find(
      {},
      {
        title: 1,
        slug: 1,
        category: 1,
        date: 1,
        author: 1,
        readTime: 1,
        description: 1
      }
    ).sort({ _id: -1 });

    res.json(blogs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching blogs" });
  }
});

/* 2️⃣ GET BLOG BY SLUG */
app.get('/api/blogs/slug/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch {
    res.status(500).json({ message: "Error fetching blog by slug" });
  }
});

/* 3️⃣ GET BLOG BY ID (must be LAST) */
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch {
    res.status(500).json({ message: "Error fetching blog details" });
  }
});

/* CREATE BLOG */
app.post('/api/blogs', async (req, res) => {
  try {
    const savedBlog = await new Blog(req.body).save();
    res.status(201).json(savedBlog);
  } catch {
    res.status(500).json({ message: "Error adding blog" });
  }
});

/* UPDATE BLOG */
app.patch('/api/blogs/:id', async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedBlog);
  } catch {
    res.status(500).json({ message: "Error updating blog" });
  }
});

/* DELETE BLOG */
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Article removed successfully" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

/* =========================================================
   TEMP SLUG MIGRATION
========================================================= */

app.post('/api/blogs/migrate-slugs', async (req, res) => {
  try {
    const blogs = await Blog.find(
      { $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] },
      { _id: 1, title: 1 }
    );

    let updated = 0;

    for (const b of blogs) {
      if (!b.title) continue;

      const newSlug = slugify(b.title);

      await Blog.updateOne(
        { _id: b._id },
        { $set: { slug: newSlug } }
      );

      updated++;
    }

    res.json({ message: "Slug migration complete", updated });
  } catch (err) {
    res.status(500).json({ message: "Migration failed", error: err.message });
  }
});

/* =========================================================
   AUTH
========================================================= */

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login Successful", user: admin.username });
  } catch {
    res.status(500).json({ message: "Server error during login" });
  }
});

/* =========================================================
   START SERVER
========================================================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MJ Quality Cars API running on Port: ${PORT}`);
});