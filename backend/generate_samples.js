const xlsx = require('xlsx');
const fs = require('fs');

const data = [
  {
    "Type": "MCQ",
    "Question": "What is the time complexity of binary search?",
    "Option A": "O(n)",
    "Option B": "O(n log n)",
    "Option C": "O(log n)",
    "Option D": "O(1)",
    "Correct Option": "C",
    "Marks": 2
  },
  {
    "Type": "THEORY",
    "Question": "Explain the concept of Polymorphism in OOP.",
    "Answer": "Polymorphism allows objects to be treated as instances of their parent class rather than their actual class. It usually involves method overriding or overloading.",
    "Marks": 5
  },
  {
    "Type": "CODING",
    "Title": "Two Sum",
    "ProblemStatement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "InputFormat": "First line contains n, the number of elements. Second line contains the elements. Third line contains the target.",
    "OutputFormat": "Print the two indices separated by space.",
    "Marks": 10
  }
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Questions");
xlsx.writeFile(wb, "sample_question_bank.xlsx");

const pdfText = `
1. What is the time complexity of binary search?
A) O(n)
B) O(n log n)
C) O(log n)
D) O(1)
Correct Option: C

2. Explain the concept of Polymorphism in OOP.
Answer: Polymorphism allows objects to be treated as instances of their parent class rather than their actual class.

3. Two Sum
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
`;
fs.writeFileSync("sample_question_bank.txt", pdfText);
console.log("Samples generated!");
