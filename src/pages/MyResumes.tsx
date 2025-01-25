import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface Resume {
  id: string;
  job_description: string;
  resume_content: string;
  created_at: string;
}

export default function MyResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: "Error fetching resumes",
        description: "Failed to load your resumes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (resume: Resume) => {
    const blob = new Blob([resume.resume_content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${new Date(resume.created_at).toLocaleDateString()}.txt`;
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
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">My Generated Resumes</h1>
          <p className="text-muted-foreground">
            View and download your previously generated resumes.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/resume-builder")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resume Builder
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading your resumes...</div>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>You haven't generated any resumes yet.</p>
            <Button
              onClick={() => navigate("/resume-builder")}
              className="mt-4 bg-gradient-to-r from-[#e59b7d] to-[#452095] hover:opacity-90"
            >
              Generate Your First Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">
                      Resume from {new Date(resume.created_at).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Job Description Preview: {resume.job_description.slice(0, 100)}...
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownload(resume)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap font-serif leading-relaxed max-h-48 overflow-y-auto">
                  {resume.resume_content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}