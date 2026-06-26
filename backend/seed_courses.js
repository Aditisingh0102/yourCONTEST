const fs = require('fs');
const dbPath = './db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (!db.courses || db.courses.length === 0) {
  db.courses = [
    {
      _id: "1",
      title: "Data Structures in Java",
      subject: "Computer Science",
      professor: "Prof. Alan Turing",
      progress: 30,
      tags: ["Java", "Algorithms", "DSA"],
      students: 820,
      modules: 15,
      status: "Published",
      rating: 4.8,
      color: "bg-purple-500",
      iconColor: "text-purple-500",
      bgLight: "bg-purple-50",
      createdAt: new Date().toISOString(),
      lectures: [
        { id: 1, title: 'Lecture 1: Introduction to Time Complexity', duration: '45 mins', completed: true },
        { id: 2, title: 'Lecture 2: Arrays and Strings deep dive', duration: '55 mins', completed: true },
        { id: 3, title: 'Lecture 3: Linked Lists implementations', duration: '1h 10m', completed: true },
        { id: 4, title: 'Lecture 4: Stacks & Queues', duration: '50 mins', completed: false },
        { id: 5, title: 'Lecture 5: Recursion and Backtracking', duration: '1h 20m', completed: false },
        { id: 6, title: 'Lecture 6: Trees and Graphs', duration: '2h', completed: false }
      ],
      documents: [
        { id: 1, title: 'Unit 1: Complexity Notes.pdf', size: '2.4 MB', type: 'PDF' },
        { id: 2, title: 'Unit 2: Linear Data Structures.pdf', size: '3.1 MB', type: 'PDF' },
        { id: 3, title: 'Cheat Sheet: Big O Notation.pdf', size: '1.1 MB', type: 'PDF' }
      ],
      tests: [
        { id: 101, title: 'Mid-Term Mock Test', type: 'Assessment', format: '40 MCQ + 3 Coding', status: 'Upcoming' },
        { id: 102, title: 'Unit 1 Quiz', type: 'Quiz', format: '15 MCQ', status: 'Live' },
        { id: 103, title: 'Arrays Practice Contest', type: 'Coding', format: '4 Coding Qs', status: 'Ended' }
      ]
    },
    {
      _id: "2",
      title: "Full-Stack Web Development",
      subject: "Computer Science",
      professor: "Prof. Ada Lovelace",
      progress: 65,
      tags: ["React", "Node", "MongoDB"],
      students: 450,
      modules: 12,
      status: "Published",
      rating: 4.9,
      color: "bg-blue-500",
      iconColor: "text-blue-500",
      bgLight: "bg-blue-50",
      createdAt: new Date().toISOString(),
      lectures: [],
      documents: [],
      tests: []
    },
    {
      _id: "3",
      title: "Machine Learning Basics",
      subject: "Artificial Intelligence",
      professor: "Prof. Geoffrey Hinton",
      progress: 10,
      tags: ["Python", "Neural Networks", "AI"],
      students: 120,
      modules: 8,
      status: "Draft",
      rating: 0,
      color: "bg-green-500",
      iconColor: "text-green-500",
      bgLight: "bg-green-50",
      createdAt: new Date().toISOString(),
      lectures: [],
      documents: [],
      tests: []
    }
  ];
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log('Seeded courses into db.json');
} else {
  console.log('Courses already exist in db.json');
}
