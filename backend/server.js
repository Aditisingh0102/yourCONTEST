const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

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
  return { notices: [], contests: [], submissions: [], questions: [] };
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ notices, contests, submissions, questions }, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save db.json:', e.message);
  }
}

const db = loadDB();
let notices = db.notices || [];
let contests = db.contests || [];
let submissions = db.submissions || [];
let questions = db.questions || [];

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
  contests = contests.filter(c => (c._id || c.id).toString() !== req.params.id);
  saveDB();
  io.emit('CONTEST_UPDATED', { type: 'DELETE', id: req.params.id });
  res.json({ message: 'Contest deleted' });
});

// Questions API
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

app.post('/api/questions', (req, res) => {
  if (Array.isArray(req.body)) {
    // Bulk create
    const newQuestions = req.body.map(q => ({
      ...q,
      _id: Date.now().toString() + Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    }));
    questions = [...newQuestions, ...questions];
    saveDB();
    newQuestions.forEach(q => io.emit('QUESTION_UPDATED', { type: 'CREATE', question: q }));
    res.status(201).json(newQuestions);
  } else {
    // Single create
    const newQuestion = { 
      ...req.body, 
      _id: Date.now().toString() + Math.random().toString(36).substring(7), 
      createdAt: new Date().toISOString() 
    };
    questions = [newQuestion, ...questions];
    saveDB();
    io.emit('QUESTION_UPDATED', { type: 'CREATE', question: newQuestion });
    res.status(201).json(newQuestion);
  }
});

app.put('/api/questions/:id', (req, res) => {
  const index = questions.findIndex(q => (q._id || q.id).toString() === req.params.id);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...req.body };
    saveDB();
    io.emit('QUESTION_UPDATED', { type: 'UPDATE', question: questions[index] });
    res.json(questions[index]);
  } else {
    res.status(404).json({ error: 'Question not found' });
  }
});

app.delete('/api/questions/:id', (req, res) => {
  questions = questions.filter(q => (q._id || q.id).toString() !== req.params.id);
  saveDB();
  io.emit('QUESTION_UPDATED', { type: 'DELETE', id: req.params.id });
  res.json({ message: 'Question deleted' });
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
    } else if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      
      const parsedQuestions = parseQuestionsFromJSON(jsonData);
      return res.json({ questions: parsedQuestions });
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload .txt, .pdf, .docx, .xlsx, or .csv' });
    }

    const questions = parseQuestionsFromText(rawText);
    res.json({ questions });
  } catch (err) {
    console.error('Error parsing document:', err);
    res.status(500).json({ error: 'Failed to parse document' });
  }
});

function parseQuestionsFromJSON(data) {
  return data.map((row, index) => {
    const type = (row.Type || row.type || 'MCQ').trim().toUpperCase();
    const q = {
      id: Date.now().toString() + index,
      type: type,
      question: row.Question || row.question || '',
      marks: parseInt(row.Marks || row.marks) || (type === 'MCQ' ? 1 : type === 'THEORY' ? 5 : 10),
    };

    if (type === 'MCQ') {
      q.options = [
        row['Option A'] || row.optionA || row.option1 || '',
        row['Option B'] || row.optionB || row.option2 || '',
        row['Option C'] || row.optionC || row.option3 || '',
        row['Option D'] || row.optionD || row.option4 || ''
      ];
      // Convert correct option (A, B, C, D or 1, 2, 3, 4) to index 0-3
      let correct = row['Correct Option'] || row.correctOption || row.correct || 'A';
      if (typeof correct === 'string') {
        correct = correct.trim().toUpperCase();
        if (correct === 'A') q.correctOption = 0;
        else if (correct === 'B') q.correctOption = 1;
        else if (correct === 'C') q.correctOption = 2;
        else if (correct === 'D') q.correctOption = 3;
        else q.correctOption = parseInt(correct) - 1 || 0;
      } else {
        q.correctOption = parseInt(correct) - 1 || 0;
      }
    } else if (type === 'THEORY') {
      q.answer = row.Answer || row.answer || row['Expected Answer'] || '';
    } else if (type === 'CODING') {
      q.title = row.Title || row.title || row.Question || '';
      q.problemStatement = row.ProblemStatement || row.problemStatement || row.Question || '';
      q.inputFormat = row.InputFormat || row.inputFormat || '';
      q.outputFormat = row.OutputFormat || row.outputFormat || '';
      q.constraints = row.Constraints || row.constraints || '';
    }
    return q;
  }).filter(q => q.question || q.title);
}

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
