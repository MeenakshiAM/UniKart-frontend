import Link from "next/link";

function formatPrice(product) {
  const finalPrice = product?.price?.finalPrice;
  const basePrice = product?.price?.basePrice;
  const amount = finalPrice ?? basePrice ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({ product, actionArea }) {
  const imageUrl = product?.images?.[0]?.url;

  return (
    <article className="card-surface overflow-hidden rounded-[2rem]">
      <div className="aspect-[4/3] w-full bg-[rgba(157,60,31,0.08)]">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            No image
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
              {product.category || "Product"}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{product.title}</h2>
          </div>
          {product.status ? (
            <span className="rounded-full bg-[rgba(157,60,31,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              {product.status}
            </span>
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-7 text-[var(--muted)]">
          {product.description || "No description available."}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--muted)]">Price</p>
            <p className="text-lg font-semibold">{formatPrice(product)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--muted)]">Stock</p>
            <p className="text-lg font-semibold">{product.quantity ?? "N/A"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/products/${product._id}`} className="btn-secondary">
            View Details
          </Link>
          {actionArea}
        </div>
      </div>
    </article>
  );
}
