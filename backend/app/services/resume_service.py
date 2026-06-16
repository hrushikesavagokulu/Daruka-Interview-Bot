import os
import json
import httpx
import traceback
from sqlalchemy import select
from app.core.config import settings
from app.models.resume import Resume
from app.models.user import CandidateProfile

async def parse_resume_background(resume_id: int, file_path: str, user_id: int, session_factory):
    """
    Background task to parse a candidate's PDF resume using PyMuPDF (fitz) and Ollama.
    Extracts skills, years of experience, and a brief professional summary, then updates
    the resume's parse status and merges the findings into the user's CandidateProfile.
    """
    print(f"[ResumeParser] Starting background parse for resume_id={resume_id}, user_id={user_id}")
    
    try:
        # 1. Extract text from the PDF using PyMuPDF (fitz)
        import fitz
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Resume file not found at path: {file_path}")
            
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
            
        doc.close()
        
        if not text.strip():
            raise ValueError("No text could be extracted from the PDF file.")
            
        print(f"[ResumeParser] Extracted {len(text)} characters of text from resume_id={resume_id}")
        
        # 2. Query Ollama model llama3.1:8b
        prompt = (
            "You are an expert ATS (Applicant Tracking System) parser.\n"
            "Analyze the following resume text and extract the technical skills, total years of experience, and a brief professional summary.\n"
            "You MUST return a JSON object conforming STRICTLY to this format:\n"
            "{\n"
            "  \"skills\": [\"skill1\", \"skill2\", ...],\n"
            "  \"years_experience\": 5,\n"
            "  \"summary\": \"Brief professional summary here.\"\n"
            "}\n"
            "Make sure 'skills' is a JSON array of strings, 'years_experience' is an integer, and 'summary' is a string. "
            "Only return the raw JSON object, without any comments, formatting markdown wrappers, or explanations.\n\n"
            f"Resume Text:\n{text}"
        )
        
        parsed_json = None
        ollama_url = f"{settings.OLLAMA_URL}/api/generate"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                print(f"[ResumeParser] Calling Ollama at {ollama_url} with model llama3.2")
                response = await client.post(
                    ollama_url,
                    json={
                        "model": "llama3.2",
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                response.raise_for_status()
                res_data = response.json()
                response_text = res_data.get("response", "").strip()
                print(f"[ResumeParser] Received response from Ollama: {response_text[:300]}...")
                
                # Parse the response text as JSON
                try:
                    parsed_json = json.loads(response_text)
                except json.JSONDecodeError:
                    # Fallback: search for first '{' and last '}'
                    start = response_text.find('{')
                    end = response_text.rfind('}')
                    if start != -1 and end != -1:
                        json_str = response_text[start:end+1]
                        parsed_json = json.loads(json_str)
                    else:
                        raise ValueError("Failed to decode JSON from Ollama response.")
        except Exception as ollama_err:
            print(f"[ResumeParser] Ollama call failed: {ollama_err}. Running robust local fallback parser...")
            import re
            
            # Extract years of experience using pattern matching
            years_exp_val = 0
            exp_match = re.search(r"(\d+)\+?\s*(?:year|yr)s?\s*(?:of\s*)?experience", text, re.IGNORECASE)
            if exp_match:
                try:
                    years_exp_val = int(exp_match.group(1))
                except:
                    pass
            else:
                exp_match2 = re.search(r"(?:worked|working|experience)\s*(?:for\s*)?(\d+)\s*(?:year|yr)s?", text, re.IGNORECASE)
                if exp_match2:
                    try:
                        years_exp_val = int(exp_match2.group(1))
                    except:
                        pass
            
            if years_exp_val > 45:
                years_exp_val = 5
                
            # Scan text for common tech skills
            known_skills = [
                "Python", "Django", "Flask", "FastAPI", "Java", "Spring", "SpringBoot",
                "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node", "Node.js", "Express",
                "HTML", "CSS", "Sass", "Tailwind", "Bootstrap", "Docker", "Kubernetes", "AWS",
                "Google Cloud", "Azure", "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis",
                "Git", "GitHub", "CI/CD", "Linux", "C++", "C#", "Go", "Golang", "Rust"
            ]
            extracted_skills = []
            for skill in known_skills:
                pattern = rf"\b{re.escape(skill)}\b"
                if skill.lower() in ["node.js", "node", "ci/cd"]:
                    pattern = rf"\b{re.escape(skill)}\b"
                if re.search(pattern, text, re.IGNORECASE):
                    extracted_skills.append(skill)
                    
            # Extract summary: get first 3 reasonable sentences/lines
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            summary_parts = []
            for line in lines:
                if len(line) > 25 and not any(kw in line.lower() for kw in ["phone", "email", "address", "linkedin", "github", "http"]):
                    summary_parts.append(line)
                    if len(summary_parts) >= 3:
                        break
            summary_val = " ".join(summary_parts)
            if not summary_val:
                summary_val = f"Candidate with skill set in {', '.join(extracted_skills[:4])}."
                
            parsed_json = {
                "skills": extracted_skills,
                "years_experience": years_exp_val,
                "summary": summary_val
            }
                    
        # 3. Standardize and clean parsed data
        skills = parsed_json.get("skills", [])
        if not isinstance(skills, list):
            skills = [str(skills)] if skills else []
        skills = [str(s).strip() for s in skills if s]
        
        years_exp = parsed_json.get("years_experience", 0)
        try:
            years_exp = int(float(years_exp))
        except (ValueError, TypeError):
            years_exp = 0
            
        summary = parsed_json.get("summary", "")
        if not isinstance(summary, str):
            summary = str(summary)
            
        parsed_data = {
            "skills": skills,
            "years_experience": years_exp,
            "summary": summary
        }
        
        # 4. Save to Database
        async with session_factory() as db:
            # Update Resume entry
            stmt = select(Resume).where(Resume.id == resume_id)
            res = await db.execute(stmt)
            resume_obj = res.scalar_one_or_none()
            
            if resume_obj:
                resume_obj.parsed_data = parsed_data
                resume_obj.parse_status = "done"
                print(f"[ResumeParser] Resume id={resume_id} parse status updated to done.")
                
            # Update or create CandidateProfile entry
            stmt_prof = select(CandidateProfile).where(CandidateProfile.user_id == user_id)
            res_prof = await db.execute(stmt_prof)
            profile = res_prof.scalar_one_or_none()
            
            if not profile:
                profile = CandidateProfile(
                    user_id=user_id,
                    skills=skills,
                    years_experience=years_exp,
                    about=summary
                )
                db.add(profile)
                print(f"[ResumeParser] Created new CandidateProfile for user_id={user_id}.")
            else:
                # Merge skills (avoid duplicates)
                current_skills = profile.skills or []
                if not isinstance(current_skills, list):
                    current_skills = []
                merged_skills = list(set(current_skills + skills))
                
                profile.skills = merged_skills
                profile.years_experience = max(profile.years_experience, years_exp)
                if summary:
                    profile.about = summary
                print(f"[ResumeParser] Updated existing CandidateProfile for user_id={user_id}.")
                
            await db.commit()
            print(f"[ResumeParser] Transaction committed successfully for resume_id={resume_id}.")
            
    except Exception as err:
        print(f"[ResumeParser] ERROR occurred while parsing resume_id={resume_id}: {err}")
        traceback.print_exc()
        
        # Mark as failed in DB
        try:
            async with session_factory() as db:
                stmt = select(Resume).where(Resume.id == resume_id)
                res = await db.execute(stmt)
                resume_obj = res.scalar_one_or_none()
                if resume_obj:
                    resume_obj.parse_status = "failed"
                    await db.commit()
                    print(f"[ResumeParser] Resume id={resume_id} parse status updated to failed.")
        except Exception as db_err:
            print(f"[ResumeParser] Critical DB error while marking status as failed: {db_err}")
