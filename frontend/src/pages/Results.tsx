import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Calendar, Award, ChevronRight, Clock } from 'lucide-react'

export default function Results() {
  // Mock list of past interview reports
  const reports = [
    {
      id: 'rpt_1',
      role: 'Full Stack Engineer',
      date: 'June 15, 2026',
      duration: '35 mins',
      score: 84.5,
      status: 'completed',
    },
    {
      id: 'rpt_2',
      role: 'Frontend Developer',
      date: 'June 10, 2026',
      duration: '40 mins',
      score: 72.0,
      status: 'completed',
    },
    {
      id: 'rpt_3',
      role: 'Backend Systems Developer',
      date: 'June 01, 2026',
      duration: '15 mins',
      score: 0.0,
      status: 'aborted',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Interview Results & History</h1>
        <p className="text-sm text-gray mt-1">Review comprehensive evaluations, question transcripts, and coding reports.</p>
      </div>

      <div className="flex flex-col gap-4">
        {reports.map((report) => (
          <Card key={report.id} hoverable className="p-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-light flex items-center justify-center text-accent flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="font-bold text-primary text-base leading-snug">{report.role}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {report.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {report.duration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-border pt-4 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-gray uppercase font-bold tracking-wider block">Overall Score</span>
                  {report.status === 'completed' ? (
                    <span className="text-xl font-black text-success">{report.score}%</span>
                  ) : (
                    <Badge variant="neutral" className="mt-0.5">Aborted</Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {report.status === 'completed' ? (
                    <Badge variant="success" className="hidden xs:inline-flex">Evaluated</Badge>
                  ) : (
                    <Badge variant="danger" className="hidden xs:inline-flex">Incomplete</Badge>
                  )}
                  
                  {report.status === 'completed' ? (
                    <Link to={`/results/${report.id}`}>
                      <Button variant="accent" size="sm" className="flex items-center gap-1">
                        <span>Report</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      No Report
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12 bg-white border border-border rounded-xl">
            <span className="text-4xl block mb-2">📊</span>
            <p className="text-sm text-gray">No past evaluation reports found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
