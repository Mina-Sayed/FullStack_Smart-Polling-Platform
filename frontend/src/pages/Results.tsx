import SiteHeader from "@/components/layout/SiteHeader";
import PollResults from "@/components/polls/PollResults";

const ResultsPage = () => {
  return (
    <main>
      <SiteHeader />
      <section className="py-6">
        <PollResults />
      </section>
    </main>
  );
};

export default ResultsPage;
