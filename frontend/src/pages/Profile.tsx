import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { FileText, Plus, Trash2, Check } from 'lucide-react'

export default function Profile() {
  const [targetRole, setTargetRole] = useState('Full Stack Engineer')
  const [experience, setExperience] = useState('3')
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Node.js', 'MySQL', 'Python', 'FastAPI'])
  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">My Profile & Resumes</h1>
        <p className="text-sm text-gray mt-1">Configure target career parameters and upload resumes for AI context scoping.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">👤 Career Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Target Job Role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend developer"
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>

              {/* Skill Tags */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-semibold text-primary">Technical Core Skills</label>
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-lightGray/40">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="flex items-center gap-1.5 py-1 px-3 text-xs"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray hover:text-danger hover:bg-danger/10 p-0.5 rounded transition-colors focus:outline-none"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-gray italic">No skills added yet.</span>
                  )}
                </div>

                <form onSubmit={handleAddSkill} className="flex gap-2 mt-1">
                  <Input
                    placeholder="e.g. Docker, Redis"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button type="submit" variant="outline" size="sm" className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </Button>
                </form>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="primary" className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumes Panel */}
        <div className="flex flex-col gap-6">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-base">📄 Resume Management</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-lightGray/20 transition-colors cursor-pointer">
                  <span className="text-3xl block mb-2">📁</span>
                  <span className="text-xs font-bold text-primary block">Upload PDF Resume</span>
                  <span className="text-[10px] text-gray block mt-0.5">Max size: 5MB</span>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <span className="text-xs font-semibold text-primary">Uploaded Documents</span>
                  {/* Mock Uploaded File */}
                  <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-danger/10 text-danger flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-primary truncate max-w-[120px]">jane_doe_cv.pdf</span>
                        <span className="text-[10px] text-gray leading-none">2.4 MB • Parsed</span>
                      </div>
                    </div>
                    <button className="p-1.5 hover:bg-danger/10 text-gray hover:text-danger rounded-lg transition-colors focus:outline-none">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </div>
            
            <div className="p-5 border-t border-border mt-4">
              <p className="text-[10px] text-gray text-center leading-normal">
                Uploaded resumes will be automatically processed via PyMuPDF parsing to scope AI coding and voice questions accurately.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
