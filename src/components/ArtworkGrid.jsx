
import ArtworkCard from "@/components/ArtworkCard";

export default function ArtworkGrid({ artworks = [] }) {
  if (artworks.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-[#888]">
        Belum ada karya seni yang tersedia.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
