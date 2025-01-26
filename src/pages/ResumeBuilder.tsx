import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, History, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import html2pdf from 'html2pdf.js';
import type { Profile } from "@/types/profile";

const RESUME_TEMPLATES = {
  modern: {
    name: "Modern Split",
    style: `
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .resume-container {
        display: flex;
        max-width: 210mm;
        margin: 0 auto;
        min-height: 297mm;
      }
      .sidebar {
        background: #1A1F2C;
        color: white;
        padding: 40px 20px;
        width: 30%;
      }
      .main-content {
        padding: 40px;
        width: 70%;
      }
      .section {
        margin-bottom: 25px;
      }
      .section-title {
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 15px;
        font-size: 18px;
      }
      .sidebar .section-title {
        color: white;
        border-bottom: 2px solid #FFD700;
        padding-bottom: 5px;
      }
      .main-content .section-title {
        color: #1A1F2C;
        border-bottom: 2px solid #4A90E2;
        padding-bottom: 5px;
      }
      .contact-item {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .skills-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .skills-list li {
        margin-bottom: 8px;
      }
      .work-item {
        margin-bottom: 20px;
      }
      .work-title {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .work-date {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 8px;
      }
      .education-item {
        margin-bottom: 15px;
      }
      .name-title {
        text-align: center;
        margin-bottom: 30px;
      }
      .name-title h1 {
        font-size: 28px;
        margin: 0;
        margin-bottom: 5px;
      }
      .name-title .job-title {
        font-size: 18px;
        color: #FFD700;
      }
      .achievements-list {
        list-style: none;
        padding: 0;
      }
      .achievements-list li {
        margin-bottom: 10px;
      }
    `,
    template: (content: string) => {
      const sections = content.split('\n\n');
      const name = sections[0]?.split('\n')[0] || 'Name';
      const title = sections[0]?.split('\n')[1] || 'Job Title';
      
      return `
        <div class="resume-container">
          <div class="sidebar">
            <div class="name-title">
              <h1>${name}</h1>
              <div class="job-title">${title}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Contact</div>
              <div class="contact-info">
                <!-- Contact details will be filled by the AI -->
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Skills</div>
              <ul class="skills-list">
                <!-- Skills will be filled by the AI -->
              </ul>
            </div>
            
            <div class="section">
              <div class="section-title">Achievements</div>
              <ul class="achievements-list">
                <!-- Achievements will be filled by the AI -->
              </ul>
            </div>
          </div>
          
          <div class="main-content">
            <div class="section">
              <div class="section-title">Profile</div>
              <!-- Profile content will be filled by the AI -->
            </div>
            
            <div class="section">
              <div class="section-title">Work Experience</div>
              <!-- Work experience will be filled by the AI -->
            </div>
            
            <div class="section">
              <div class="section-title">Education</div>
              <!-- Education will be filled by the AI -->
            </div>
          </div>
        </div>
      `;
    }
  }
};

export default function ResumeBuilder() {
  const [jobDescription, setJobDescription] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error fetching profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const checkRequiredFields = () => {
    if (!userProfile) return false;

    const missingFields = [];
    if (!userProfile.full_name) missingFields.push("full name");
    if (!userProfile.phone) missingFields.push("phone number");
    if (!userProfile.date_of_birth) missingFields.push("date of birth");

    if (missingFields.length > 0) {
      toast({
        title: "Profile incomplete",
        description: `Please update your ${missingFields.join(", ")} in your profile before generating a resume.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    if (!checkRequiredFields()) {
      navigate("/profile");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate resumes.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-resume', {
        body: { 
          jobDescription,
          userProfile // Pass the user profile to the edge function
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate resume');
      }

      if (!data?.resume) {
        throw new Error('No resume generated');
      }

      const resumeContent = String(data.resume);
      setGeneratedResume(resumeContent);

      const { error: saveError } = await supabase
        .from('generated_resumes')
        .insert({
          job_description: jobDescription,
          resume_content: resumeContent,
          user_id: user.id
        });

      if (saveError) {
        console.error('Error saving resume:', saveError);
        throw new Error('Failed to save resume');
      }

      toast({
        title: "Resume generated successfully!",
        description: "Your resume has been generated and saved.",
      });
    } catch (error) {
      console.error('Error generating resume:', error);
      toast({
        title: "Error generating resume",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const template = RESUME_TEMPLATES[selectedTemplate as keyof typeof RESUME_TEMPLATES];
    
    // Process the resume content to fit the template
    const processedContent = template.template(generatedResume);
    
    const styledResume = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${template.style}
        </style>
      </head>
      <body>
        ${processedContent}
      </body>
      </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = styledResume;
    document.body.appendChild(element);

    const options = {
      margin: 0,
      filename: 'generated-resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(element).set(options).save();
      toast({
        title: "Resume downloaded!",
        description: "Your resume has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error downloading resume",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(element);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">AI Resume Builder</h1>
          <p className="text-muted-foreground">
            Enter the job description you're applying for, and we'll generate a tailored resume for you.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2"
          >
            <UserCircle className="w-4 h-4" />
            Update Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/my-resumes")}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            View Past Resumes
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[200px]"
        />
        <Button
          onClick={handleGenerateResume}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#e59b7d] to-[#452095] hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Resume...
            </>
          ) : (
            "Generate Resume"
          )}
        </Button>
      </div>

      {generatedResume && (
        <Card className="overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">Generated Resume</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download as PDF
                </Button>
              </div>
            </div>
            <div className="p-6 rounded-lg bg-white dark:bg-gray-900 whitespace-pre-wrap font-serif leading-relaxed text-[#1A1F2C] dark:text-white">
              {generatedResume}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
