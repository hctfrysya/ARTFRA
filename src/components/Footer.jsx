
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#202020] px-6 py-12 text-white md:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 md:flex-row">
        <div>
          <Link
            href="/"
            className="font-heading text-3xl font-extrabold tracking-[-2px]"
          >
            ARTFRA.
          </Link>

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
  );
}
