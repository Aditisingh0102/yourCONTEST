const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const upload = multer({ storage: multer.memoryStorage() });

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
  return { notices: [], contests: [], submissions: [] };
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ notices, contests, submissions }, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save db.json:', e.message);
  }
}

const db = loadDB();
let notices = db.notices || [];
let contests = db.contests || [];
let submissions = db.submissions || [];

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

// Submissions API
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

app.post('/api/submissions', (req, res) => {
  const newSubmission = { ...req.body, _id: Date.now().toString() };
  submissions = [newSubmission, ...submissions];
  saveDB();
  io.emit('SUBMISSION_ADDED', newSubmission);
  res.status(201).json(newSubmission);
});

app.delete('/api/submissions/:id', (req, res) => {
  submissions = submissions.filter(s => s._id !== req.params.id);
  saveDB();
  io.emit('SUBMISSION_DELETED', req.params.id);
  res.json({ message: 'Submission deleted' });
});

// Document Parsing API
app.post('/api/upload-questions', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    let rawText = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      const data = await pdfParse(req.file.buffer);
      rawText = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = result.value;
    } else if (ext === '.txt') {
      rawText = req.file.buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload .txt, .pdf, or .docx' });
    }

    const questions = parseQuestionsFromText(rawText);
    res.json({ questions });
  } catch (err) {
    console.error('Error parsing document:', err);
    res.status(500).json({ error: 'Failed to parse document' });
  }
});

function parseQuestionsFromText(text) {
  const questions = [];
  // Split by digits followed by dot/parenthesis at the start of a line
  const blocks = text.split(/(?=\n\s*\d+[\.\)])/i).filter(b => b.trim());

  blocks.forEach((block, index) => {
    block = block.trim();
    if (!block) return;

    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return;

    // Remove the number prefix from the question line
    const qLine = lines[0].replace(/^\d+[\.\)]\s*/, '').trim();
    const options = [];
    let correctOption = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().startsWith('answer:')) {
        const ans = line.split(':')[1].trim().toLowerCase();
        const idx = ['a', 'b', 'c', 'd'].indexOf(ans);
        if (idx !== -1) {
          correctOption = idx;
        } else {
          // attempt exact match
          const matchIdx = options.findIndex(o => o.toLowerCase() === ans);
          if (matchIdx !== -1) correctOption = matchIdx;
        }
      } else if (/^[a-d][\)\.]/i.test(line)) {
        options.push(line.replace(/^[a-d][\)\.]\s*/i, '').trim());
      }
    }

    if (qLine && options.length > 0) {
      // Ensure exactly 4 options by padding with empty strings if necessary
      while (options.length < 4) {
          options.push('');
      }
      
      questions.push({
        id: Date.now() + Math.random(),
        type: 'MCQ',
        question: qLine,
        options: options.slice(0, 4), // Take max 4
        correctOption: correctOption,
        marks: 1
      });
    }
  });

  return questions;
}

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
