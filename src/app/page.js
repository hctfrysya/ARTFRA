
import Link from "next/link";

const artworks = [
  {
    id: 1,
    title: "Silent Geometry",
    creator: "Aurelia Studio",
    category: "3D ART",
    style: "artwork-visual",
  },
  {
    id: 2,
    title: "Fragments of Time",
    creator: "Nara Collective",
    category: "DIGITAL ART",
    style: "artwork-visual-two",
  },
  {
    id: 3,
    title: "Beyond the Form",
    creator: "Studio Mono",
    category: "ABSTRACT",
    style: "artwork-visual-three",
  },
];

const categories = [
  "Digital Illustration",
  "3D Art",
  "Photography",
  "Abstract",
  "Typography",
  "Concept Art",
];

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* NAVBAR */}
      <header className="border-b border-[#e5e5e1]">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-12">

          <Link href="/" className="font-heading text-2xl font-extrabold tracking-[-1.5px]">
            ARTFR<span className="text-[#92928d]">A.</span>
          </Link>

          <div className="hidden items-center gap-9 text-sm text-[#555] md:flex">
            <Link href="/" className="text-black">Discover</Link>
            <Link href="/artworks" className="hover:text-black">Explore Art</Link>
            <Link href="/challenges" className="hover:text-black">Challenges</Link>
            <Link href="/profile" className="hover:text-black">Creators</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-4 py-2 text-sm md:block"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-[#202020] px-5 py-2.5 text-sm text-white transition hover:bg-[#444]"
            >
              Join ARTFRА
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-12 md:py-28">

        <div>
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-10 bg-black"></span>
            <p className="text-xs font-semibold tracking-[3px] text-[#777]">
              THE CREATIVE SPACE
            </p>
          </div>

          <h1 className="hero-title font-heading text-6xl font-semibold leading-[1.08] tracking-[-4px] md:text-[76px]">
            Art has
            <br />
            no <span className="text-[#99958e]">limits.</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-8 text-[#777]">
            A space where creativity meets expression.
            Discover digital artworks, share your ideas,
            and connect with artists around the world.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/artworks"
              className="rounded-full bg-[#202020] px-7 py-4 text-sm text-white transition hover:bg-[#444]"
            >
              Explore artworks ↗
            </Link>

            <Link
              href="/register"
              className="rounded-full border border-[#d8d8d3] px-7 py-4 text-sm transition hover:bg-white"
            >
              Start creating
            </Link>
          </div>

          <div className="mt-16 flex gap-12 border-t border-[#e5e5e1] pt-7">
            <div>
              <p className="font-heading text-2xl font-bold">01.</p>
              <p className="mt-1 text-xs text-[#888]">Discover</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold">02.</p>
              <p className="mt-1 text-xs text-[#888]">Create</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold">03.</p>
              <p className="mt-1 text-xs text-[#888]">Connect</p>
            </div>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="relative">
          <div className="artwork-visual relative aspect-[4/5] overflow-hidden rounded-sm">
            <div className="absolute left-[12%] top-[12%] h-[55%] w-[55%] rotate-[-12deg] rounded-[45%_55%_65%_35%] border border-white/40 bg-white/10 backdrop-blur-sm"></div>

            <div className="absolute bottom-[12%] right-[12%] h-[48%] w-[42%] rotate-[18deg] rounded-t-full bg-[#39332f]/50"></div>

            <div className="absolute left-8 top-8 text-xs tracking-[3px] text-white">
              ART / 001
            </div>

            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-xs tracking-[3px]">FEATURED COLLECTION</p>
              <p className="font-heading mt-2 text-3xl font-semibold">
                The Art of Form
              </p>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-5 hidden border border-[#e5e5e1] bg-[#f8f8f6] p-5 sm:block">
            <p className="text-[10px] tracking-[2px] text-[#888]">
              CURATED FOR YOU
            </p>
            <p className="mt-2 font-heading text-sm font-semibold">
              Creativity without boundaries.
            </p>
          </div>

          <span className="absolute -right-4 -top-5 font-heading text-5xl font-light text-[#c7c4bd]">
            ✳
          </span>
        </div>
      </section>

      {/* FEATURED ARTWORKS */}
      <section className="border-t border-[#e5e5e1] bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">

          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[3px] text-[#999]">
                SELECTED WORKS
              </p>
              <h2 className="font-heading mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Discover artworks.
              </h2>
            </div>

            <Link
              href="/artworks"
              className="hidden border-b border-black pb-1 text-sm sm:block"
            >
              View all artworks ↗
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {artworks.map((artwork) => (
              <article key={artwork.id} className="group">
                <div className={`${artwork.style} aspect-[4/5] overflow-hidden transition duration-500 group-hover:scale-[0.99]`}>
                  <div className="flex h-full items-end justify-between p-5">
                    <span className="text-xs tracking-[2px] text-white">
                      {artwork.category}
                    </span>
                    <span className="text-xl text-white">↗</span>
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      {artwork.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#888]">
                      By {artwork.creator}
                    </p>
                  </div>
                  <span className="text-lg">↗</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-12">
        <p className="text-xs font-semibold tracking-[3px] text-[#999]">
          FIND YOUR INSPIRATION
        </p>

        <h2 className="font-heading mb-10 mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Explore by category.
        </h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              href="/artworks"
              key={category}
              className="flex items-center justify-between border border-[#e5e5e1] bg-white p-5 transition hover:border-black md:p-7"
            >
              <span className="text-sm font-medium">{category}</span>
              <span className="text-[#999]">0{index + 1} ↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#202020] px-6 py-12 text-white md:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 md:flex-row">

          <div>
            <h2 className="font-heading text-3xl font-extrabold tracking-[-2px]">
              ARTFRA.
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-7 text-[#aaa]">
              A creative space to discover, share,
              and celebrate digital art.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-sm text-[#ccc]">
            <Link href="/artworks">Explore Art</Link>
            <Link href="/challenges">Challenges</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Join Us</Link>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[1440px] border-t border-white/15 pt-6 text-xs text-[#888]">
          © 2026 ARTFRA. All rights reserved.
        </div>
      </footer>

    </main>
  );
}
