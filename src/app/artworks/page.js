import ArtworkGrid from "@/components/ArtworkGrid";

export const dynamic = "force-dynamic";
async function getArtworks() {
  try {
    const response = await fetch("http://localhost:3000/api/artworks", {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.artworks || [];
  } catch (error) {
    console.error("Gagal mengambil karya:", error);
    return [];
  }
}

export default async function ArtworksPage() {
  const artworks = await getArtworks();

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-16 md:px-12">
      <div className="mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-[#888]">
          Discover Creativity
        </p>

        <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
          Explore Art<span className="text-[#999]">.</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-7 text-[#777]">
          Discover unique artworks and creative expressions from artists
          in the ARTFRA community.
        </p>
      </div>

      <ArtworkGrid artworks={artworks} />
    </main>
  );
}
