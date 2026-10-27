/** Thông báo cho các phần của trang Thống kê tải lại khi dữ liệu học thay đổi (nhập, xoá, sổ tay...). */
export const DATA_CHANGED = "lab-data-changed";

export function notifyDataChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(DATA_CHANGED));
}

export function onDataChanged(handler: () => void): () => void {
  window.addEventListener(DATA_CHANGED, handler);
  return () => window.removeEventListener(DATA_CHANGED, handler);
}
