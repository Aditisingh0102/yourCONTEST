const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for dev
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// ── File-based persistent store ──────────────────────────────
const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load db.json, starting fresh:', e.message);
  }
  return { notices: [], contests: [] };
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ notices, contests }, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save db.json:', e.message);
  }
}

const db = loadDB();
let notices = db.notices;
let contests = db.contests;

// REST API Endpoints

// Notices API
app.get('/api/notices', (req, res) => {
  res.json(notices);
});

app.post('/api/notices', (req, res) => {
  const newNotice = { ...req.body, _id: Date.now().toString(), date: new Date().toISOString() };
  notices = [newNotice, ...notices];
  saveDB();
  io.emit('NOTICE_UPDATED', { type: 'CREATE', notice: newNotice });
  res.status(201).json(newNotice);
});

app.put('/api/notices/:id', (req, res) => {
  const index = notices.findIndex(n => n._id === req.params.id);
  if (index !== -1) {
    notices[index] = { ...notices[index], ...req.body };
    saveDB();
    io.emit('NOTICE_UPDATED', { type: 'UPDATE', notice: notices[index] });
    res.json(notices[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/notices/:id', (req, res) => {
  notices = notices.filter(n => n._id !== req.params.id);
  saveDB();
  io.emit('NOTICE_UPDATED', { type: 'DELETE', id: req.params.id });
  res.json({ message: 'Notice deleted' });
});

// Contests API
app.get('/api/contests', (req, res) => {
  res.json(contests);
});

app.post('/api/contests', (req, res) => {
  const newContest = { ...req.body, _id: Date.now().toString(), createdAt: new Date().toISOString() };
  contests = [newContest, ...contests];
  saveDB();
  io.emit('CONTEST_UPDATED', { type: 'CREATE', contest: newContest });
  res.status(201).json(newContest);
});

app.put('/api/contests/:id', (req, res) => {
  const index = contests.findIndex(c => c._id === req.params.id);
  if (index !== -1) {
    contests[index] = { ...contests[index], ...req.body };
    saveDB();
    io.emit('CONTEST_UPDATED', { type: 'UPDATE', contest: contests[index] });
    // If timer extended
    io.emit('TIMER_EXTENDED', { contestId: req.params.id, newDuration: contests[index].duration });
    res.json(contests[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/contests/:id', (req, res) => {
  contests = contests.filter(c => c._id !== req.params.id);
  saveDB();
  io.emit('CONTEST_UPDATED', { type: 'DELETE', id: req.params.id });
  res.json({ message: 'Contest deleted' });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Persistent JSON DB Mode - db.json)`);
});
