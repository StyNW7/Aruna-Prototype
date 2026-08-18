import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-aruna-border px-4 py-3 sm:flex-row">
      {totalItems !== undefined && pageSize !== undefined ? (
        <p className="text-xs text-aruna-textSecondary">
          Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} dari {totalItems} data
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 text-xs font-medium text-aruna-text">
          Halaman {page} / {Math.max(totalPages, 1)}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
