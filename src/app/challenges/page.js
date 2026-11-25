
import Link from "next/link";

export const dynamic = "force-dynamic";
async function getChallenges() {
  try {
    const response = await fetch("http://localhost:3000/api/challenges", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return [];
    }

    return data.challenges || [];
  } catch (error) {
    console.error("Gagal mengambil challenges:", error);
    return [];
  }
}

function getStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "Upcoming";
  if (now > end) return "Completed";
  return "Ongoing";
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-16 md:px-12">
      <section className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[3px] text-[#888]">
          Creative Opportunities
        </p>

        <h1 className="mt-4 font-heading text-5xl font-extrabold">
          Art Challenges.
        </h1>

        <p className="mt-5 text-base leading-7 text-[#777]">
          Take on creative challenges, share your ideas, and showcase your
          artistic skills with the ARTFRA community.
        </p>
      </section>

      <section className="mt-14">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">
            Explore Challenges
          </h2>

          <p className="text-sm text-[#888]">
            {challenges.length} challenges
          </p>
        </div>

        {challenges.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#888]">
            Belum ada challenge yang tersedia.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => {
              const status = getStatus(
                challenge.start_date,
                challenge.end_date
              );

              return (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="group overflow-hidden rounded-2xl border border-[#e5e5e1] bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-[#e8e5df]">
                    {challenge.banner_url ? (
                      <img
                        src={challenge.banner_url}
                        alt={challenge.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#d6d0c7] to-[#77716a] font-heading text-2xl font-bold text-white">
                        ARTFRA
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <span className="rounded-full bg-[#f0efec] px-3 py-1 text-xs font-semibold">
                      {status}
                    </span>

                    <h3 className="mt-4 font-heading text-xl font-bold">
                      {challenge.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#777]">
                      {challenge.description}
                    </p>

                    <div className="mt-6 border-t border-[#eee] pt-4">
                      <p className="text-xs text-[#888]">
                        Curated by
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {challenge.curator_name || challenge.curator_username}
                      </p>

                      <div className="mt-4 flex justify-between text-xs text-[#777]">
                        <span>
                          {challenge.total_submissions} submissions
                        </span>

                        <span>
                          {new Date(challenge.end_date).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
