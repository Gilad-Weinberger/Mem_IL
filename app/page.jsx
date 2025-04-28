import React, { Suspense } from "react";
import PageLayout from "@/components/shared/layout/PageLayout";
import Hero from "@/components/homepage/Hero";
import LoadingSpinner from "@/components/shared/ui/LoadingSpinner";

const Page = () => {
  return (
    <PageLayout>
      <Suspense
        fallback={<LoadingSpinner size="lg" className="min-h-[60vh]" />}
      >
        <Hero />
      </Suspense>
    </PageLayout>
  );
};

export default Page;
