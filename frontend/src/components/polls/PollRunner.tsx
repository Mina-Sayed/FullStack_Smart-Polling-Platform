import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useParams } from "react-router-dom";
import { Poll, AnswerMap } from "./PollTypes";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function shouldShowQuestion(q: any, answers: AnswerMap) {
  if (!q.conditionalLogic?.dependsOnQuestionId) return true;
  const target = answers[q.conditionalLogic.dependsOnQuestionId];
  if (Array.isArray(target)) return target.includes(q.conditionalLogic.expectedAnswer || "");
  return target === (q.conditionalLogic.expectedAnswer || "");
}

export default function PollRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useSEO({
    title: poll ? `${poll.title} | Flow Poll Forge` : "Poll | Flow Poll Forge",
    description: poll?.description || "Respond to this smart poll.",
    canonical: window.location.href,
  });

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const pollData = await apiClient.getPoll(id);
        setPoll(pollData);
      } catch (error: any) {
        toast.error(error.message || "Failed to load poll");
        setPoll(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Loading poll...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Poll not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!poll) return;

    setIsSubmitting(true);
    try {
      // Convert answers to backend format
      const backendAnswers = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value: Array.isArray(value) ? value : String(value),
      }));

      // Submit to backend
      if (isAuthenticated) {
        await apiClient.submitAnswer(poll.id, backendAnswers);
      } else {
        await apiClient.submitAnonymousAnswer(poll.id, backendAnswers);
      }
      toast.success("Thanks for your response!");
      navigate(`/results/${poll.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {poll.questions.map((q) => {
            const visible = shouldShowQuestion(q, answers);
            if (!visible) return null;
            return (
              <div key={q.id} className="space-y-3">
                <h3 className="font-medium">{q.text}</h3>
                {q.type === "text" && (
                  <Textarea
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  />
                )}
                {q.type === "single" && (
                  <RadioGroup
                    value={(answers[q.id] as string) || ""}
                    onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                  >
                    <div className="grid gap-2">
                      {q.options?.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center gap-2">
                          <RadioGroupItem value={option} id={`${q.id}_${optIndex}`} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                )}
                {q.type === "multiple" && (
                  <div className="grid gap-2">
                    {q.options?.map((option, optIndex) => {
                      const arr = (answers[q.id] as string[]) || [];
                      const checked = arr.includes(option);
                      return (
                        <label key={optIndex} className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              setAnswers((a) => {
                                const current = (a[q.id] as string[]) || [];
                                const next = v
                                  ? Array.from(new Set([...current, option]))
                                  : current.filter((item) => item !== option);
                                return { ...a, [q.id]: next };
                              });
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
