import SiteHeader from "@/components/layout/SiteHeader";
import PollRunner from "@/components/polls/PollRunner";

const PollPage = () => {
  return (
    <main>
      <SiteHeader />
      <section className="py-6">
        <PollRunner />
      </section>
    </main>
  );
};

export default PollPage;
