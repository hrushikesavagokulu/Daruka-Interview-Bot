import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Play, Settings, ClipboardList, HelpCircle } from 'lucide-react'

export default function InterviewSetup() {
  const [role, setRole] = useState('Full Stack Engineer')
  const [difficulty, setDifficulty] = useState('mid') // junior, mid, senior
  const [duration, setDuration] = useState(30)
  
  const navigate = useNavigate()

  const handleStartSetup = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to system check
    navigate('/interview/system-check')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Configure Mock Interview</h1>
        <p className="text-sm text-gray mt-1">Select topics, duration, and difficulty constraints for the AI Agent.</p>
      </div>

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
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-primary">Difficulty Setting</label>
                    <div className="flex gap-2">
                      {['junior', 'mid', 'senior'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`flex-1 py-2 rounded-lg border text-xs font-bold capitalize transition-colors ${
                            difficulty === level
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Interview Duration (Minutes)"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={10}
                    max={60}
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-primary">Resume Integration Context</label>
                    <div className="p-3 border border-border bg-lightGray/40 rounded-lg flex items-center justify-between text-xs text-primary">
                      <span>jane_doe_cv.pdf (Primary)</span>
                      <Badge variant="success">Linked</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" className="flex items-center gap-2">
                    <Play className="w-4 h-4 fill-white" />
                    <span>Proceed to System Check</span>
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
              <CardContent className="flex flex-col gap-4 text-xs text-gray">
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
