import Link from "next/link";
import ChallengeSubmission from "@/components/ChallengeSubmission";

async function getChallenge(id) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/challenges/${id}`,
      { cache: "no-store" }
    );

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Gagal mengambil detail challenge:", error);
    return null;
  }
}

function getStatus(startDate, endDate) {
  const now = new Date();

  if (now < new Date(startDate)) return "Upcoming";
  if (now > new Date(endDate)) return "Completed";
  return "Ongoing";
}

export default async function ChallengeDetailPage({ params }) {
  const { id } = await params;
  const data = await getChallenge(id);

  if (!data || !data.success) {
    return (
      <main className="min-h-screen px-6 py-24 text-center">
        <h1 className="font-heading text-3xl font-bold">
          Challenge tidak ditemukan.
        </h1>
        <Link href="/challenges" className="mt-6 inline-block underline">
          Kembali ke Challenges
        </Link>
      </main>
    );
  }

  const challenge = data.challenge;
  const status = getStatus(challenge.start_date, challenge.end_date);

  return (
    <main className="mx-auto min-h-screen max-w-[1100px] px-6 py-16 md:px-12">
      <Link href="/challenges" className="text-sm text-[#777] hover:text-black">
        ← Back to Challenges
      </Link>

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#e5e5e1] bg-white">
        {challenge.banner_url ? (
          <img
            src={challenge.banner_url}
            alt={challenge.title}
            className="h-64 w-full object-cover md:h-80"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-gradient-to-br from-[#d6d0c7] to-[#77716a] font-heading text-5xl font-bold text-white md:h-80">
            ARTFRA
          </div>
        )}

        <div className="p-7 md:p-10">
          <span className="rounded-full bg-[#f0efec] px-4 py-2 text-xs font-semibold">
            {status}
          </span>

          <h1 className="mt-6 font-heading text-3xl font-extrabold md:text-5xl">
            {challenge.title}
          </h1>

          <p className="mt-4 text-sm text-[#888]">
            Curated by {challenge.curator_name || challenge.curator_username}
          </p>

          <div className="mt-8 grid gap-5 border-y border-[#eee] py-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[#888]">Start Date</p>
              <p className="mt-2 text-sm font-semibold">
                {new Date(challenge.start_date).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#888]">End Date</p>
              <p className="mt-2 text-sm font-semibold">
                {new Date(challenge.end_date).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#888]">Total Submissions</p>
              <p className="mt-2 text-sm font-semibold">
                {challenge.total_submissions}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold">About Challenge</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#777]">
              {challenge.description}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold">Challenge Rules</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#777]">
              {challenge.rules}
            </p>
          </div>

          {challenge.prize && (
            <div className="mt-8 rounded-xl bg-[#f5f4f1] p-6">
              <p className="text-xs font-semibold uppercase tracking-[2px] text-[#888]">
                Challenge Prize
              </p>
              <p className="mt-3 font-heading text-xl font-bold">
                {challenge.prize}
              </p>
            </div>
          )}

          {status === "Ongoing" && (
            <ChallengeSubmission challengeId={id} />
          )}

          <Link
            href={`/curator/challenges/${id}/submissions`}
            className="mt-8 inline-block rounded-full border border-[#171717] px-6 py-3 text-sm font-semibold hover:bg-[#171717] hover:text-white"
          >
            View Submissions
          </Link>
        </div>
      </section>
    </main>
  );
}
