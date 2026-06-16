import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Mic, Terminal, Code, MessageSquare, AlertOctagon, HelpCircle } from 'lucide-react'

export default function ActiveInterview() {
  const [isRecording, setIsRecording] = useState(false)
  const [code, setCode] = useState(`def solve_complexity(n):
    # Write your solution here
    return 0
`)
  const [consoleOutput, setConsoleOutput] = useState('Console initialized. Click "Run Code" to compile in the sandbox.')
  const [language, setLanguage] = useState('python')
  
  const navigate = useNavigate()

  const handleRunCode = () => {
    setConsoleOutput('Compiling in Docker sandbox...\nSandbox result: OK\nsolve_complexity(10) returned 0\nExecution time: 0.04s')
  }

  const handleSpeakToggle = () => {
    setIsRecording(!isRecording)
  }

  const handleSubmitInterview = () => {
    navigate('/interview/feedback')
  }

  return (
    <div className="min-h-screen bg-lightGray font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-6 py-3 bg-white border-b border-border flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="px-3 py-1">Active Room</Badge>
          <span className="font-bold text-sm text-primary">Full Stack Mock Interview — Question 1 of 3</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-light border border-border px-3 py-1 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping" />
            <span className="text-xs font-bold text-primary font-mono">Timer: 24:15</span>
          </div>
          <Button variant="danger" size="sm" onClick={handleSubmitInterview}>
            Submit & Finish
          </Button>
        </div>
      </header>

      {/* Main Splitscreen Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-6 gap-6 overflow-hidden">
        
        {/* Left Side: Voice Assistant & Prompt */}
        <div className="flex flex-col gap-6 h-full justify-between">
          <Card className="flex-1 flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <span>Interviewer Prompts & Speech</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-left">
                <div className="p-4 rounded-xl border border-accent/20 bg-light/30">
                  <p className="text-sm text-primary font-medium leading-relaxed">
                    "Please write a function in Python that takes an integer `n` and returns its complexity representation. Then explain your design constraints and how your database index would handle lookup optimizations for this data."
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-lightGray rounded-xl text-xs text-gray border border-border">
                  <HelpCircle className="w-4 h-4 text-accent" />
                  <span>Tip: Speak clearly into your mic. Click the mic button to start recording your answer.</span>
                </div>
              </CardContent>
            </div>

            {/* Mic Controls */}
            <div className="p-5 border-t border-border flex flex-col items-center gap-3 bg-lightGray/30">
              <button
                onClick={handleSpeakToggle}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform focus:outline-none ${
                  isRecording 
                    ? 'bg-danger text-white animate-pulse scale-105' 
                    : 'bg-accent text-white hover:scale-105'
                }`}
                aria-label={isRecording ? "Stop speaking" : "Start speaking"}
              >
                <Mic className="w-8 h-8" />
              </button>
              <span className="text-xs font-semibold text-primary">
                {isRecording ? 'Listening... Click to Pause Answer' : 'Click Mic to Speak Answer'}
              </span>
            </div>
          </Card>
        </div>

        {/* Right Side: Coding IDE mock */}
        <div className="flex flex-col gap-6 h-full justify-between">
          <Card className="flex-1 flex flex-col justify-between overflow-hidden p-0">
            {/* Editor Header */}
            <div className="px-5 py-3 border-b border-border bg-lightGray flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Code className="w-4 h-4 text-accent" />
                Code Workspace
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs bg-white border border-border rounded px-2.5 py-1 text-primary focus:outline-none font-bold"
              >
                <option value="python">Python 3</option>
                <option value="java">Java 21</option>
              </select>
            </div>

            {/* Textarea Code block */}
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm bg-[#1A3A5C] text-[#D6EAF8] focus:outline-none resize-none"
                spellCheck="false"
              />
            </div>

            {/* Output console panel */}
            <div className="border-t border-border">
              <div className="px-5 py-2.5 bg-lightGray/70 flex items-center justify-between border-b border-border">
                <span className="text-[10px] uppercase font-extrabold text-primary flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  Terminal Output
                </span>
                <Button variant="accent" size="sm" onClick={handleRunCode} className="h-7 text-xs font-bold py-1">
                  Run Code
                </Button>
              </div>
              <pre className="p-4 bg-black text-[#85C1E9] font-mono text-xs text-left h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {consoleOutput}
              </pre>
            </div>
          </Card>
        </div>

      </main>

      {/* Footer Warning */}
      <footer className="bg-white border-t border-border py-3 px-6 text-center text-xs text-gray flex items-center justify-center gap-1.5">
        <AlertOctagon className="w-4 h-4 text-warning" />
        <span>Local sandbox restriction: Code has no internet access. Do not write destructive OS code.</span>
      </footer>
    </div>
  )
}
