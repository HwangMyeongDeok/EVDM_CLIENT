export const formatPrice = (price: number) =>
  price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    Red: "#ef4444",
    Blue: "#3b82f6",
    Green: "#22c55e",
    Black: "#1f2937",
    White: "#f9fafb",
    Silver: "#d1d5db",
    Gray: "#6b7280",
    Yellow: "#eab308",
    Orange: "#f97316",
    Purple: "#a855f7",
    Pink: "#ec4899",
    Cyan: "#06b6d4",
  };
  return colorMap[colorName] || "#cccccc";
};
