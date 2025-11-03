import Hero from "@/components/Hero";
import ProjectOverview from "@/components/ProjectOverview";
import MiniGameDemo from "@/components/MiniGameDemo";

const Index = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        <Hero />
        <ProjectOverview />
        <section id="demo" className="border-t border-slate-800 pt-10">
          <MiniGameDemo />
        </section>
      </div>
    </main>
  );
};

export default Index;
