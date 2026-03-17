import { Suspense } from "react";

import VerifyOtpClient from "./verify-otp-client";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpClient />
    </Suspense>
  );
}
