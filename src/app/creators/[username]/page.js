
import Link from "next/link";
import ArtworkGrid from "@/components/ArtworkGrid";

async function getCreator(username) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/creators/${username}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Gagal mengambil profil creator:", error);
    return null;
  }
}

export default async function CreatorDetailPage({ params }) {
  const { username } = await params;
  const data = await getCreator(username);

  if (!data || !data.success) {
    return (
      <main className="min-h-screen px-6 py-24 text-center">
        <h1 className="font-heading text-3xl font-bold">
          Creator tidak ditemukan.
        </h1>
        <Link href="/creators" className="mt-6 inline-block underline">
          Kembali ke Creators
        </Link>
      </main>
    );
  }

  const { creator, artworks } = data;

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-16 md:px-12">
      <Link
        href="/creators"
        className="text-sm text-[#777] hover:text-black"
      >
        ← Back to Creators
      </Link>

      <section className="mt-10 rounded-2xl border border-[#e5e5e1] bg-white p-8 md:p-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e5df] font-heading text-4xl font-bold">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              (creator.display_name || creator.username)
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
              ARTFRA Creator
            </p>

            <h1 className="mt-2 font-heading text-4xl font-extrabold">
              {creator.display_name || creator.username}
            </h1>

            <p className="mt-2 text-sm text-[#888]">
              @{creator.username}
            </p>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-7 text-[#777]">
          {creator.bio || "Creator di komunitas ARTFRA."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {creator.website_url && (
            <a
              href={creator.website_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#ddd] px-5 py-2 text-sm hover:bg-[#f5f5f3]"
            >
              Website
            </a>
          )}

          {creator.instagram_url && (
            <a
              href={creator.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#ddd] px-5 py-2 text-sm hover:bg-[#f5f5f3]"
            >
              Instagram
            </a>
          )}

          {creator.behance_url && (
            <a
              href={creator.behance_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#ddd] px-5 py-2 text-sm hover:bg-[#f5f5f3]"
            >
              Behance
            </a>
          )}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
            Creative Collection
          </p>

          <h2 className="mt-3 font-heading text-3xl font-bold">
            Artworks by {creator.display_name || creator.username}
          </h2>

          <p className="mt-2 text-sm text-[#888]">
            {artworks.length} artworks published
          </p>
        </div>

        <ArtworkGrid artworks={artworks} />
      </section>
    </main>
  );
}
