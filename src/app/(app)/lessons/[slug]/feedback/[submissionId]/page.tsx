import { FeedbackDisplay } from "@/components/feedback-display";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ slug: string; submissionId: string }>;
}) {
  const { slug, submissionId } = await params;
  return <FeedbackDisplay slug={slug} submissionId={submissionId} />;
}
