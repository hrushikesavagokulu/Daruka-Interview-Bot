import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Play, FileText, ClipboardList, Calendar } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Hero Banner */}
      <div className="bg-primary text-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-primary">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, Jane! 👋</h1>
          <p className="text-light/80 text-sm mt-1">Ready to ace your technical coding and speaking interviews today?</p>
        </div>
        <Link to="/interview/setup">
          <Button variant="accent" className="font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 transform transition-transform">
            <Play className="w-4 h-4 fill-white" />
            <span>Start Mock Interview</span>
          </Button>
        </Link>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-light flex items-center justify-center text-accent">
            <Play className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-gray">Interviews Taken</p>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">N/A</p>
            <p className="text-xs text-gray">Average Score</p>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-light flex items-center justify-center text-accent">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">1</p>
            <p className="text-xs text-gray">Resumes Uploaded</p>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">Just Now</p>
            <p className="text-xs text-gray">Last Activity</p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Recommended Action & Past Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Alert */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                📋 Candidate Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-gray">
                Your profile is initialized. Please review your target role, years of experience, and technical skills under the profile tab before starting your mock interviews to ensure the AI adapts correctly.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Node.js</Badge>
                <Badge variant="secondary">MySQL</Badge>
              </div>
              <div className="mt-2">
                <Link to="/profile">
                  <Button variant="outline" size="sm">Edit Target Skills</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Past Attempts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🕒 Recent Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-gray text-sm">
                <p className="mb-2">No interviews found. Your past attempts will appear here.</p>
                <Link to="/interview/setup">
                  <Button variant="outline" size="sm">Configure Interview</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="flex flex-col gap-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">💡 Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-gray">
              <div className="border-l-2 border-accent pl-3">
                <h4 className="font-semibold text-primary text-xs">Verify Microphone Settings</h4>
                <p className="text-xs text-gray mt-0.5">Always run the system check to make sure your microphone levels are optimal for whisper STT parsing.</p>
              </div>
              <div className="border-l-2 border-accent pl-3">
                <h4 className="font-semibold text-primary text-xs">Explain Your Thought Process</h4>
                <p className="text-xs text-gray mt-0.5">The AI evaluates communication clarity. Talk through your database joins or sorting algorithms aloud.</p>
              </div>
              <div className="border-l-2 border-accent pl-3">
                <h4 className="font-semibold text-primary text-xs">Sandbox Boundaries</h4>
                <p className="text-xs text-gray mt-0.5">The sandbox prevents network accesses and disk modifications. Stick to algorithms and system stdout.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
