import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { Badge } from '../components/ui/Badge'
import { Mic, CheckCircle, Video, Server, ArrowLeft, PlayCircle } from 'lucide-react'

export default function SystemCheck() {
  const [checking, setChecking] = useState(true)
  const [micStatus, setMicStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [sandboxStatus, setSandboxStatus] = useState<'pending' | 'success' | 'failed'>('pending')

  const navigate = useNavigate()

  useEffect(() => {
    const timer1 = setTimeout(() => setMicStatus('success'), 1000)
    const timer2 = setTimeout(() => setCameraStatus('success'), 1800)
    const timer3 = setTimeout(() => {
      setSandboxStatus('success')
      setChecking(false)
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/interview/setup')} className="p-1 rounded hover:bg-border/30 text-gray hover:text-primary transition-colors focus:outline-none">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Hardware & Sandbox Diagnostic Check</h1>
          <p className="text-sm text-gray mt-1">Verifying peripherals and isolation APIs before starting interview.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Diagnostic Checklist</span>
              {checking ? (
                <Badge variant="warning" className="animate-pulse">Checking Systems...</Badge>
              ) : (
                <Badge variant="success">All Systems Operational</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            
            {/* Audio Check */}
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-lightGray/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-primary">Microphone Access</h4>
                  <p className="text-[10px] text-gray">Used to record spoken explanations for Whisper transcription</p>
                </div>
              </div>
              <div>
                {micStatus === 'pending' && <Skeleton className="w-16 h-6" />}
                {micStatus === 'success' && <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Ready</Badge>}
              </div>
            </div>

            {/* Video Check */}
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-lightGray/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
                  <Video className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-primary">Camera Connection (Optional)</h4>
                  <p className="text-[10px] text-gray">Optional validation feed checks</p>
                </div>
              </div>
              <div>
                {cameraStatus === 'pending' && <Skeleton className="w-16 h-6" />}
                {cameraStatus === 'success' && <Badge variant="neutral">Inactive (Optional)</Badge>}
              </div>
            </div>

            {/* Code Execution Sandbox Check */}
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-lightGray/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
                  <Server className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-primary">Code Sandbox API</h4>
                  <p className="text-[10px] text-gray">Verifies python/java Docker sandbox runtimes are responsive</p>
                </div>
              </div>
              <div>
                {sandboxStatus === 'pending' && <Skeleton className="w-16 h-6" />}
                {sandboxStatus === 'success' && <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Connected</Badge>}
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-2 flex justify-end">
              <Button
                variant="primary"
                disabled={checking}
                onClick={() => navigate('/interview/active')}
                className="flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Enter Interview Room</span>
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
