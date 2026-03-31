import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { STEPPER_STEPS, type StatusRomaneioNew, isStepAccessible, getMaxStepForStatus } from "../romaneio-types";

interface RomaneioStepperProps {
  currentStep: number;
  status: StatusRomaneioNew;
  onStepClick: (step: number) => void;
}

export function RomaneioStepper({ currentStep, status, onStepClick }: RomaneioStepperProps) {
  const maxStep = getMaxStepForStatus(status);

  return (
    <nav className="mb-6">
      <ol className="flex items-center w-full">
        {STEPPER_STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < maxStep || status === "FINALIZADO";
          const isAccessible = isStepAccessible(step.id, status);
          const isLast = idx === STEPPER_STEPS.length - 1;

          return (
            <li
              key={step.id}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <button
                type="button"
                disabled={!isAccessible}
                onClick={() => isAccessible && onStepClick(step.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                  isActive && "bg-primary/10 ring-1 ring-primary",
                  isAccessible && !isActive && "hover:bg-muted cursor-pointer",
                  !isAccessible && "opacity-40 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && !isCompleted && "bg-primary text-primary-foreground",
                    !isActive && !isCompleted && "border-2 border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="hidden sm:block">
                  <p className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-foreground")}>{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.description}</p>
                </div>
              </button>
              {!isLast && (
                <div className={cn(
                  "hidden sm:block flex-1 h-px mx-2",
                  step.id < maxStep ? "bg-primary" : "bg-muted-foreground/20"
                )} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
