export interface LabInfo {
  slug: string;
  id: string;
  title: string;
  domain: string;
  difficulty: 1 | 2 | 3;
  skills: string[];
  ready: boolean;
}

export const LABS: LabInfo[] = [
  { slug: "login", id: "LAB-01", title: "Login & Đăng ký", domain: "Auth", difficulty: 1, skills: ["getByLabel", "fill", "assertion", "BVA"], ready: true },
  { slug: "forms", id: "LAB-02", title: "Form đa dạng", domain: "Web elements", difficulty: 1, skills: ["radio", "checkbox", "select", "upload"], ready: false },
  { slug: "cart", id: "LAB-03", title: "Giỏ hàng & Checkout", domain: "E-commerce", difficulty: 2, skills: ["data-driven", "decision table"], ready: false },
];
