import type { MetadataRoute } from "next";
import { getLessons } from "@/lib/content";
import { LABS } from "@/lib/labs/registry";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/learn", "/labs", "/starter", "/glossary", "/cheatsheet", "/interview", "/placement", "/stats"].map((p) => ({
    url: SITE + p,
  }));
  const lessons = getLessons().map((l) => ({ url: `${SITE}/learn/${l.slug}` }));
  const labs = LABS.filter((l) => l.ready).map((l) => ({ url: `${SITE}/labs/${l.slug}` }));
  return [...pages, ...lessons, ...labs];
}
