"use client";

import { FiUser, FiBookOpen, FiStar } from "react-icons/fi";
import type { ProductResponse } from "@/lib/product-api";

interface InstructorCardProps {
  producer: ProductResponse["producer"];
  producerName: string;
}

export default function InstructorCard({ producer, producerName }: InstructorCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5 dark:bg-white/3">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Instructor</h2>
      <div className="flex items-center gap-3">
        {producer?.avatar ? (
          <img src={producer.avatar} alt={producerName} className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/20 text-lg font-bold text-violet-600 dark:text-violet-400 ring-2 ring-primary/20">
            {producerName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{producerName}</p>
          <p className="text-sm text-gray-500 dark:text-white/45">Instructor</p>
        </div>
      </div>
    </div>
  );
}
