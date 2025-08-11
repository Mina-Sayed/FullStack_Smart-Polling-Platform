import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LegacyQuestion, QuestionType } from "./PollTypes";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const typeOptions: { value: QuestionType; label: string }[] = [
  { value: "single", label: "Single choice" },
  { value: "multiple", label: "Multiple choice" },
  { value: "text", label: "Text" },
];

export default function PollBuilder() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("Untitled Poll");
  const [description, setDescription] = useState("Ask smarter questions with conditional logic.");
  const [questions, setQuestions] = useState<LegacyQuestion[]>([]);

  const addQuestion = () => {
    const q: LegacyQuestion = {
      id: uid("q"),
      title: "New question",
      type: "single",
      options: [
        { id: uid("opt"), label: "Option A" },
        { id: uid("opt"), label: "Option B" },
      ],
    };
    setQuestions((prev) => [...prev, q]);
  };

  const updateQuestion = (id: string, patch: Partial<LegacyQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const addOption = (qid: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: [...(q.options || []), { id: uid("opt"), label: `Option ${(q.options?.length || 0) + 1}` }],
            }
          : q
      )
    );
  };

  const updateOption = (qid: string, oid: string, label: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? { ...q, options: q.options?.map((o) => (o.id === oid ? { ...o, label } : o)) }
          : q
      )
    );
  };

  const removeOption = (qid: string, oid: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qid ? { ...q, options: q.options?.filter((o) => o.id !== oid) } : q))
    );
  };

  const save = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to create a poll");
      return;
    }

    setIsLoading(true);
    try {
      // Convert legacy questions to backend format
      const backendQuestions = questions.map((q, index) => ({
        text: q.title,
        type: q.type,
        options: q.type !== "text" ? q.options?.map(opt => opt.label) : undefined,
        conditionalLogic: q.condition ? {
          dependsOnQuestionId: q.condition.dependsOnId,
          expectedAnswer: q.condition.equals,
          operator: 'equals' as const
        } : undefined,
        order: index,
        required: false,
      }));

      const pollData = {
        title,
        description,
        allowAnonymous: true,
        questions: backendQuestions,
      };

      const createdPoll = await apiClient.createPoll(pollData);
      toast.success("Poll created successfully!");
      navigate(`/poll/${createdPoll.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create poll");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Create a poll</CardTitle>
          <CardDescription>Define questions and simple conditions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <Card key={q.id} className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Q{idx + 1}</CardTitle>
                  <CardDescription>Configure question and logic</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Question</label>
                    <Input
                      value={q.title}
                      onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2 max-w-xs">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={q.type} onValueChange={(v: QuestionType) => updateQuestion(q.id, { type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(q.type === "single" || q.type === "multiple") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Options</label>
                        <Button variant="secondary" size="sm" onClick={() => addOption(q.id)}>Add option</Button>
                      </div>
                      <div className="space-y-2">
                        {q.options?.map((o) => (
                          <div key={o.id} className="flex items-center gap-2">
                            <Input
                              value={o.label}
                              onChange={(e) => updateOption(q.id, o.id, e.target.value)}
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeOption(q.id, o.id)}>Remove</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conditional logic */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Show only if...</label>
                    <div className="grid gap-2 md:grid-cols-3">
                      <Select
                        value={q.condition?.dependsOnId || ""}
                        onValueChange={(v) => updateQuestion(q.id, { condition: { dependsOnId: v, equals: "" } })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select previous question" />
                        </SelectTrigger>
                        <SelectContent>
                          {questions
                            .filter((p) => p.id !== q.id)
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <div className="self-center text-center text-sm">equals</div>

                      <Select
                        value={q.condition?.equals || ""}
                        onValueChange={(v) => updateQuestion(q.id, { condition: q.condition ? { ...q.condition, equals: v } : undefined })}
                        disabled={!q.condition?.dependsOnId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select expected answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {questions
                            .find((p) => p.id === q.condition?.dependsOnId)?.options?.map((o) => (
                              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">Leave blank to always show.</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={addQuestion}>Add question</Button>
            <Button onClick={save} disabled={isLoading}>
              {isLoading ? "Creating..." : "Save & Share"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
