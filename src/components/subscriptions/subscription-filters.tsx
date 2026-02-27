"use client";

import { CATEGORIES, BILLING_CYCLE_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { Category, SubscriptionStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List, X } from "lucide-react";

export type SortKey = "monthly_cost" | "next_billing" | "name";
export type ViewMode = "grid" | "list";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: Category | "all";
  onCategoryFilterChange: (v: Category | "all") => void;
  statusFilter: SubscriptionStatus | "all";
  onStatusFilterChange: (v: SubscriptionStatus | "all") => void;
  typeFilter: "recurring" | "lifetime" | "all";
  onTypeFilterChange: (v: "recurring" | "lifetime" | "all") => void;
  sortKey: SortKey;
  onSortKeyChange: (v: SortKey) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}

export function SubscriptionFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  sortKey,
  onSortKeyChange,
  viewMode,
  onViewModeChange,
}: Props) {
  const hasFilters =
    categoryFilter !== "all" || statusFilter !== "all" || typeFilter !== "all";

  function clearFilters() {
    onCategoryFilterChange("all");
    onStatusFilterChange("all");
    onTypeFilterChange("all");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索订阅..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={categoryFilter} onValueChange={(v) => onCategoryFilterChange(v as Category | "all")}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as SubscriptionStatus | "all")}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as "recurring" | "lifetime" | "all")}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="recurring">周期订阅</SelectItem>
              <SelectItem value="lifetime">买断制</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortKey} onValueChange={(v) => onSortKeyChange(v as SortKey)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly_cost">月度成本</SelectItem>
              <SelectItem value="next_billing">续费日期</SelectItem>
              <SelectItem value="name">名称</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg overflow-hidden shrink-0">
            <button
              type="button"
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
          <X className="h-3 w-3 mr-1" />
          清除筛选
        </Button>
      )}
    </div>
  );
}
