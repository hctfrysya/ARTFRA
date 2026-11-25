
import Link from "next/link";

export const dynamic = "force-dynamic";
async function getCreators() {
  try {
    const response = await fetch("http://localhost:3000/api/creators", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return [];
    }

    return data.creators || [];
  } catch (error) {
    console.error("Gagal mengambil creators:", error);
    return [];
  }
}

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-16 md:px-12">
      <section className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
          The Creative Community
        </p>

        <h1 className="mt-4 font-heading text-5xl font-extrabold">
          Meet the Creators.
        </h1>

        <p className="mt-5 text-base leading-7 text-[#777]">
          Discover artists, explore their creative journeys, and appreciate
          the people behind every artwork.
        </p>
      </section>

      <section className="mt-14">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">
            All Creators
          </h2>

          <p className="text-sm text-[#888]">
            {creators.length} creators
          </p>
        </div>

        {creators.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#888]">
            Belum ada creator yang tersedia.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creators/${creator.username}`}
                className="group rounded-2xl border border-[#e5e5e1] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e5df] font-heading text-xl font-bold">
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

                  <div className="min-w-0">
                    <h3 className="truncate font-heading font-bold group-hover:underline">
                      {creator.display_name || creator.username}
                    </h3>

                    <p className="mt-1 text-sm text-[#888]">
                      @{creator.username}
                    </p>
                  </div>
                </div>

                <p className="mt-5 min-h-12 text-sm leading-6 text-[#777]">
                  {creator.bio || "Creator di komunitas ARTFRA."}
                </p>

                <div className="mt-5 border-t border-[#eee] pt-4">
                  <p className="text-xs font-semibold text-[#555]">
                    {creator.total_artworks} artworks
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
