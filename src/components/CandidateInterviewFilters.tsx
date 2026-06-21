"use client";

import { cn } from "@/lib/utils";

export type CandidateFilter =
    | "all"
    | "upcoming"
    | "live"
    | "completed"
    | "succeeded"
    | "failed"
    | "missed"
    | "cancelled";

type Props = {
    activeFilter: CandidateFilter;
    onFilterChange: (filter: CandidateFilter) => void;
    counts: Record<CandidateFilter, number>;
};

export default function CandidateInterviewFilters({
    activeFilter,
    onFilterChange,
    counts,
}: Props) {
    const filters = [
        { key: "all", label: "All" },
        { key: "upcoming", label: "Upcoming" },
        { key: "live", label: "Live" },
        { key: "completed", label: "Feedback Pending" },
        { key: "succeeded", label: "Passed" },
        { key: "failed", label: "Failed" },
        { key: "missed", label: "Missed" },
        { key: "cancelled", label: "Cancelled" },
    ] as const;

    return (
        <div className="mt-6 overflow-x-auto">
            <div className="inline-flex min-w-max rounded-xl border bg-card p-1 shadow-sm">
                {filters.map((filter) => {
                    const active =
                        activeFilter === filter.key;

                    return (
                        <button
                            key={filter.key}
                            onClick={() =>
                                onFilterChange(filter.key)
                            }
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                                active
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span>{filter.label}</span>

                            <span
                                className={cn(
                                    "rounded-full px-2 py-0.5 text-xs",
                                    active
                                        ? "bg-primary-foreground/20"
                                        : "bg-muted"
                                )}
                            >
                                {counts[filter.key]}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}