import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Cpu, Mic, Shield } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-lightGray font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-border flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-xl text-primary tracking-wide">Daruka</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm">Log In</Button>
          </Link>
          <Link to="/register">
            <Button variant="accent" size="sm">Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center text-center gap-8">
        <Badge variant="secondary" className="px-4 py-1.5 text-xs">
          🚀 Next-Gen AI Mock Interviews
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-primary max-w-3xl leading-tight">
          Master Your Next Tech Interview with <span className="text-accent bg-light px-2 rounded-lg">Daruka AI</span>
        </h1>
        
        <p className="text-gray text-base md:text-xl max-w-2xl leading-relaxed">
          An interactive local AI platform featuring voice questions, code sandboxes, and deep performance evaluation analytics.
        </p>

        <div className="flex items-center gap-4 mt-4">
          <Link to="/register">
            <Button size="lg" className="shadow-lg">Create Free Account</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">Try Demo Login</Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 md:mt-16 text-left">
          <Card hoverable className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-primary text-lg">Voice-First Questions</h3>
            <p className="text-gray text-sm">
              Speak your answers naturally. Whisper STT captures your response, evaluated by local LLMs.
            </p>
          </Card>

          <Card hoverable className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-primary text-lg">Code Sandboxes</h3>
            <p className="text-gray text-sm">
              Solve algorithmic coding questions directly within a secure, isolated sandbox environment.
            </p>
          </Card>

          <Card hoverable className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-primary text-lg">Detailed Evaluation</h3>
            <p className="text-gray text-sm">
              Receive complete performance metrics, score cards, and targeted tips to improve.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-6 text-center text-xs text-gray">
        &copy; {new Date().getFullYear()} Daruka Interview Bot. Powered by Local AI models (Ollama, Whisper, Piper).
      </footer>
    </div>
  )
}
