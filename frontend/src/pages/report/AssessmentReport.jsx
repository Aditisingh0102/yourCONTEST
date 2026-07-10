import React, { useEffect, useState } from 'react';
import ReportHeader from './components/ReportHeader';
import SummaryGrid from './components/SummaryGrid';
import CodingResponse from './components/CodingResponse';
import { getSubmissions, getContests } from '../../api';

export default function AssessmentReport() {
  const [candidate, setCandidate] = useState({
    name: 'Student Name',
    testId: 'N/A',
    phone: 'N/A',
    email: 'N/A',
    testDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  });

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    let profileName = 'Student Name';
    const saved = sessionStorage.getItem('student_profile');
    if (saved) {
      const profile = JSON.parse(saved);
      profileName = profile.name || profileName;
      setCandidate({
        name: profileName,
        testId: profile.regNo || profile.rollNo || 'N/A',
        phone: profile.phone || 'N/A',
        email: profile.email || 'N/A',
        testDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      });
    }

    const fetchData = async () => {
      try {
        const [subRes, contRes] = await Promise.all([
          getSubmissions(),
          getContests()
        ]);

        const contests = contRes.data || [];
        const cmap = {};
        contests.forEach(c => {
          cmap[c.id || c._id] = c;
        });

        const mySubs = (subRes.data || []).filter(sub => sub.studentName === profileName);
        
        // Get the most recent submission
        mySubs.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        const latestSub = mySubs[0];

        if (!latestSub) {
           setReportData(null);
           setLoading(false);
           return;
        }

        const contest = cmap[latestSub.contestId];
        if (!contest || !contest.questionList) {
           setReportData(null);
           setLoading(false);
           return;
        }

        let mcqScore = 0;
        let mcqTotal = 0;
        let codingScore = 0;
        let codingTotal = 0;
        let theoryScore = 0;
        let theoryTotal = 0;

        const codingQuestions = [];

        contest.questionList.forEach(q => {
          const ans = latestSub.answers?.[q.id];
          const m = q.marks || 1;
          
          if (q.type === 'MCQ') {
             mcqTotal += m;
             if (ans === q.correctOption) {
               mcqScore += m;
             }
          } else if (q.type === 'Coding') {
             codingTotal += m;
             // We can't auto-grade coding easily here without an evaluator, 
             // but we'll show their submission in the CodingResponse component.
             // We will assign them full marks if they wrote anything, just for the sample report visual
             if (ans && ans.trim().length > 0) {
                 codingScore += m;
             }
             codingQuestions.push({
                 questionData: q,
                 studentAnswer: ans || ''
             });
          } else if (q.type === 'Theory') {
             theoryTotal += m;
             if (ans && ans.trim().length > 0) {
                 theoryScore += m;
             }
          }
        });

        const overallTotal = mcqTotal + codingTotal + theoryTotal;
        const overallScore = mcqScore + codingScore + theoryScore;

        setReportData({
            contestTitle: contest.title || latestSub.contestName || 'Assessment',
            scores: [
              { title: 'Overall Performance', score: overallScore, total: overallTotal || 100 },
              { title: 'MCQ (Multiple Choice)', score: mcqScore, total: mcqTotal || 100 },
              { title: 'Coding & Algorithms', score: codingScore, total: codingTotal || 100 },
              { title: 'Theory & Logic', score: theoryScore, total: theoryTotal || 100 },
            ],
            codingQuestions: codingQuestions
        });

      } catch (err) {
        console.error("Failed to fetch report data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
      return (
          <div className="max-w-[1000px] mx-auto py-32 text-center">
             <div className="text-xl font-semibold text-gray-500 animate-pulse">Loading Live Report Data...</div>
          </div>
      );
  }

  if (!reportData) {
      return (
          <div className="max-w-[1000px] mx-auto py-32 text-center px-4">
             <div className="text-2xl font-bold text-gray-800 mb-2">No Submissions Found</div>
             <p className="text-gray-500">You have not completed any assessments yet, so there is no live data to display in the report.</p>
          </div>
      );
  }

  return (
    <div className="max-w-[1000px] mx-auto py-8 bg-gray-100 min-h-screen px-4">
      {/* vDecided Logo area */}
      <div className="flex justify-end mb-6">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          <span className="text-orange-500">v</span>Decided
        </h2>
      </div>

      <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-300 pb-2">
             Assessment Report: <span className="text-blue-600">{reportData.contestTitle}</span>
          </h2>
      </div>

      <ReportHeader data={candidate} />
      
      <SummaryGrid scores={reportData.scores} />

      {reportData.codingQuestions.length > 0 && (
         <CodingResponse codingQuestions={reportData.codingQuestions} />
      )}

      <div className="mt-12 mb-8 text-center text-sm text-gray-500 font-medium border-t border-gray-300 pt-6">
        © {new Date().getFullYear()} vDecided Platform. All rights reserved.
      </div>
    </div>
  );
}
