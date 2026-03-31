import { cn } from "@/lib/utils";

interface FormRowProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: "2" | "4" | "6" | "8";
  className?: string;
  children: React.ReactNode;
}

const colsMap = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const gapMap = {
  "2": "gap-2",
  "4": "gap-4",
  "6": "gap-6",
  "8": "gap-8",
};

export function FormRow({ columns = 1, gap = "4", className, children }: FormRowProps) {
  return (
    <div className={cn("grid grid-cols-1", colsMap[columns], gapMap[gap], className)}>
      {children}
    </div>
  );
}
