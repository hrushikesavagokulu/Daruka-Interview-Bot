import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Cpu, Server, Activity, Database, Check } from 'lucide-react'

export default function Admin() {
  // Mock administrative telemetry data
  const metrics = {
    ollamaStatus: 'online',
    ollamaModel: 'llama3.1:8b',
    whisperStatus: 'online',
    dbHealth: 'connected',
    activeUsersCount: 12,
    completedInterviews: 45,
    cpuLoad: 24,
    ramLoad: 68,
  }

  const logs = [
    { time: '19:28:05', service: 'AUTH', text: 'JWT verified for candidate verify_test@example.com' },
    { time: '19:27:55', service: 'REDIS', text: 'OTP code 369366 generated and cached for verify_test@example.com' },
    { time: '19:15:20', service: 'SANDBOX', text: 'Python compile test completed in 0.04s (Status: OK)' },
    { time: '19:10:11', service: 'OLLAMA', text: 'Scoping query model llama3.1:8b loaded in 4.2s' },
  ]

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-primary">System Telemetry & Administration</h1>
        <p className="text-sm text-gray mt-1">Monitor local services, database connections, and evaluation engines.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray font-semibold leading-none">Ollama Model</p>
              <p className="text-sm font-bold text-primary mt-1">{metrics.ollamaModel}</p>
            </div>
          </div>
          <Badge variant="success">Loaded</Badge>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray font-semibold leading-none">Whisper STT</p>
              <p className="text-sm font-bold text-primary mt-1">Local CUDA</p>
            </div>
          </div>
          <Badge variant="success">Online</Badge>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray font-semibold leading-none">MySQL Database</p>
              <p className="text-sm font-bold text-primary mt-1">Connected</p>
            </div>
          </div>
          <Badge variant="success">Healthy</Badge>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-light flex items-center justify-center text-accent">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray font-semibold leading-none">Evaluations Run</p>
              <p className="text-sm font-bold text-primary mt-1">{metrics.completedInterviews}</p>
            </div>
          </div>
          <Badge variant="primary">Total</Badge>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry charts */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📈 Hardware Utilization</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-primary mb-1">
                  <span>Host CPU Load</span>
                  <span>{metrics.cpuLoad}%</span>
                </div>
                <ProgressBar value={metrics.cpuLoad} color="accent" />
              </div>
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-primary mb-1">
                  <span>RAM Usage</span>
                  <span>{metrics.ramLoad}%</span>
                </div>
                <ProgressBar value={metrics.ramLoad} color="primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Realtime logs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-base">📋 System Activity Logs</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 font-mono text-xs">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex gap-3 p-2.5 rounded-lg bg-lightGray/40 border border-border/40">
                    <span className="text-gray font-semibold">{log.time}</span>
                    <Badge variant={log.service === 'AUTH' ? 'success' : 'neutral'} className="text-[9px] py-0 px-1.5 h-4">
                      {log.service}
                    </Badge>
                    <span className="text-primary truncate">{log.text}</span>
                  </div>
                ))}
              </CardContent>
            </div>
            
            <div className="p-4 border-t border-border mt-4 text-[10px] text-gray text-center flex items-center justify-center gap-1.5 bg-lightGray/20">
              <Check className="w-3.5 h-3.5 text-success" />
              <span>All backend microservices running smoothly within Docker networks.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
