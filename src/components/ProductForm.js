"use client";

const categories = [
  "ELECTRONICS",
  "BOOKS",
  "FURNITURE",
  "CLOTHING",
  "FOOD",
  "SPORTS",
  "BEAUTY",
  "TOYS",
  "OTHER",
];

export const initialProductForm = {
  title: "",
  description: "",
  category: "ELECTRONICS",
  subCategory: "",
  basePrice: "",
  quantity: "",
  isDraft: false,
};

export default function ProductForm({
  form,
  onChange,
  onFilesChange,
  onSubmit,
  submitting,
  submitLabel,
  helper,
  fileNote,
}) {
  return (
    <form onSubmit={onSubmit} className="card-surface space-y-5 rounded-[2rem] p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Title</span>
          <input className="field" name="title" value={form.title} onChange={onChange} placeholder="Product title" />
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="field min-h-36"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Describe your product"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Category</span>
          <select className="field" name="category" value={form.category} onChange={onChange}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Sub Category</span>
          <input className="field" name="subCategory" value={form.subCategory} onChange={onChange} placeholder="Optional" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Base Price</span>
          <input className="field" type="number" min="1" name="basePrice" value={form.basePrice} onChange={onChange} placeholder="500" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Quantity</span>
          <input className="field" type="number" min="0" name="quantity" value={form.quantity} onChange={onChange} placeholder="10" />
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Images</span>
          <input className="field" type="file" accept="image/*" multiple onChange={onFilesChange} />
          <p className="text-sm text-[var(--muted)]">{fileNote || "Upload up to 5 images using the backend field name `images`."}</p>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-[rgba(114,75,43,0.12)] bg-white/70 p-4 md:col-span-2">
          <input type="checkbox" name="isDraft" checked={form.isDraft} onChange={onChange} className="mt-1 h-4 w-4 rounded" />
          <span className="text-sm text-[var(--muted)]">
            Save as draft using the exact backend field `isDraft`.
          </span>
        </label>
      </div>

      {helper ? <p className="text-sm text-[var(--muted)]">{helper}</p> : null}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
