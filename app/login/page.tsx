import { Suspense } from "react";

import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center py-8 sm:py-12">
          Loading...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
