import SiteHeader from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Poll } from "@/components/polls/PollTypes";

const Index = () => {
  const navigate = useNavigate();
  const [recentPolls, setRecentPolls] = useState<Poll[]>([]);
  const [isLoadingPolls, setIsLoadingPolls] = useState(false);

  useSEO({
    title: "Smart Polling Platform | Flow Poll Forge",
    description: "Create conditional logic polls and view real-time results.",
    canonical: location.origin,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Flow Poll Forge",
      url: location.origin,
      description: "Create conditional logic polls and view results.",
    },
  });

  useEffect(() => {
    const fetchRecentPolls = async () => {
      try {
        setIsLoadingPolls(true);
        const polls = await apiClient.getPolls();
        setRecentPolls(polls.slice(0, 6)); // Show only 6 most recent polls
      } catch (error) {
        console.error("Failed to fetch polls:", error);
      } finally {
        setIsLoadingPolls(false);
      }
    };

    fetchRecentPolls();
  }, []);

  return (
    <main>
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" aria-hidden="true" />
        <div className="container mx-auto min-h-[60vh] flex items-center py-16">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Build Smart Polls with Conditional Logic</h1>
            <p className="text-lg text-muted-foreground">Create dynamic polls, show follow-up questions based on answers, and visualize results instantly.</p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => navigate('/create')}>Create a poll</Button>
            </div>
            <Card className="bg-card/60 backdrop-blur shadow-elevated">
              <CardContent className="text-sm text-muted-foreground py-4">
                Powered by NestJS backend with PostgreSQL, real-time WebSocket updates, and JWT authentication.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Polls Section */}
      <section className="container mx-auto py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Recent Polls</h2>
          <p className="text-muted-foreground">Explore polls created by the community</p>
        </div>
        
        {isLoadingPolls ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentPolls.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPolls.map((poll) => (
              <Card key={poll.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/poll/${poll.id}`)}>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {poll.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{poll.questions.length} question{poll.questions.length !== 1 ? 's' : ''}</span>
                    <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" 
                            onClick={(e) => { e.stopPropagation(); navigate(`/results/${poll.id}`); }}>
                      View Results
                    </Button>
                    <Button size="sm"
                            onClick={(e) => { e.stopPropagation(); navigate(`/poll/${poll.id}`); }}>
                      Take Poll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">No polls available yet</p>
              <Button onClick={() => navigate('/create')}>Create the first poll</Button>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
};

export default Index;
