import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function ResumeBuilder() {
  const [jobDescription, setJobDescription] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const { data, error } = await supabase.functions.invoke('generate-resume', {
        body: { jobDescription },
      });

      if (error) throw error;

      setGeneratedResume(data.resume);
      toast({
        title: "Resume generated successfully!",
        description: "Your resume has been generated based on the job description.",
      });
    } catch (error) {
      console.error('Error generating resume:', error);
      toast({
        title: "Error generating resume",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">AI Resume Builder</h1>
        <p className="text-muted-foreground">
          Enter the job description you're applying for, and we'll generate a tailored resume for you.
        </p>
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
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Generated Resume</h2>
          <div className="p-6 border rounded-lg whitespace-pre-wrap bg-white">
            {generatedResume}
          </div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(generatedResume);
              toast({
                title: "Resume copied to clipboard",
                description: "You can now paste it anywhere you need.",
              });
            }}
            variant="outline"
            className="w-full"
          >
            Copy to Clipboard
          </Button>
        </div>
      )}
    </div>
  );
}