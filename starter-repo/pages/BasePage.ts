import type { Page } from "@playwright/test";

/** Lớp cha cho mọi Page Object: giữ `page` và hàm điều hướng dùng chung. */
export abstract class BasePage {
  /** Đường dẫn của trang (ghép với baseURL trong playwright.config.ts). */
  abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /** Mở trang; `bugs` bật bug có chủ đích của lab, ví dụ ["BUG-01"]. */
  async goto(bugs: string[] = []) {
    const query = bugs.length ? `?bugs=${bugs.join(",")}` : "";
    await this.page.goto(this.path + query);
  }
}
