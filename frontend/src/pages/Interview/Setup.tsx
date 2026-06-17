import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Play, Settings, ClipboardList, HelpCircle, FileText, Loader2, AlertTriangle } from 'lucide-react'
import { api } from '../../config/api'

interface ResumeData {
  id: number
  name: string
  parse_status: string
}

interface ProfileData {
  target_role: string | null
  years_experience: number
}

export default function InterviewSetup() {
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState<'junior' | 'mid' | 'senior'>('mid')
  const [resumeId, setResumeId] = useState<number | ''>('')
  
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Fetch user profile to pre-fill Target Role and Difficulty
      const profileRes = await api.get<ProfileData>('/profile')
      const targetRole = profileRes.data.target_role || ''
      setRole(targetRole)
      
      const years = profileRes.data.years_experience || 0
      if (years >= 6) {
        setExperience('senior')
      } else if (years >= 2) {
        setExperience('mid')
      } else {
        setExperience('junior')
      }

      // 2. Fetch user resumes
      const resumesRes = await api.get<ResumeData[]>('/resume')
      const parsedResumes = resumesRes.data.filter(r => r.parse_status === 'done')
      setResumes(resumesRes.data)
      
      // Select the first parsed resume by default
      if (parsedResumes.length > 0) {
        setResumeId(parsedResumes[0].id)
      } else if (resumesRes.data.length > 0) {
        setResumeId(resumesRes.data[0].id)
      }
    } catch (err: any) {
      console.error('Failed to load setup configurations:', err)
      setError('Failed to fetch profile settings or resumes. Please verify connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim()) {
      setError('Please fill in a target professional role.')
      return
    }
    if (resumeId === '') {
      setError('A valid PDF resume is required. Please upload one in the profile panel.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create session in backend
      const response = await api.post<{ session_id: number }>('/interview/session/start', {
        resume_id: resumeId,
        role: role.trim(),
        experience: experience
      })
      
      // Pass the session parameters forward to system checks
      navigate('/interview/system-check', {
        state: {
          sessionId: response.data.session_id,
          role: role.trim(),
          experience: experience
        }
      })
    } catch (err: any) {
      console.error('Failed to start interview session:', err)
      const errMsg = err.response?.data?.detail || 'Failed to initialize session. Please check connection.'
      setError(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
        <span className="text-xs text-gray">Loading interview configuration settings...</span>
      </div>
    )
  }

  const hasNoResumes = resumes.length === 0
  const hasPendingResumes = resumes.length > 0 && !resumes.some(r => r.parse_status === 'done')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Configure Mock Interview</h1>
        <p className="text-sm text-gray mt-1">Select target job title, experience tier, and context resume to initialize AI evaluation scoping.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-semibold text-left">
          {error}
        </div>
      )}

      {hasNoResumes && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs text-left">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold block">No Resume Detected</span>
            You must upload a PDF resume to provide context scoping for AI questions. 
            {' '}<Link to="/profile" className="underline font-bold text-primary hover:text-accent">Upload Resume in Profile</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Configuration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                <span>Session Parameters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartSetup} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Target Professional Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Backend developer, Frontend engineer"
                    required
                  />

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-primary">Target Experience Tier</label>
                    <div className="flex gap-2">
                      {(['junior', 'mid', 'senior'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          disabled={hasNoResumes}
                          onClick={() => setExperience(level)}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold capitalize transition-colors focus:outline-none ${
                            hasNoResumes ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            experience === level
                              ? 'bg-accent text-white border-accent'
                              : 'bg-lightGray border-border text-primary hover:bg-light'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-primary">Context Resume Select</label>
                    <select
                      value={resumeId}
                      onChange={(e) => setResumeId(Number(e.target.value) || '')}
                      disabled={hasNoResumes}
                      className="bg-lightGray border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-primary focus:outline-none focus:border-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasNoResumes && <option value="">No resumes available</option>}
                      {resumes.map((res) => (
                        <option key={res.id} value={res.id}>
                          {res.name} ({res.parse_status})
                        </option>
                      ))}
                    </select>
                    {hasPendingResumes && (
                      <span className="text-[10px] text-warning italic mt-0.5">Note: Recommending a fully 'parsed' status resume.</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-primary">Active Mode Verification</label>
                    <div className="p-3 border border-border bg-lightGray/40 rounded-xl flex items-center justify-between text-xs text-primary">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-accent" />
                        <span>Interactive Sandbox + Voice Evaluation</span>
                      </span>
                      <Badge variant="success">Standard</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || hasNoResumes}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Launching...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Proceed to System Check</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Informational Guidelines Card */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 text-accent" />
                  <span>Interview Specs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs text-gray text-left">
                <div>
                  <h4 className="font-bold text-primary">1. Voice Verification Questions</h4>
                  <p className="mt-0.5 leading-normal">The interviewer will ask questions using voice output. Whisper STT compiles your spoken audio responses.</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary">2. Realtime Code Execution</h4>
                  <p className="mt-0.5 leading-normal">Solve data structures and algorithmic challenges. The code is executed in isolated sandboxes to verify results.</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary">3. Strict Local Execution</h4>
                  <p className="mt-0.5 leading-normal">All models, datasets, code runs, and transcription processes occur directly on your local computer to guarantee data privacy.</p>
                </div>
              </CardContent>
            </div>
            
            <div className="p-5 border-t border-border mt-4">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-light text-[10px] text-primary">
                <ClipboardList className="w-4 h-4 text-accent" />
                <span>Ready to configure? Click proceed to diagnose hardware.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
