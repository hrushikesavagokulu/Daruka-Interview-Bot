import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { useMonacoTheme } from '../../hooks/useMonacoTheme'
import { api } from '../../config/api'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Play, Loader2, RefreshCw, AlertCircle, CheckCircle, Terminal } from 'lucide-react'

const STARTER_CODES = {
  python: `# Write your Python 3 code here\nprint("Hello from Python secure sandbox!")\n`,
  java: `// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java secure sandbox!");\n    }\n}\n`
}

interface RunResult {
  stdout: string
  stderr: string
  exit_code: number | null
  timed_out: boolean
}

export default function MonacoWrapper() {
  const { isThemeLoaded, themeName } = useMonacoTheme()
  const [language, setLanguage] = useState<'python' | 'java'>('python')
  const [code, setCode] = useState(STARTER_CODES.python)
  const [stdin, setStdin] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Update boilerplate when switching language
  const handleLanguageChange = (lang: 'python' | 'java') => {
    setLanguage(lang)
    setCode(STARTER_CODES[lang])
    setResult(null)
    setError(null)
  }

  const handleReset = () => {
    setCode(STARTER_CODES[language])
    setResult(null)
    setError(null)
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setError(null)
    try {
      const response = await api.post<RunResult>('/coding/run', {
        language,
        code,
        stdin: stdin.trim() || null
      })
      setResult(response.data)
    } catch (err: any) {
      console.error('Failed to run code:', err)
      const errMsg = err.response?.data?.detail || 'An error occurred while calling the code execution sandbox.'
      setError(errMsg)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full h-[calc(100vh-120px)] min-h-[500px]">
      {/* ── Control Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-primary text-white rounded-2xl border border-border shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-lg font-bold shadow-inner">
            💻
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-left">Secure Coding Sandbox</h2>
            <p className="text-[11px] text-mid">Write, compile, and execute code within strict local resource constraints.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language selection dropdown */}
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] text-mid uppercase font-bold tracking-wide">Language</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as 'python' | 'java')}
              className="bg-primary border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="python">Python 3.11</option>
              <option value="java">Java 21 (Temurin)</option>
            </select>
          </div>

          <div className="flex items-end self-end h-full">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 py-2 border-border hover:bg-light/10 text-white font-medium focus:outline-none mr-2"
              title="Reset to boilerplate"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>

            <Button
              onClick={handleRunCode}
              variant="accent"
              size="sm"
              disabled={isRunning}
              className="flex items-center gap-1.5 py-2 font-bold focus:outline-none shadow-md shadow-accent/20"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Sandbox</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Editor & Output Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* Monaco Editor Container */}
        <div className="lg:col-span-2 flex flex-col h-full bg-primary rounded-2xl overflow-hidden border border-border shadow-inner">
          <div className="px-4 py-2 border-b border-border bg-[#112841] flex items-center justify-between">
            <span className="text-xs font-semibold text-mid">
              {language === 'python' ? '🐍 script.py' : '☕ Main.java'}
            </span>
            <span className="text-[10px] text-gray uppercase tracking-wider font-bold">Read-Only Mount (/code)</span>
          </div>

          <div className="flex-1 w-full relative min-h-[300px]">
            {isThemeLoaded ? (
              <Editor
                height="100%"
                language={language}
                theme={themeName}
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: 'Fira Code, Source Code Pro, Courier New, monospace',
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                  },
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  lineHeight: 20,
                  padding: { top: 12, bottom: 12 }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-mid gap-2 bg-primary">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <span className="text-xs">Loading editor container...</span>
              </div>
            )}
          </div>
        </div>

        {/* Inputs & Output Telemetry Panel */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          {/* Stdin Panel */}
          <Card className="flex flex-col h-[40%] min-h-[140px]">
            <CardHeader className="py-3 px-4 border-b border-border/30 bg-lightGray/10">
              <CardTitle className="text-xs text-primary flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Standard Input (stdin)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2 bg-[#F8F9F9] rounded-b-2xl">
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Provide standard inputs here (one per line) for scripts that read from standard input..."
                className="w-full h-full text-xs p-3 border-0 bg-transparent focus:outline-none resize-none font-mono text-primary leading-normal"
              />
            </CardContent>
          </Card>

          {/* Stderr/Stdout Output Panel */}
          <Card className="flex flex-col flex-1 min-h-[200px] overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border/30 bg-lightGray/10 flex flex-row items-center justify-between">
              <CardTitle className="text-xs text-primary flex items-center gap-1.5">
                <span>🖥️ Execution Terminal</span>
              </CardTitle>

              {/* Badges for status */}
              {result && (
                <div className="flex items-center gap-1.5">
                  {result.timed_out ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-danger/10 text-danger border border-danger/20">
                      <AlertCircle className="w-3.5 h-3.5" /> TIMED OUT
                    </span>
                  ) : result.exit_code === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-success/10 text-success border border-success/20">
                      <CheckCircle className="w-3.5 h-3.5" /> SUCCESS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-danger/10 text-danger border border-danger/20">
                      <AlertCircle className="w-3.5 h-3.5" /> EXIT CODE: {result.exit_code}
                    </span>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col bg-[#1A1A1A] text-left">
              {/* Output body */}
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-normal">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-mid/80 py-4 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span>Executing code in secure sandbox container...</span>
                  </div>
                ) : error ? (
                  <div className="text-danger flex flex-col gap-1.5">
                    <span className="font-bold">Sandbox Connection Error:</span>
                    <pre className="whitespace-pre-wrap">{error}</pre>
                  </div>
                ) : result ? (
                  <div className="flex flex-col gap-2">
                    {/* stdout */}
                    {result.stdout && (
                      <div className="text-success whitespace-pre-wrap">
                        {result.stdout}
                      </div>
                    )}

                    {/* stderr */}
                    {result.stderr && (
                      <div className="text-[#E67E22] whitespace-pre-wrap">
                        {result.stderr}
                      </div>
                    )}

                    {/* Empty output case */}
                    {!result.stdout && !result.stderr && (
                      <span className="text-gray italic">Execution finished leaving stdout/stderr empty.</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray italic">Click 'Run Sandbox' to view output logs.</span>
                )}
              </div>

              {/* Technical limits summary footer */}
              <div className="px-4 py-2 border-t border-white/5 bg-[#141414] text-[9px] text-gray flex justify-between">
                <span>CPU: 0.5 Cores | Mem: 256MB</span>
                <span>Network: Disabled | File Limit: 10MB</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
