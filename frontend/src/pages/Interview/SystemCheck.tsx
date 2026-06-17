import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Mic, CheckCircle, Video, Server, ArrowLeft, PlayCircle, Loader2, Monitor } from 'lucide-react'
import { api } from '../../config/api'

export default function SystemCheck() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Retrieve passed state parameters from Setup page
  const sessionId = location.state?.sessionId
  const role = location.state?.role
  const experience = location.state?.experience

  // Redirect if navigated to directly without setting up a session
  useEffect(() => {
    if (!sessionId) {
      navigate('/interview/setup')
    }
  }, [sessionId, navigate])

  const [micStatus, setMicStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [sandboxStatus, setSandboxStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [micLevel, setMicLevel] = useState(0) // 0 to 100 for mic volume level indicator

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    // 1. Diagnose Sandbox API connection
    checkSandboxApi()

    // 2. Setup fullscreen change listeners
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      stopMediaStreams()
    }
  }, [])

  const checkSandboxApi = async () => {
    try {
      // Send a lightweight health check to sandbox or API
      await api.get('/health')
      setSandboxStatus('success')
    } catch (err) {
      console.error('Sandbox connection check failed:', err)
      setSandboxStatus('failed')
    }
  }

  const stopMediaStreams = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  // Request media permissions (Mic & Camera)
  const requestHardwareAccess = async () => {
    setErrorMsg(null)
    setMicStatus('pending')
    setCameraStatus('pending')
    stopMediaStreams()

    try {
      // Request both audio and video
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 480, height: 360 }
      })
      mediaStreamRef.current = stream

      // 1. Configure camera preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraStatus('success')

      // 2. Configure microphone analyzer for volume meter
      setMicStatus('success')
      setupAudioMeter(stream)
    } catch (err: any) {
      console.error('Media permission request failed:', err)
      
      // Pinpoint failure target
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setErrorMsg('Camera and Microphone permissions were denied. Please allow browser access to proceed.')
      } else {
        setErrorMsg('Could not find active camera or microphone peripherals. Check connections.')
      }
      setMicStatus('failed')
      setCameraStatus('failed')
    }
  }

  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioCtx = new AudioContextClass()
      audioContextRef.current = audioCtx
      
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        
        // Compute average sound levels
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength
        
        // Scale and smooth volume values (0-100 scale)
        const targetLevel = Math.min(100, Math.floor((average / 128) * 100))
        setMicLevel(targetLevel)

        animationFrameRef.current = requestAnimationFrame(draw)
      }
      draw()
    } catch (audioErr) {
      console.error('Audio meter setup failed:', audioErr)
    }
  }

  const handleEnterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (err) {
      console.error('Failed to trigger fullscreen:', err)
      setErrorMsg('Failed to enter fullscreen. Please maximize browser window manually.')
    }
  }

  const handleBeginInterview = () => {
    if (micStatus !== 'success' || cameraStatus !== 'success' || !isFullscreen) {
      return
    }
    
    // Stop local previews before routing
    stopMediaStreams()

    // Redirect to active interview session passing the token and setup parameters
    navigate('/interview/active', {
      state: {
        sessionId,
        role,
        experience
      }
    })
  }

  const isEverythingReady = micStatus === 'success' && cameraStatus === 'success' && sandboxStatus === 'success' && isFullscreen

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/interview/setup')} 
          className="p-1 rounded hover:bg-border/30 text-gray hover:text-primary transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Hardware & Sandbox Diagnostic Check</h1>
          <p className="text-sm text-gray mt-1">Verify recording peripherals and active sandbox connectivity before launching session.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-semibold text-left">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto w-full">
        {/* Hardware Status Lists */}
        <div className="lg:col-span-3">
          <Card className="shadow-md h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Hardware Checklist</span>
                  {!isEverythingReady ? (
                    <Badge variant="warning">Setup Pending</Badge>
                  ) : (
                    <Badge variant="success">All Systems Ready</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                
                {/* 1. Request Hardware Permissions Trigger */}
                <div className="flex flex-col p-4 border border-border rounded-xl bg-lightGray/20 gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-xs font-bold text-primary block">Step 1: Test Media Devices</span>
                      <span className="text-[10px] text-gray block mt-0.5">Prompt browser camera/mic permissions to initialize live feeds.</span>
                    </div>
                    <Button 
                      onClick={requestHardwareAccess} 
                      variant="outline" 
                      size="sm"
                      className="text-xs focus:outline-none border-accent/40 text-accent hover:bg-accent/5 font-semibold"
                    >
                      Test Devices
                    </Button>
                  </div>

                  {/* Volume Level Meter Bar */}
                  {micStatus === 'success' && (
                    <div className="flex flex-col gap-1 mt-2 text-left bg-lightGray/40 p-2.5 rounded-lg border border-border/40">
                      <span className="text-[9px] font-bold text-primary uppercase">Mic Volume Indicator</span>
                      <div className="w-full bg-[#E0E0E0] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-success h-full transition-all duration-75"
                          style={{ width: `${micLevel}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Items */}
                <div className="flex flex-col gap-2.5">
                  {/* Microphone Status Display */}
                  <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-lightGray/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-light flex items-center justify-center text-accent">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-primary block">Microphone Connection</span>
                        <span className="text-[10px] text-gray">Used to record candidate audio answers.</span>
                      </div>
                    </div>
                    <div>
                      {micStatus === 'pending' && <span className="text-xs text-gray">Waiting for test...</span>}
                      {micStatus === 'success' && <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Checked</Badge>}
                      {micStatus === 'failed' && <Badge variant="danger">Blocked</Badge>}
                    </div>
                  </div>

                  {/* Camera Status Display */}
                  <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-lightGray/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-light flex items-center justify-center text-accent">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-primary block">Camera Preview</span>
                        <span className="text-[10px] text-gray">Displays validation video output.</span>
                      </div>
                    </div>
                    <div>
                      {cameraStatus === 'pending' && <span className="text-xs text-gray">Waiting for test...</span>}
                      {cameraStatus === 'success' && <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Checked</Badge>}
                      {cameraStatus === 'failed' && <Badge variant="danger">Blocked</Badge>}
                    </div>
                  </div>

                  {/* Code Sandbox Status */}
                  <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-lightGray/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-light flex items-center justify-center text-accent">
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-primary block">Docker Sandbox API</span>
                        <span className="text-[10px] text-gray">Verifies backend execution sandbox is responsive.</span>
                      </div>
                    </div>
                    <div>
                      {sandboxStatus === 'pending' && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                      {sandboxStatus === 'success' && <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Online</Badge>}
                      {sandboxStatus === 'failed' && <Badge variant="danger">Offline</Badge>}
                    </div>
                  </div>

                  {/* Fullscreen Guard Status */}
                  <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-lightGray/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-light flex items-center justify-center text-accent">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-primary block">Step 2: Fullscreen Focus Guard</span>
                        <span className="text-[10px] text-gray">Required during the session to restrict focus switching.</span>
                      </div>
                    </div>
                    <div>
                      {isFullscreen ? (
                        <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Active</Badge>
                      ) : (
                        <Button
                          onClick={handleEnterFullscreen}
                          variant="outline"
                          size="sm"
                          className="text-[10px] py-1 border-accent/40 text-accent font-semibold focus:outline-none"
                        >
                          Request Fullscreen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Launch Block */}
            <div className="p-5 border-t border-border mt-4">
              <Button
                variant="primary"
                disabled={!isEverythingReady}
                onClick={handleBeginInterview}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-md focus:outline-none"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Begin Active Mock Interview</span>
              </Button>
              {!isEverythingReady && (
                <p className="text-[10px] text-gray text-center mt-2 italic leading-none">
                  Please enable camera/mic test and toggle fullscreen focus mode above to unlock entry.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Video Camera Live Feed Preview Card */}
        <div className="lg:col-span-2">
          <Card className="h-full bg-primary border-border flex flex-col justify-between overflow-hidden">
            <CardHeader className="border-b border-border/10 bg-[#112841] py-3.5 px-4 text-left">
              <CardTitle className="text-xs text-white tracking-wider uppercase font-semibold flex items-center gap-1.5">
                <span>📹 Live Diagnostic View</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-black flex-1 flex items-center justify-center relative min-h-[260px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]" // mirror effect
              />
              {cameraStatus !== 'success' && (
                <div className="absolute inset-0 bg-primary/95 flex flex-col items-center justify-center p-6 text-center text-white gap-2">
                  <span className="text-3xl block mb-1">📷</span>
                  <span className="text-xs font-bold">Camera feed is currently inactive.</span>
                  <span className="text-[10px] text-mid/80 max-w-[200px] leading-relaxed">
                    Click "Test Devices" on the checklist panel to initialize hardware diagnostics.
                  </span>
                </div>
              )}
            </CardContent>
            <div className="p-4 bg-[#141414] border-t border-white/5">
              <p className="text-[10px] text-gray text-center leading-normal">
                Feed is processed strictly inside your browser environment and is not sent to external servers.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
