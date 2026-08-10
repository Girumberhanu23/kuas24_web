import { Suspense } from "react";
import PredictorClient from "./PredictorClient";

export default function PredictorPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-text-secondary">Loading predictor…</div>}>
      <PredictorClient />
    </Suspense>
  );
}
