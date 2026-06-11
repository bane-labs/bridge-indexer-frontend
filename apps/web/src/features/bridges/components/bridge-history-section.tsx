"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@atlas/ui";

import { getChainLabel, getDirectionLabel } from "../lib/formatters";
import { usePagination } from "../hooks/use-pagination";

import { BridgeHistoryEmptyState } from "./bridge-history-empty-state";
import { BridgeHistoryTable } from "./bridge-history-table";

import type { BridgeDirectionHistory } from "../types/bridge-history";

interface BridgeHistorySectionProps {
  direction: BridgeDirectionHistory;
}

/**
 * A direction section for the bridge history page.
 * Renders a heading (e.g. "Neo N3 → Neo X"), the history table, and a
 * pagination nav when there are more rows than fit on one page.
 */
export function BridgeHistorySection({ direction }: BridgeHistorySectionProps) {
  const label = getDirectionLabel(direction.sourceChain, direction.destinationChain);
  const sourceLabel = getChainLabel(direction.sourceChain);
  const destLabel = getChainLabel(direction.destinationChain);

  const {
    page,
    totalPages,
    setPage,
    hasPrevPage,
    hasNextPage,
    pageItems,
    startIndex,
    endIndex,
    visiblePages,
  } = usePagination(direction.rows);

  const total = direction.rows.length;
  const headingCount =
    total === 0 ? "0 operations" : total === 1 ? "1 operation" : `${total} operations`;

  return (
    <section aria-labelledby={`dir-${direction.sourceChain}-${direction.destinationChain}`}>
      <div className="mb-4">
        <h2
          id={`dir-${direction.sourceChain}-${direction.destinationChain}`}
          className="text-foreground text-lg font-semibold tracking-tight"
        >
          {label}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Operations relayed from {sourceLabel} to {destLabel} — {headingCount}
        </p>
      </div>

      {total === 0 ? (
        <BridgeHistoryEmptyState direction={label} />
      ) : (
        <>
          <BridgeHistoryTable
            rows={pageItems}
            sourceChain={direction.sourceChain}
            destinationChain={direction.destinationChain}
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing <span className="text-foreground font-medium">{startIndex + 1}</span>
                {" to "}
                <span className="text-foreground font-medium">{endIndex}</span>
                {" of "}
                <span className="text-foreground font-medium">{total}</span>
                {" results"}
              </p>

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      aria-disabled={!hasPrevPage}
                      tabIndex={hasPrevPage ? 0 : -1}
                      className={!hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      onClick={(e) => {
                        e.preventDefault();
                        if (hasPrevPage) setPage(page - 1);
                      }}
                    />
                  </PaginationItem>

                  {visiblePages.map((p, i) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === page}
                          tabIndex={0}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      aria-disabled={!hasNextPage}
                      tabIndex={hasNextPage ? 0 : -1}
                      className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      onClick={(e) => {
                        e.preventDefault();
                        if (hasNextPage) setPage(page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </section>
  );
}
