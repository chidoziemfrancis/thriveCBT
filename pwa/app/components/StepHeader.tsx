import BackButton from "./BackButton";
import ProgressBar from "./ProgressBar";

export default function StepHeader({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      <ProgressBar step={step} totalSteps={totalSteps} />
    </div>
  );
}
