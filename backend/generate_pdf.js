const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('sample_question_bank.pdf'));

doc.fontSize(20).text('Sample Question Bank', { align: 'center' });
doc.moveDown();

doc.fontSize(12).text('1. What is the time complexity of binary search?');
doc.text('a) O(n)');
doc.text('b) O(n log n)');
doc.text('c) O(log n)');
doc.text('d) O(1)');
doc.text('Answer: c');
doc.moveDown();

doc.text('2. Explain the concept of Polymorphism in OOP.');
doc.text('Answer: Polymorphism allows objects to be treated as instances of their parent class.');
doc.moveDown();

doc.text('3. Two Sum');
doc.text('Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.');

doc.end();
console.log('PDF generated!');
