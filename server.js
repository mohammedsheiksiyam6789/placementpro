require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

/* ================= MODELS ================= */

const User = mongoose.model("User", {
  name:String,
  email:String,
  password:String,
  role:String,
  cgpa:Number,
  branch:String,
  backlogs:Number,
  resume:String
});

const Drive = mongoose.model("Drive", {
  company:String,
  minCgpa:Number,
  allowedBranch:String,
  maxBacklogs:Number,
  createdAt:{type:Date,default:Date.now}
});

const Application = mongoose.model("Application", {
  studentId:mongoose.Schema.Types.ObjectId,
  driveId:mongoose.Schema.Types.ObjectId,
  status:{type:String,default:"Applied"}
});

/* ================= AUTH ================= */

app.post("/register", async(req,res)=>{
  const user = await User.create(req.body);
  res.json(user);
});

app.post("/login", async(req,res)=>{
  const user = await User.findOne({
    email:req.body.email,
    password:req.body.password
  });
  if(!user) return res.json({success:false});
  res.json({success:true,user});
});

/* ================= DRIVE ================= */

app.post("/create-drive", async(req,res)=>{
  const drive = await Drive.create(req.body);
  res.json(drive);
});

app.get("/drives", async(req,res)=>{
  const drives = await Drive.find();
  res.json(drives);
});

/* ================= ELIGIBILITY ================= */

app.get("/eligible/:driveId", async(req,res)=>{
  const drive = await Drive.findById(req.params.driveId);

  const students = await User.find({
    role:"student",
    cgpa:{$gte:drive.minCgpa},
    branch:{$regex:drive.allowedBranch,$options:"i"},
    backlogs:{$lte:drive.maxBacklogs}
  });

  res.json(students);
});

/* ================= APPLY ================= */

app.post("/apply", async(req,res)=>{
  const application = await Application.create(req.body);
  res.json(application);
});

app.get("/applications/:studentId", async(req,res)=>{
  const apps = await Application.find({studentId:req.params.studentId});
  res.json(apps);
});

/* ================= RESUME AI ================= */

app.post("/ai-score",(req,res)=>{
  let text=req.body.resume?.toLowerCase()||"";
  let score=50;
  if(text.includes("project"))score+=10;
  if(text.includes("internship"))score+=15;
  if(text.includes("skills"))score+=10;
  if(text.length>300)score+=15;
  if(score>100)score=100;
  res.json({score});
});

/* ================= CHATBOT ================= */

app.post("/chat",(req,res)=>{
  const msg=req.body.message.toLowerCase();
  let reply="Contact placement office.";
  if(msg.includes("cutoff"))reply="CGPA cutoff is usually 7+.";
  if(msg.includes("interview"))reply="Interview dates shared via email.";
  res.json({reply});
});

app.listen(5000,()=>console.log("Server running"));