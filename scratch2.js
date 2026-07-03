const fs = require('fs');
const path = '/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/frontend/src/pages/student/Arena.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add Sun, Moon, Coffee to lucide-react imports if not there
if (!content.includes('Sun,') && !content.includes('Sun ,')) {
    content = content.replace(/import { ChevronLeft/g, 'import { ChevronLeft, Sun, Moon, Coffee');
}

// Import useTheme
if (!content.includes('useTheme')) {
    content = content.replace(/import Leaderboard from '\.\.\/\.\.\/components\/Leaderboard';/g, "import Leaderboard from '../../components/Leaderboard';\nimport { useTheme } from '../../hooks/useTheme';");
}

// Add hook call inside Arena
if (!content.includes('const [theme, cycleTheme] = useTheme();')) {
    content = content.replace(/export default function Arena\(\) {/g, "export default function Arena() {\n  const [theme, cycleTheme] = useTheme();");
}

// Add the button to the header
const buttonHtml = `
          <button
            onClick={cycleTheme}
            className={\`
              relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 focus:outline-none
              \${theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-blue-300 hover:bg-slate-700'
                : theme === 'warm'
                ? 'bg-[#f6f3eb] border-[#e8e4d9] text-amber-700 hover:bg-[#eee8d5]'
                : 'bg-blue-50 border-blue-200 text-yellow-500 hover:bg-blue-100'}
            \`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'warm' ? <Coffee className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
`;

content = content.replace(/<div className="flex items-center gap-6">/g, '<div className="flex items-center gap-4">\n' + buttonHtml);

fs.writeFileSync(path, content, 'utf8');
console.log("Added theme toggle to Arena.jsx successfully.");
