import { localAdapter } from "./local-adapter";
import type { StorageAdapter } from "./types";

/** Đổi sang SupabaseAdapter (P2) tại đây mà không sửa UI. */
export const storage: StorageAdapter = localAdapter;
export * from "./types";
