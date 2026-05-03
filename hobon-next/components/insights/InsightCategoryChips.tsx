"use client";

export type InsightCategoryChip = {
  _id: string;
  title: string | null;
  slug: string | null;
};

export function InsightCategoryChips({ categories }: { categories: InsightCategoryChip[] }) {
  return (
    <div className="ins-filters">
      {/* TODO: HOB-XX filter functionality */}
      {categories.map((c) => (
        <button
          key={c._id}
          type="button"
          className="ins-chip"
          onClick={() => {
            console.log("filter not implemented", c.slug);
          }}
        >
          {c.title ?? c.slug}
        </button>
      ))}
    </div>
  );
}
