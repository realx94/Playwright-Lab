import { Suspense } from "react";
import { IdpConsent } from "@/components/lab/oauth/idp-consent";

export const metadata = { title: "LabID — Cấp quyền" };

export default function IdpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Suspense>
        <IdpConsent />
      </Suspense>
    </div>
  );
}
