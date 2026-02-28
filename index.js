// ১. প্রজেক্ট ও ব্লগের জন্য Schema তৈরি
const projectSchema = new mongoose.Schema({
  title: String,
  image: String, // ছবির লিঙ্ক (URL)
  desc: String,
  category: String, // 'project' অথবা 'blog'
  date: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

// ২. ডাটা সেভ করার API (Save)
app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) { res.status(500).json(err); }
});

// ৩. সব ডাটা দেখার API (Fetch)
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find().sort({ date: -1 });
  res.json(projects);
});

// ৪. ডাটা আপডেট করার API (Edit/Update)
app.put('/api/projects/:id', async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// ৫. ডাটা ডিলিট করার API (Delete)
app.delete('/api/projects/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});