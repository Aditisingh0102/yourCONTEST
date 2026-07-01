import { useState, useEffect } from 'react';
import { Search, BookOpen, CheckCircle2, Code, HelpCircle, Trophy } from 'lucide-react';
import { getContests } from '../../api';

const TYPE_CONFIG = {
  mcq: {
    label: 'MCQ',
    icon: CheckCircle2,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  theory: {
    label: 'Theory',
    icon: BookOpen,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  coding: {
    label: 'Coding',
    icon: Code,
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
};

export default function QuestionBank() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    async function fetchAllQuestions() {
      try {
        const res = await getContests();
        const contests = res.data || [];
        const aggregated = [];
        contests.forEach((contest) => {
          const qs = contest.questionList || [];
          qs.forEach((q) => {
            aggregated.push({
              ...q,
              contestName: contest.title || contest.name || 'Untitled Contest',
              contestId: contest._id || contest.id,
              contestStatus: contest.status || 'Unknown',
            });
          });
        });

        const unique = [];
        const seen = new Set();
        aggregated.forEach(q => {
           const identifier = q._id || q.id || q.question || q.title;
           if (!seen.has(identifier)) {
              seen.add(identifier);
              unique.push(q);
           }
        });
        setAllQuestions(unique);
      } catch (err) {
        console.error('Failed to fetch questions', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllQuestions();
  }, []);

  const filtered = allQuestions.filter((q) => {
    const text = (q.question || q.title || q.problemStatement || '').toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase()) ||
      q.contestName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || q.type === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const counts = {
    All: allQuestions.length,
    MCQ: allQuestions.filter((q) => q.type === 'mcq').length,
    Theory: allQuestions.filter((q) => q.type === 'theory').length,
    Coding: allQuestions.filter((q) => q.type === 'coding').length,
  };

  const getQuestionText = (q) => {
    if (q.type === 'mcq' || q.type === 'theory') return q.question || '—';
    if (q.type === 'coding') return q.title || q.problemStatement || '—';
    return '—';
  };

  const getStatusColor = (status) => {
    if (status === 'Live') return 'bg-red-50 text-red-600 border-red-200';
    if (status === 'Upcoming') return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Question Bank</h1>
          <p className="text-sm text-gray-500 mt-1">
            All questions from all your contests — in one place
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold">
          <BookOpen className="w-4 h-4" />
          {allQuestions.length} Total Questions
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(counts).map(([label, count]) => {
          const cfg = label === 'All' ? null : TYPE_CONFIG[label.toLowerCase()];
          const Icon = cfg ? cfg.icon : BookOpen;
          return (
            <button
              key={label}
              onClick={() => setFilterType(label)}
              className={`p-4 rounded-2xl border text-left transition-all shadow-sm font-semibold
                ${filterType === label
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white border-gray-100 hover:border-gray-300 text-gray-700'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${filterType === label ? 'text-white' : cfg ? cfg.text : 'text-gray-500'}`} />
                <span className="text-xs uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-2xl font-semibold">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by question text or contest name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm font-medium">
            Loading questions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-[15px] font-semibold text-gray-700 mb-1">No Questions Found</p>
            <p className="text-sm text-gray-400">
              {allQuestions.length === 0
                ? 'Create contests and add questions — they will appear here automatically.'
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        ) : (
          filtered.map((q, i) => {
            const cfg = TYPE_CONFIG[q.type] || TYPE_CONFIG.mcq;
            const Icon = cfg.icon;
            const questionText = getQuestionText(q);

            return (
              <div
                key={`${q.contestId}-${i}`}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border} border`}>
                    <Icon className={`w-5 h-5 ${cfg.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Type badge */}
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>

                      {/* Contest name */}
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                        <Trophy className="w-3 h-3" />
                        {q.contestName}
                      </span>

                      {/* Contest status */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusColor(q.contestStatus)}`}>
                        {q.contestStatus}
                      </span>

                      {/* Marks */}
                      <span className="ml-auto text-[12px] font-semibold text-gray-500">
                        {q.marks || 0} marks
                      </span>
                    </div>

                    {/* Question text */}
                    <p className="text-[14px] font-semibold text-gray-800 leading-snug line-clamp-2">
                      {questionText}
                    </p>

                    {/* MCQ options preview */}
                    {q.type === 'mcq' && q.options && (
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`text-[12px] px-3 py-1.5 rounded-lg border font-medium truncate
                              ${oi === q.correctOption
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                          >
                            {oi === q.correctOption && '✓ '}{opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Coding preview */}
                    {q.type === 'coding' && q.problemStatement && (
                      <p className="mt-2 text-[12px] text-gray-400 line-clamp-1">
                        {q.problemStatement}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
