import ArtworkActions from "@/components/ArtworkActions";
import ArtworkComments from "@/components/ArtworkComments";
import ArtworkOwnerActions from "@/components/ArtworkOwnerActions";
import ReportArtwork from "@/components/ReportArtwork";

async function getArtwork(id) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/artworks/${id}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.artwork || null;
  } catch (error) {
    console.error("Gagal mengambil detail karya:", error);
    return null;
  }
}

export default async function ArtworkDetailPage({ params }) {
  const { id } = await params;
  const artwork = await getArtwork(id);

  if (!artwork) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="font-heading text-3xl font-bold">
          Artwork Not Found
        </h1>
        <p className="mt-3 text-sm text-[#777]">
          Karya seni tidak ditemukan.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:px-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-[#e8e5df]">
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="h-full max-h-[700px] w-full object-cover"
          />
        </div>

        <div className="py-4">
          <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
            Artwork Detail
          </p>

          <h1 className="mt-4 font-heading text-4xl font-extrabold">
            {artwork.title}
          </h1>

          <p className="mt-3 text-sm text-[#777]">
            By {artwork.display_name ||artwork.username || "Unknown Creator"}
          </p>

          <div className="my-8 border-t border-[#e5e5e1]" />

          <h2 className="font-heading text-lg font-bold">
            About This Artwork
          </h2>

          <p className="mt-3 text-sm leading-8 text-[#666]">
            {artwork.description || "No description available."}
          </p>

          <ArtworkActions artworkId={artwork.id} />

          {artwork.tags?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {artwork.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#eae9e5] px-4 py-2 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <ArtworkComments artworkId={artwork.id} />

      <ReportArtwork artworkId={artwork.id} />
      
      <ArtworkOwnerActions artworkId={artwork.id} ownerId={artwork.user_id}/>
    </main>
  );
}
