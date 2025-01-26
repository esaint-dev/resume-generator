import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function ResumeBuilder() {
  const [jobDescription, setJobDescription] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Please enter a job description",
        variant: "destructive",
      });
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
        body: { jobDescription },
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

  const handleDownload = () => {
    // Create resume content with proper styling
    const styledResume = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #1A1F2C;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          h1, h2, h3 {
            color: #7E69AB;
            margin-bottom: 16px;
          }
          h1 {
            font-size: 24px;
            border-bottom: 2px solid #9b87f5;
            padding-bottom: 8px;
          }
          h2 {
            font-size: 20px;
            margin-top: 24px;
          }
          .section {
            margin-bottom: 24px;
          }
          ul {
            margin: 0;
            padding-left: 20px;
          }
          li {
            margin-bottom: 8px;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
        </style>
      </head>
      <body>
        ${generatedResume.replace(/\n/g, '<br>')}
      </body>
      </html>
    `;

    const blob = new Blob([styledResume], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-resume.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Resume downloaded!",
      description: "Your resume has been downloaded successfully.",
    });
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">AI Resume Builder</h1>
          <p className="text-muted-foreground">
            Enter the job description you're applying for, and we'll generate a tailored resume for you.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/my-resumes")}
          className="flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          View Past Resumes
        </Button>
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Generated Resume</h2>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </Button>
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