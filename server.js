require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Student = require("./models/Student");

const app = express();
app.use(cors());
app.use(express.json());

// ================== BASIC ROUTES ==================

app.get("/", (req, res) => {
  res.send("PlacementPro API Running 🚀");
});

// ================== ADD STUDENT ==================

app.post("/add-student", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json({ message: "Student added", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== ELIGIBILITY ==================

app.get("/eligible", async (req, res) => {
  try {
    const { cgpa, branch, backlogs } = req.query;

    const students = await Student.find({
      cgpa: { $gte: Number(cgpa) },
      branch: branch,
      backlogs: { $lte: Number(backlogs) },
    });

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== ALL STUDENTS ==================

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== AI RESUME SCORING ==================

app.post("/ai-score", async (req, res) => {
  try {
    const { resumeText } = req.body;

    let score = 50;

    if (resumeText.includes("project")) score += 10;
    if (resumeText.includes("internship")) score += 15;
    if (resumeText.includes("skills")) score += 10;
    if (resumeText.length > 300) score += 15;

    if (score > 100) score = 100;

    res.json({
      score,
      feedback: "Add more projects and internships to improve your profile.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== LOGIN ==================

const recruiter = {
  email: "admin@placementpro.com",
  password: "123456",
};

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === recruiter.email && password === recruiter.password) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ================== SERVER ==================

async function startServer() {
  try {
    const uri = process.env.MONGO_URI;

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected ✅");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.log("Server Error:", err);
  }
}

startServer();