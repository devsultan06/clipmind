export const formatViewCount = (viewCount: string | number) => {
  const count =
    typeof viewCount === "string"
      ? parseInt(viewCount.replace(/,/g, ""))
      : viewCount;

  if (isNaN(count)) return viewCount;

  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(".0", "") + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(".0", "") + "K";
  }
  return count.toString();
};
