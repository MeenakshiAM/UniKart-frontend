"use client";

const categories = [
  "",
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

export default function ProductFilters({ filters, onChange, onSubmit, onReset }) {
  return (
    <form onSubmit={onSubmit} className="card-surface grid gap-4 rounded-[2rem] p-5 md:grid-cols-5">
      <label className="block space-y-2 md:col-span-2">
        <span className="text-sm font-medium">Search</span>
        <input
          className="field"
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="Search products"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Category</span>
        <select className="field" value={filters.category} onChange={(event) => onChange("category", event.target.value)}>
          {categories.map((category) => (
            <option key={category || "all"} value={category}>
              {category || "All"}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Min Price</span>
        <input
          className="field"
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={(event) => onChange("minPrice", event.target.value)}
          placeholder="0"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Max Price</span>
        <input
          className="field"
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={(event) => onChange("maxPrice", event.target.value)}
          placeholder="5000"
        />
      </label>

      <label className="block space-y-2 md:col-span-2">
        <span className="text-sm font-medium">Sort</span>
        <select className="field" value={filters.sort} onChange={(event) => onChange("sort", event.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </label>

      <div className="flex items-end gap-3 md:col-span-3">
        <button type="submit" className="btn-primary">
          Apply Filters
        </button>
        <button type="button" className="btn-secondary" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
