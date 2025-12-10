export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prev = Number(searchParams.get("prev"));
  const current = Number(searchParams.get("current"));

  const progressPercent = ((current - prev) / prev) * 100;

  return Response.json({
    previousSGPA: prev,
    currentSGPA: current,
    progressPercent,
    status: progressPercent >= 0 ? "improved" : "declined"
  });
}
