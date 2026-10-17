import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MusicToggle } from "@/components/MusicToggle";
import { Overture } from "@/components/Overture";
import { PageEffects } from "@/components/PageEffects";
import { About } from "@/components/sections/About";
import { Booking } from "@/components/sections/Booking";
import { Dine } from "@/components/sections/Dine";
import { Experiences } from "@/components/sections/Experiences";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Rooms } from "@/components/sections/Rooms";
import { Weddings } from "@/components/sections/Weddings";

export default function Home() {
  return (
    <>
      <Overture />
      <PageEffects />
      <MusicToggle />
      <Header />
      <main className="au-lang-fade">
        <Hero />
        <About />
        <Rooms />
        <Experiences />
        <Dine />
        <Weddings />
        <Booking />
        <FinalCta />
      </main>
      <div className="au-lang-fade">
        <Footer />
      </div>
    </>
  );
}
