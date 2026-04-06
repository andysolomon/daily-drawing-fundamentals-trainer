import { LessonDetail } from "@/components/lesson-detail";

export const dynamic = "force-dynamic";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LessonDetail slug={slug} />;
}
