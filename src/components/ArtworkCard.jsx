import Link from "next/link";

export default function ArtworkCard({ artwork }) {
  return (
    <Link
      href={`/artworks/${artwork.id}`}
      className="group block"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#e8e5df]">
        {artwork.image_url ? (
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#888]">
            No Image
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-heading text-base font-bold">
          {artwork.title}
        </h3>

        <p className="mt-1 text-sm text-[#777]">
           {artwork.display_name ||artwork.username || "Unknown Creator"}
        </p>
      </div>
    </Link>
  );
}
