import SiteHeader from "@/components/layout/SiteHeader";
import PollBuilder from "@/components/polls/PollBuilder";
import { useSEO } from "@/hooks/useSEO";

const CreatePollPage = () => {
  useSEO({
    title: "Create Poll | Flow Poll Forge",
    description: "Build smart polls with conditional logic.",
    canonical: `${location.origin}/create`,
  });
  return (
    <main>
      <SiteHeader />
      <section className="py-6">
        <PollBuilder />
      </section>
    </main>
  );
};

export default CreatePollPage;
