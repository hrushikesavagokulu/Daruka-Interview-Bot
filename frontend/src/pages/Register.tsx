import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState(1) // 1 = info, 2 = verify OTP
  const [otp, setOtp] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { signup, verifySignupOtp, error, isLoading, setError } = useAuthStore()
  const navigate = useNavigate()

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setError(null)
    
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.')
      return
    }

    try {
      await signup(fullName, email, password)
      setStep(2)
    } catch (err: any) {
      // Error handled by store and displayed via `error` state
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setError(null)

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setValidationError('OTP must be exactly 6 digits.')
      return
    }

    try {
      await verifySignupOtp(email, otp)
      navigate('/dashboard')
    } catch (err: any) {
      // Error handled by store and displayed via `error` state
    }
  }

  return (
    <div className="min-h-screen bg-lightGray font-sans flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <span className="text-3xl block mb-2">🤖</span>
          <CardTitle>Create Candidate Account</CardTitle>
          <p className="text-xs text-gray mt-1">Start Preparing for Tech Interviews</p>
        </CardHeader>

        <CardContent>
          {/* Error Message Panel */}
          {(validationError || error) && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-semibold text-left">
              {validationError || error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 text-left">
              <Input
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="•••••••• (Min 6 chars)"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Register Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className="flex flex-col gap-4 text-left">
              <div className="text-center p-3 rounded-lg bg-light border border-border">
                <p className="text-xs text-primary leading-tight font-medium">
                  We've sent a 6-digit OTP verification code to <strong className="text-accent">{email}</strong>.
                </p>
                <p className="text-[10px] text-gray mt-1">
                  (Check your terminal docker-compose logs for the code)
                </p>
              </div>
              <Input
                label="6-Digit OTP Verification Code"
                type="text"
                placeholder="123456"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setStep(1)
                    setValidationError(null)
                    setError(null)
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="accent" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Activate'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-border mt-6 pt-4 text-xs text-gray">
          <span>Already have an account? </span>
          <Link to="/login" className="text-accent hover:underline font-semibold ml-1">
            Log In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
