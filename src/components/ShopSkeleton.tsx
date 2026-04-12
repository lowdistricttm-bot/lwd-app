"use client";

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const ShopSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[3/4] w-full bg-zinc-900 rounded-none" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-zinc-900" />
            <Skeleton className="h-5 w-full bg-zinc-900" />
            <Skeleton className="h-4 w-16 bg-zinc-900" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopSkeleton;