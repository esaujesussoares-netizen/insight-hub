interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="w-full bg-background/80 backdrop-blur-sm border-b border-border/50 py-4 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-between items-center">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                step < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step === currentStep
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
