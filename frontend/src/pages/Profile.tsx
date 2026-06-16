import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { FileText, Plus, Trash2, Check, Loader2, Eye } from 'lucide-react'
import { api } from '../config/api'

interface ProfileData {
  mobile: string | null
  about: string | null
  skills: string[]
  years_experience: number
  target_role: string | null
  linkedin_url: string | null
  github_url: string | null
}

interface ResumeData {
  id: number
  name: string
  file_path: string
  parse_status: 'pending' | 'done' | 'failed'
  parsed_data: {
    skills?: string[]
    years_experience?: number
    summary?: string
  } | null
  created_at: string
}

export default function Profile() {
  // Profile State
  const [profile, setProfile] = useState<ProfileData>({
    mobile: '',
    about: '',
    skills: [],
    years_experience: 0,
    target_role: '',
    linkedin_url: '',
    github_url: '',
  })
  const [newSkill, setNewSkill] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Resumes State
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [isFetchingResumes, setIsFetchingResumes] = useState(true)

  // Detail Modal State
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch initial profile & resume lists
  useEffect(() => {
    fetchProfile()
    fetchResumes()
  }, [])

  // Auto-polling for pending resumes every 4 seconds
  useEffect(() => {
    const hasPending = resumes.some((r) => r.parse_status === 'pending')
    if (!hasPending) return

    const interval = setInterval(() => {
      fetchResumes(true) // silent background fetch
    }, 4000)

    return () => clearInterval(interval)
  }, [resumes])

  const fetchProfile = async () => {
    try {
      const response = await api.get<ProfileData>('/profile')
      setProfile({
        mobile: response.data.mobile || '',
        about: response.data.about || '',
        skills: response.data.skills || [],
        years_experience: response.data.years_experience || 0,
        target_role: response.data.target_role || '',
        linkedin_url: response.data.linkedin_url || '',
        github_url: response.data.github_url || '',
      })
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  const fetchResumes = async (silent = false) => {
    if (!silent) setIsFetchingResumes(true)
    try {
      const response = await api.get<ResumeData[]>('/resume')
      setResumes(response.data)
    } catch (err) {
      console.error('Failed to load resumes:', err)
    } finally {
      if (!silent) setIsFetchingResumes(false)
    }
  }

  const handleProfileChange = (field: keyof ProfileData, value: string | number | string[]) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }))
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    setProfileMessage(null)
    try {
      await api.put('/profile', profile)
      setProfileMessage({ type: 'success', text: 'Career profile saved successfully!' })
      setTimeout(() => setProfileMessage(null), 4000)
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to update profile.'
      setProfileMessage({ type: 'error', text: errMsg })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Only PDF files are supported.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError('Resume file size cannot exceed 5MB.')
      return
    }

    setIsUploading(true)
    setResumeError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchResumes()
      await fetchProfile()
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to upload resume file.'
      setResumeError(errMsg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteResume = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return
    try {
      await api.delete(`/resume/${id}`)
      setResumes((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error('Failed to delete resume:', err)
      alert('Failed to delete the resume.')
    }
  }

  const handleViewDetails = (resume: ResumeData) => {
    setSelectedResume(resume)
    setIsModalOpen(true)
  }

  const handleApplyParsedData = () => {
    if (!selectedResume?.parsed_data) return
    const parsedSkills = selectedResume.parsed_data.skills || []
    const parsedExp = selectedResume.parsed_data.years_experience || 0
    const parsedAbout = selectedResume.parsed_data.summary || ''

    setProfile((prev) => ({
      ...prev,
      skills: Array.from(new Set([...prev.skills, ...parsedSkills])),
      years_experience: Math.max(prev.years_experience, parsedExp),
      about: parsedAbout || prev.about,
    }))

    setProfileMessage({
      type: 'success',
      text: "Extracted data loaded into form. Click Save Profile to persist changes!",
    })
    setIsModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">My Profile & Resumes</h1>
        <p className="text-sm text-gray mt-1">Configure target career parameters and upload resumes for AI context scoping.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Profile Details Form ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">👤 Career Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left">
              {profileMessage && (
                <div
                  className={`p-3 rounded-lg border text-xs font-semibold ${
                    profileMessage.type === 'success'
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-danger/10 border-danger/30 text-danger'
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Target Job Role"
                  value={profile.target_role || ''}
                  onChange={(e) => handleProfileChange('target_role', e.target.value)}
                  placeholder="e.g. Backend developer, Frontend engineer"
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  value={profile.years_experience}
                  onChange={(e) => handleProfileChange('years_experience', parseInt(e.target.value) || 0)}
                  placeholder="e.g. 5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  value={profile.mobile || ''}
                  onChange={(e) => handleProfileChange('mobile', e.target.value)}
                  placeholder="e.g. +1 555-0199"
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-primary">About / Bio</label>
                  <textarea
                    value={profile.about || ''}
                    onChange={(e) => handleProfileChange('about', e.target.value)}
                    placeholder="Describe your background and core expertise..."
                    rows={3}
                    className="w-full text-xs p-3 border border-border rounded-xl bg-lightGray focus:outline-none focus:border-accent resize-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn URL"
                  value={profile.linkedin_url || ''}
                  onChange={(e) => handleProfileChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
                <Input
                  label="GitHub URL"
                  value={profile.github_url || ''}
                  onChange={(e) => handleProfileChange('github_url', e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>

              {/* Skill Tags */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-semibold text-primary">Technical Core Skills</label>
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-xl bg-lightGray/40 min-h-[52px]">
                  {profile.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="flex items-center gap-1.5 py-1 px-3 text-xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray hover:text-danger p-0.5 rounded transition-colors focus:outline-none"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                  {profile.skills.length === 0 && (
                    <span className="text-xs text-gray italic">No skills added yet. Upload a resume or add manually.</span>
                  )}
                </div>

                <form onSubmit={handleAddSkill} className="flex gap-2 mt-1">
                  <Input
                    placeholder="e.g. Docker, Kubernetes"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button type="submit" variant="outline" size="sm" className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </form>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  variant="primary"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Resumes Panel ── */}
        <div className="flex flex-col gap-6">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-base">📄 Resume Management</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-left">
                {resumeError && (
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-semibold">
                    {resumeError}
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upload drop zone */}
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-lightGray/20 transition-colors flex flex-col items-center justify-center ${
                    isUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-accent mb-2" />
                      <span className="text-xs font-bold text-accent">Uploading & Scheduling Parse...</span>
                      <span className="text-[10px] text-gray mt-0.5">Please wait</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl block mb-2">📁</span>
                      <span className="text-xs font-bold text-primary block">Click to Upload PDF Resume</span>
                      <span className="text-[10px] text-gray block mt-0.5">Max size: 5MB</span>
                    </>
                  )}
                </div>

                {/* Resume list */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs font-semibold text-primary">Uploaded Documents</span>

                  {isFetchingResumes ? (
                    <div className="flex items-center gap-2 text-gray text-xs justify-center py-6">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span>Loading resumes...</span>
                    </div>
                  ) : resumes.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray italic bg-lightGray/30 rounded-xl border border-dashed border-border">
                      No resumes uploaded yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-0.5">
                      {resumes.map((resume) => {
                        const formattedDate = new Date(resume.created_at).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                        return (
                          <div
                            key={resume.id}
                            className="flex items-center justify-between p-3 border border-border rounded-xl bg-white hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-8 h-8 rounded bg-danger/10 text-danger flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col text-left overflow-hidden">
                                <span className="text-xs font-bold text-primary truncate max-w-[110px]" title={resume.name}>
                                  {resume.name}
                                </span>
                                <span className="text-[9px] text-gray leading-none mt-0.5">{formattedDate}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                              <Badge
                                variant={
                                  resume.parse_status === 'done'
                                    ? 'success'
                                    : resume.parse_status === 'failed'
                                    ? 'danger'
                                    : 'warning'
                                }
                                className="text-[9px] py-0.5 px-1.5 capitalize"
                              >
                                {resume.parse_status === 'pending' ? (
                                  <span className="flex items-center gap-1">
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> parsing
                                  </span>
                                ) : resume.parse_status}
                              </Badge>

                              {resume.parse_status === 'done' && (
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails(resume)}
                                  className="p-1 hover:bg-lightGray text-primary rounded-lg transition-colors focus:outline-none"
                                  title="View parsed details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteResume(resume.id)}
                                className="p-1 hover:bg-danger/10 text-gray hover:text-danger rounded-lg transition-colors focus:outline-none"
                                title="Delete resume"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </div>

            <div className="p-5 border-t border-border">
              <p className="text-[10px] text-gray text-center leading-normal">
                Uploaded resumes are parsed via PyMuPDF + Llama 3.1 to scope AI interview questions accurately.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Parsed Resume Details Modal ── */}
      {selectedResume && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Extracted Resume Information"
          size="lg"
        >
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-primary">{selectedResume.name}</h3>
                <p className="text-[10px] text-gray mt-0.5">Parsed via Llama 3.1 LLM Analyzer</p>
              </div>
              <Badge variant="success" className="text-xs font-semibold py-1 px-3 uppercase">
                Parsed ✓
              </Badge>
            </div>

            {selectedResume.parsed_data ? (
              <div className="flex flex-col gap-4">
                {/* Summary */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">Professional Summary</h4>
                  <p className="text-xs text-gray bg-lightGray/60 p-3 rounded-xl border border-border leading-relaxed">
                    {selectedResume.parsed_data.summary || 'No summary extracted.'}
                  </p>
                </div>

                {/* Experience */}
                <div className="flex items-center justify-between bg-light p-3 rounded-xl border border-border">
                  <span className="text-xs font-bold text-primary">Experience Extracted:</span>
                  <span className="text-xs font-extrabold text-accent bg-white px-3 py-1 rounded-lg border border-border">
                    {selectedResume.parsed_data.years_experience ?? 0} Years
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">Skills Identified</h4>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-lightGray/30 border border-dashed border-border min-h-[40px]">
                    {selectedResume.parsed_data.skills && selectedResume.parsed_data.skills.length > 0 ? (
                      selectedResume.parsed_data.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px] py-0.5 px-2">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray italic">No skills extracted.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray italic">
                No structured data available.
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
              <Button onClick={() => setIsModalOpen(false)} variant="outline" size="sm">
                Close
              </Button>
              <Button onClick={handleApplyParsedData} variant="accent" size="sm">
                Apply to Profile Form
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
