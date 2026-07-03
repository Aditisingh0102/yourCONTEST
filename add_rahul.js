const fs = require('fs');
const path = '/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/frontend/src/pages/Login.jsx';
let content = fs.readFileSync(path, 'utf8');

const ambarBlockEnd = `      sessionStorage.removeItem('lastSeenNoticeId');
      window.dispatchEvent(new Event('profile-updated'));
      navigate('/student/dashboard');
    }`;

const rahulBlock = ` else if (erpId === '23210101001@uudoon.in') {
      initializeLightTheme();
      sessionStorage.setItem('student_profile', JSON.stringify({
        id: '23210101001',
        name: 'Rahul Rawat',
        rollNo: '23210101001',
        regNo: 'UU23104300',
        branch: 'B.Tech CSE',
        semester: '7th Semester',
        email: '23210101001@uudoon.in',
        phone: '+91 98765 11111',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Rawat&background=0D8ABC&color=fff&size=128',
        role: 'student',
        joinDate: 'August 2023',
        batch: 'Alpha-2'
      }));
      sessionStorage.removeItem('lastSeenNoticeId');
      window.dispatchEvent(new Event('profile-updated'));
      navigate('/student/dashboard');
    }`;

if (!content.includes('Rahul Rawat')) {
    content = content.replace(ambarBlockEnd, ambarBlockEnd + rahulBlock);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Added Rahul Rawat.");
} else {
    console.log("Rahul Rawat already exists.");
}
