import { useParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, Award, FileDown, MessageSquare, Code, ThumbsUp, AlertCircle } from 'lucide-react'

export default function ResultDetail() {
  const { id } = useParams()

  // Mock detailed report evaluation data
  const reportDetails = {
    id: id || 'rpt_1',
    role: 'Full Stack Engineer',
    overallScore: 84.5,
    technicalScore: 88,
    communicationScore: 78,
    date: 'June 15, 2026',
    strengths: [
      'Strong knowledge of React hooks and state optimizations.',
      'Clear, modular API database layer structure.',
      'Good articulation of asynchronous state management concepts.',
    ],
    weaknesses: [
      'Missing edge case checks in the custom password validation schema.',
      'Could improve memory efficiency when handling large Redis key cycles.',
    ],
    transcript: [
      { question: 'Describe how you handle connection pool recycling in SQL Alchemy.', answer: 'I configure pool_recycle limits and leverage get_session_factory for scopes.' },
      { question: 'Write a function that validates password complexity.', answer: 'Implemented complex character verification in Pydantic custom field validators.' }
    ]
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top action links */}
      <div className="flex items-center justify-between">
        <Link to="/results" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <FileDown className="w-4 h-4" />
          <span>Download PDF Report</span>
        </Button>
      </div>

      {/* Main Score Hero Card */}
      <Card className="bg-white">
        <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center text-success">
              <Award className="w-8 h-8" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-gray uppercase font-bold tracking-wider">Report Assessment</span>
              <h2 className="text-xl md:text-2xl font-black text-primary">{reportDetails.role}</h2>
              <span className="text-xs text-gray">Evaluated on {reportDetails.date}</span>
            </div>
          </div>

          <div className="text-center md:text-right flex flex-col items-center md:items-end gap-1">
            <span className="text-xs text-gray font-bold uppercase tracking-wider">Overall Score</span>
            <span className="text-4xl font-black text-success leading-none">{reportDetails.overallScore}%</span>
            <Badge variant="success" className="mt-1">Pass Recommendation</Badge>
          </div>
        </div>
      </Card>

      {/* Breakdown Scores & Strengths/Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric Scores */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📊 Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-primary mb-1">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-accent" />
                    Technical Coding
                  </span>
                  <span>{reportDetails.technicalScore}/100</span>
                </div>
                <ProgressBar value={reportDetails.technicalScore} color="accent" />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-primary mb-1">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-success" />
                    Communication Clarity
                  </span>
                  <span>{reportDetails.communicationScore}/100</span>
                </div>
                <ProgressBar value={reportDetails.communicationScore} color="success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">💡 Evaluation Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {/* Strengths */}
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-success flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <ThumbsUp className="w-4 h-4" />
                  Key Strengths
                </h4>
                <ul className="flex flex-col gap-2 text-xs text-gray pl-4 list-disc">
                  {reportDetails.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-warning flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  Areas to Improve
                </h4>
                <ul className="flex flex-col gap-2 text-xs text-gray pl-4 list-disc">
                  {reportDetails.weaknesses.map((weak, idx) => (
                    <li key={idx}>{weak}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interview Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">💬 Q&A Dialog Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {reportDetails.transcript.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-border bg-lightGray/30 flex flex-col gap-2">
              <p className="text-xs font-extrabold text-primary">Q{idx + 1}: {item.question}</p>
              <p className="text-xs text-gray bg-white p-3 rounded-lg border border-border/50">
                <strong className="text-accent text-[10px] uppercase block mb-1">Your Answer:</strong>
                {item.answer}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
