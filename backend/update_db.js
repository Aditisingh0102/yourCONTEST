const fs = require('fs');
const path = '/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/backend/db.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const course2Index = data.courses.findIndex(c => c._id === "2");
if (course2Index !== -1) {
  data.courses[course2Index].lectures = [
    { "id": 1, "title": "Lecture 1: Introduction to React & JSX", "duration": "50 mins", "completed": true },
    { "id": 2, "title": "Lecture 2: State and Props in React", "duration": "1h 5m", "completed": true },
    { "id": 3, "title": "Lecture 3: React Hooks Deep Dive", "duration": "1h 20m", "completed": true },
    { "id": 4, "title": "Lecture 4: Building a Node.js API", "duration": "1h 15m", "completed": false },
    { "id": 5, "title": "Lecture 5: Express.js Routing", "duration": "55 mins", "completed": false },
    { "id": 6, "title": "Lecture 6: MongoDB Integration", "duration": "1h 30m", "completed": false }
  ];

  data.courses[course2Index].documents = [
    { "id": 1, "title": "React Cheatsheet.pdf", "size": "1.5 MB", "type": "PDF" },
    { "id": 2, "title": "Node.js Best Practices.pdf", "size": "2.1 MB", "type": "PDF" },
    { "id": 3, "title": "MongoDB Schema Design.pdf", "size": "3.4 MB", "type": "PDF" }
  ];

  data.courses[course2Index].tests = [
    { "id": 201, "title": "Frontend React Assessment", "type": "Assessment", "format": "30 MCQ + 2 Coding", "status": "Upcoming" },
    { "id": 202, "title": "Node.js Basics Quiz", "type": "Quiz", "format": "20 MCQ", "status": "Live" },
    { "id": 203, "title": "Full-Stack Project Submission", "type": "Coding", "format": "1 Project", "status": "Ended" }
  ];

  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log("Updated course 2");
}
