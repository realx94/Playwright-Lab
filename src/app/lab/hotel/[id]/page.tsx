import Link from "next/link";
import { notFound } from "next/navigation";
import { AMENITIES, HOTELS, hotelById, money } from "@/lib/labs/hotel-rules";

export const metadata = { title: "Chi tiết khách sạn" };

export function generateStaticParams() {
  return HOTELS.map((h) => ({ id: h.id }));
}

export default async function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = hotelById(id);
  if (!h) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold" data-testid="detail-name">
        {h.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {h.city} · {h.stars} sao · {h.rating.toFixed(1)}/10
      </p>
      <p className="mt-4 font-semibold" data-testid="detail-price">
        {money(h.price)} mỗi đêm
      </p>
      <ul className="mt-3 list-disc pl-5 text-sm">
        {h.amenities.map((a) => (
          <li key={a}>{AMENITIES.find((x) => x.id === a)!.label}</li>
        ))}
      </ul>
      <Link className="mt-6 inline-block text-sm underline" href="/lab/hotel">
        ← Quay lại tìm kiếm
      </Link>
    </div>
  );
}
