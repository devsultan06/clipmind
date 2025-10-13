interface TagsProps {
  tags: string[];
  className?: string;
  limit?: number;
}

export default function Tags({ tags, className = "", limit }: TagsProps) {
  const displayTags = limit ? tags.slice(0, limit) : tags;

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTags.map((tag: string, index: number) => (
        <span
          key={index}
          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
        >
          {tag}
        </span>
      ))}
      {limit && tags.length > limit && (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
          +{tags.length - limit} more
        </span>
      )}
    </div>
  );
}
