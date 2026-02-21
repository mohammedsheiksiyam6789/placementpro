require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Student = require("./models/Student");

const app = express();

app.use(cors());
app.use(express.json());

// ================== BASIC ROUTE ==================

app.get("/", (req, res) => {
  res.send("PlacementPro API Running 🚀");
});

// ================== ADD STUDENT ==================

app.post("/add-student", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json({ message: "Student added successfully", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== ELIGIBILITY ==================

app.get("/eligible", async (req, res) => {
  try {
    const cgpa = Number(req.query.cgpa) || 0;
    const branch = req.query.branch || "";
    const backlogs = Number(req.query.backlogs) || 10;

    const query = {
      cgpa: { $gte: cgpa },
      backlogs: { $lte: backlogs }
    };

    if (branch !== "") {
      query.branch = branch;
    }

    const students = await Student.find(query);
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

app.post("/ai-score", (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.json({ score: 0, feedback: "Resume text required." });
    }

    const text = resumeText.toLowerCase();
    let score = 50;

    if (text.includes("project")) score += 10;
    if (text.includes("internship")) score += 15;
    if (text.includes("skills")) score += 10;
    if (resumeText.length > 300) score += 15;

    if (score > 100) score = 100;

    res.json({
      score,
      feedback: "Add more measurable achievements and internships."
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== CHATBOT ==================

app.post("/chat", (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Please enter a valid message." });
    }

    const msg = message.toLowerCase();
    let reply = "Please contact placement office for detailed information.";

    if (msg.includes("cutoff"))
      reply = "Typical cutoff CGPA is 7.0+ depending on company.";

    else if (msg.includes("interview"))
      reply = "Interview schedules are shared via email to eligible students.";

    else if (msg.includes("company"))
      reply = "Multiple companies are visiting this month for placements.";

    else if (msg.includes("eligible"))
      reply = "Eligibility depends on CGPA, branch, and backlogs criteria.";

    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== LOGIN ==================

const recruiter = {
  email: "admin@placementpro.com",
  password: "123456"
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

    if (!uri) {
      console.log("MONGO_URI not found");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });

  } catch (err) {
    console.log("ERROR:", err);
    process.exit(1);
  }
}

startServer();
// ================== AI CHATBOT ==================

/*
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const API_KEY = process.env.OPENAI_API_KEY;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    res.json({
      reply: data.choices?.[0]?.message?.content || "No response",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/