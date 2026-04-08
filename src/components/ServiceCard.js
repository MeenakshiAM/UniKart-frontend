import Link from "next/link";

function formatPrice(service) {
  const amount = service?.pricing?.basePrice ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: service?.pricing?.currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ServiceCard({ service }) {
  const imageUrl = service?.images?.[0]?.url;

  return (
    <article className="card-surface overflow-hidden rounded-[2rem]">
      <div className="aspect-[4/3] bg-[rgba(85,127,102,0.12)]">
        {imageUrl ? (
          <img src={imageUrl} alt={service.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            No image
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
          {service.category || "Service"}
        </p>
        <h2 className="text-xl font-semibold tracking-tight">{service.title}</h2>
        <p className="line-clamp-3 text-sm leading-7 text-[var(--muted)]">
          {service.description || "No description available."}
        </p>
        <div className="flex items-center justify-between gap-3 text-sm">
          <div>
            <p className="text-[var(--muted)]">Starting at</p>
            <p className="font-semibold">{formatPrice(service)}</p>
          </div>
          <div className="text-right">
            <p className="text-[var(--muted)]">Mode</p>
            <p className="font-semibold capitalize">{(service.serviceType || "service").replaceAll("_", " ")}</p>
          </div>
        </div>
        <Link href={`/services/${service._id}`} className="btn-secondary">
          View Service
        </Link>
      </div>
    </article>
  );
}
