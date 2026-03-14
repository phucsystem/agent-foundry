interface TaskFormStepsProps {
  currentStep: number;
  labels: string[];
}

export function TaskFormSteps({ currentStep, labels }: TaskFormStepsProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={label} className="contents">
            {index > 0 && <div className="w-10 h-0.5 bg-border" />}
            <div
              className={`flex items-center gap-2 text-sm ${
                isActive
                  ? "text-primary font-semibold"
                  : isCompleted
                  ? "text-success"
                  : "text-text-muted"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : isCompleted
                    ? "bg-success text-white border-success"
                    : "border-current"
                }`}
              >
                {isCompleted ? "\u2713" : stepNumber}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
