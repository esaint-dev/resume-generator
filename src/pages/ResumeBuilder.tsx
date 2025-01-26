import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import html2pdf from 'html2pdf.js';

const RESUME_TEMPLATES = {
  modern: {
    name: "Modern",
    style: `
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #1A1F2C;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background: white;
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
    `,
  },
  professional: {
    name: "Professional",
    style: `
      body {
        font-family: 'Times New Roman', serif;
        line-height: 1.5;
        color: #000;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background: white;
      }
      h1, h2, h3 {
        color: #2c3e50;
        margin-bottom: 12px;
      }
      h1 {
        font-size: 28px;
        text-align: center;
        text-transform: uppercase;
      }
      h2 {
        font-size: 22px;
        border-bottom: 1px solid #2c3e50;
        padding-bottom: 4px;
      }
      .section {
        margin-bottom: 20px;
      }
      ul {
        margin: 8px 0;
        padding-left: 20px;
      }
      li {
        margin-bottom: 6px;
      }
    `,
  },
  minimal: {
    name: "Minimal",
    style: `
      body {
        font-family: 'Helvetica', sans-serif;
        line-height: 1.4;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background: white;
      }
      h1, h2, h3 {
        color: #333;
        margin-bottom: 10px;
      }
      h1 {
        font-size: 26px;
        font-weight: 300;
        text-align: center;
      }
      h2 {
        font-size: 18px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .section {
        margin-bottom: 18px;
      }
      ul {
        margin: 6px 0;
        padding-left: 18px;
      }
      li {
        margin-bottom: 4px;
      }
    `,
  },
};

export default function ResumeBuilder() {
  const [jobDescription, setJobDescription] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
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

  const handleDownload = async () => {
    const template = RESUME_TEMPLATES[selectedTemplate as keyof typeof RESUME_TEMPLATES];
    const styledResume = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${template.style}
        </style>
      </head>
      <body>
        ${generatedResume.replace(/\n/g, '<br>')}
      </body>
      </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = styledResume;
    document.body.appendChild(element);

    const options = {
      margin: 10,
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">Generated Resume</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RESUME_TEMPLATES).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
