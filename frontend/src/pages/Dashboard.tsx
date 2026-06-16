import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Play, FileText, ClipboardList, Loader2 } from 'lucide-react'

import { useAuthStore } from '../store/authStore'
import { api } from '../config/api'

interface ProfileData {
  skills: string[]
  years_experience: number
  target_role: string | null
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Candidate'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get<ProfileData>('/profile')
        setProfile(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard profile info:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Hero Banner */}
      <div className="bg-primary text-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-primary">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, {firstName}! 👋</h1>
          <p className="text-light/80 text-sm mt-1">Ready to ace your technical coding and speaking interviews today?</p>
        </div>
        <Link to="/interview/setup">
          <Button variant="accent" className="font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 transform transition-transform">
            <Play className="w-4 h-4 fill-white" />
            <span>Start Mock Interview</span>
          </Button>
        </Link>
      </div>

      {/* Main Navigation Cards Grid - Required 3 Cards */}
      <div>
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Take Interview */}
          <Link to="/interview/setup" className="group">
            <Card hoverable className="h-full border border-border group-hover:border-accent group-hover:shadow-md transition-all flex flex-col justify-between p-1">
              <CardContent className="pt-5 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-light text-accent flex items-center justify-center transition-transform group-hover:scale-110">
                  <Play className="w-6 h-6 fill-accent" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors">Take Interview</h3>
                  <p className="text-xs text-gray mt-1 leading-normal">
                    Configure interview settings, complete system hardware checks, and start a realistic AI-evaluated mock interview.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 2: Resume & Profile */}
          <Link to="/profile" className="group">
            <Card hoverable className="h-full border border-border group-hover:border-accent group-hover:shadow-md transition-all flex flex-col justify-between p-1">
              <CardContent className="pt-5 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center transition-transform group-hover:scale-110">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors">Resume & Profile</h3>
                  <p className="text-xs text-gray mt-1 leading-normal">
                    Manage your target job preferences, add core technical skills, and upload resumes for AI context analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 3: Results */}
          <Link to="/results" className="group">
            <Card hoverable className="h-full border border-border group-hover:border-accent group-hover:shadow-md transition-all flex flex-col justify-between p-1">
              <CardContent className="pt-5 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center transition-transform group-hover:scale-110">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors">Results & Feedback</h3>
                  <p className="text-xs text-gray mt-1 leading-normal">
                    Browse evaluation results from past interviews, view performance metrics, and read tailored AI improvements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Profile Alert / Skills Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                📋 Candidate Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left">
              {loading ? (
                <div className="flex items-center gap-2 text-gray py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-xs">Loading profile skills...</span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray leading-relaxed">
                    {profile?.target_role ? (
                      <>
                        Your profile is customized for <strong className="text-primary">{profile.target_role}</strong> with <strong className="text-primary">{profile.years_experience} years</strong> of experience.
                      </>
                    ) : (
                      'Your profile is initialized. Please review your target role and skills under the Profile tab before starting mock interviews.'
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs py-1 px-2.5">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray italic">No skills specified yet. Upload a resume or add them manually in Profile.</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <Link to="/profile">
                      <Button variant="outline" size="sm">Manage Profile & Skills</Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">💡 Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-gray text-left">
              <div className="border-l-2 border-accent pl-3">
                <h4 className="font-semibold text-primary text-xs">Verify Microphone Settings</h4>
                <p className="text-[11px] text-gray mt-0.5 leading-snug">Always run the system check to make sure your microphone levels are optimal for whisper STT parsing.</p>
              </div>
              <div className="border-l-2 border-accent pl-3">
                <h4 className="font-semibold text-primary text-xs">Explain Your Thought Process</h4>
                <p className="text-[11px] text-gray mt-0.5 leading-snug">The AI evaluates communication clarity. Talk through your database joins or sorting algorithms aloud.</p>
              </div>
              <div className="border-l-2 border-accent pl-3">
                <h4 className="font-semibold text-primary text-xs">Sandbox Boundaries</h4>
                <p className="text-[11px] text-gray mt-0.5 leading-snug">The sandbox prevents network accesses and disk modifications. Stick to algorithms and system stdout.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
