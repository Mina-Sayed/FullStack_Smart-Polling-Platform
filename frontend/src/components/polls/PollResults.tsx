import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Poll } from "./PollTypes";
import { useParams } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip, PieChart, Pie, Cell } from "recharts";
import { apiClient } from "@/lib/api";
import { wsService } from "@/lib/websocket";
import { toast } from "sonner";

export default function PollResults() {
  const { id } = useParams();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useSEO({
    title: poll ? `${poll.title} Results | Flow Poll Forge` : "Results | Flow Poll Forge",
    description: poll?.description || "Live results for this poll.",
    canonical: window.location.href,
  });

  useEffect(() => {
    const fetchPollAndResults = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch from backend
        const [pollData, resultsData] = await Promise.all([
          apiClient.getPoll(id),
          apiClient.getPollResults(id)
        ]);
        setPoll(pollData);
        setResults(resultsData);
      } catch (error: any) {
        toast.error(error.message || "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPollAndResults();
  }, [id]);

  // Set up WebSocket for real-time updates
  useEffect(() => {
    if (!id) return;

    wsService.connect();
    wsService.joinPoll(id);
    
    wsService.onPollResults((data) => {
      setResults(data);
    });

    wsService.onNewResponse(() => {
      // Refetch results when new response is received
      apiClient.getPollResults(id).then(setResults).catch(console.error);
    });

    return () => {
      wsService.leavePoll(id);
      wsService.off('pollResults');
      wsService.off('newResponse');
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Loading results...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll || !results) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">No results available</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const colors = ["#6366F1", "#22C55E", "#F97316", "#06B6D4", "#A855F7", "#EF4444", "#EAB308"]; 

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>{poll.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          {poll.questions.map((q, idx) => {
            if (q.type === "text") {
              let texts: string[] = [];
              
              if (results.answers) {
                texts = results.answers
                  .filter((ans: any) => ans.questionId === q.id)
                  .map((ans: any) => ans.value)
                  .filter(Boolean);
              }
              
              return (
                <div key={q.id} className="space-y-3">
                  <h3 className="font-medium">Q{idx + 1}. {q.text}</h3>
                  {texts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No responses yet.</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1 max-h-64 overflow-auto">
                      {texts.slice(0, 20).map((t, i) => (
                        <li key={i} className="text-sm">{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            }

            const options = q.options || [];
            let counts: { name: string; value: number }[] = [];
            
            if (results.answers) {
              counts = options.map((option) => ({
                name: option,
                value: results.answers
                  .filter((ans: any) => ans.questionId === q.id)
                  .reduce((acc: number, ans: any) => {
                    if (q.type === "single") return acc + (ans.value === option ? 1 : 0);
                    if (Array.isArray(ans.value)) return acc + (ans.value.includes(option) ? 1 : 0);
                    return acc;
                  }, 0),
              }));
            }

            const total = counts.reduce((a, c) => a + c.value, 0) || 1;

            return (
              <div key={q.id} className="space-y-3">
                <h3 className="font-medium">Q{idx + 1}. {q.text}</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={counts}>
                        <XAxis dataKey="name" hide={false} />
                        <YAxis allowDecimals={false} />
                        <RTooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={counts} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40}>
                          {counts.map((_, i) => (
                            <Cell key={i} fill={colors[i % colors.length]} />
                          ))}
                        </Pie>
                        <RTooltip formatter={(v: any, n: any) => [`${v} (${Math.round((v as number)/total*100)}%)`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
