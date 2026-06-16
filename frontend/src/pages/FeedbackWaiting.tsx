import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Cpu, Loader2, Sparkles, MessageSquare, Code } from 'lucide-react'

export default function FeedbackWaiting() {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('whisper') // whisper, coding, ollama, report
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress < 30) {
      setStage('whisper')
    } else if (progress < 60) {
      setStage('coding')
    } else if (progress < 90) {
      setStage('ollama')
    } else if (progress === 100) {
      setStage('report')
      // Redirect to reports page
      const redirectTimer = setTimeout(() => {
        navigate('/results/rpt_1')
      }, 1000)
      return () => clearTimeout(redirectTimer)
    }
  }, [progress, navigate])

  const stageTitles = {
    whisper: 'Transcribing voice audio using local Whisper model...',
    coding: 'Analyzing coding answer and syntax execution in Docker sandbox...',
    ollama: 'Processing communication clarity and scoring parameters via Ollama LLM...',
    report: 'Creating final assessment performance report...',
  }

  return (
    <div className="min-h-screen bg-lightGray font-sans flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-lg text-center p-6">
        <CardHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-light flex items-center justify-center text-accent mb-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <CardTitle>Evaluating Answers</CardTitle>
          <p className="text-xs text-gray mt-1">Please wait while the local AI agents compile your results.</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 mt-2">
          {/* Progress Indicator */}
          <ProgressBar value={progress} showValue color="accent" />

          {/* Current Evaluation Stage details */}
          <div className="p-4 rounded-xl border border-border bg-lightGray/40 text-left min-h-[90px] flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-light flex items-center justify-center text-accent">
              {stage === 'whisper' && <MessageSquare className="w-4 h-4" />}
              {stage === 'coding' && <Code className="w-4 h-4" />}
              {stage === 'ollama' && <Cpu className="w-4 h-4" />}
              {stage === 'report' && <Sparkles className="w-4 h-4" />}
            </div>
            <p className="text-xs font-semibold text-primary leading-normal">
              {stageTitles[stage as keyof typeof stageTitles]}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
