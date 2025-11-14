import { MuscleGroup } from "@/pages/Exercises";
import bodyFront from "@/assets/body-front.png";
import bodyBack from "@/assets/body-back.png";

interface MuscleMapProps {
  view: "front" | "back";
  selectedMuscle: MuscleGroup | null;
  onMuscleSelect: (muscle: MuscleGroup) => void;
}

interface MuscleLabel {
  name: string;
  muscle: MuscleGroup;
  side: "left" | "right";
  top: string;
}

const frontLabels: MuscleLabel[] = [
  { name: "Ombros", muscle: "ombros", side: "left", top: "18%" },
  { name: "Bíceps", muscle: "biceps", side: "left", top: "32%" },
  { name: "Oblíquos", muscle: "obliquos", side: "left", top: "46%" },
  { name: "Abdutores", muscle: "abdutores", side: "left", top: "60%" },
  { name: "Quadríceps", muscle: "quadriceps", side: "left", top: "74%" },
  { name: "Peitoral", muscle: "peitoral", side: "right", top: "22%" },
  { name: "Abdômen", muscle: "abdomen", side: "right", top: "38%" },
  { name: "Antebraços", muscle: "antebracos", side: "right", top: "52%" },
  { name: "Adutores", muscle: "adutores", side: "right", top: "66%" },
  { name: "Cardio", muscle: "cardio", side: "right", top: "80%" },
];

const backLabels: MuscleLabel[] = [
  { name: "Trapézio", muscle: "trapezio", side: "right", top: "16%" },
  { name: "Tríceps", muscle: "triceps", side: "left", top: "30%" },
  { name: "Dorsais", muscle: "dorsais", side: "right", top: "32%" },
  { name: "Lombares", muscle: "lombares", side: "left", top: "46%" },
  { name: "Glúteos", muscle: "gluteos", side: "right", top: "52%" },
  { name: "Isquiotibiais", muscle: "isquiotibiais", side: "left", top: "66%" },
  { name: "Cardio", muscle: "cardio", side: "right", top: "70%" },
  { name: "Panturrilhas", muscle: "panturrilhas", side: "left", top: "84%" },
];

export function MuscleMap({ view, selectedMuscle, onMuscleSelect }: MuscleMapProps) {
  const labels = view === "front" ? frontLabels : backLabels;

  return (
    <div className="relative w-full flex items-center justify-center py-8">
      {/* Container with fixed max-width for consistent sizing */}
      <div className="relative w-full max-w-[600px] flex items-center justify-center">
        {/* Body Image - Centered */}
        <div className="relative flex items-center justify-center transition-all duration-300 ease-in-out">
          <img
            src={view === "front" ? bodyFront : bodyBack}
            alt={view === "front" ? "Vista frontal do corpo" : "Vista traseira do corpo"}
            className="w-[280px] h-auto object-contain transition-opacity duration-300"
            style={{ maxHeight: "600px" }}
          />
        </div>

        {/* Muscle Labels - Positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none">
          {labels.map((label) => (
            <div
              key={label.muscle}
              className={`absolute pointer-events-auto ${
                label.side === "left" ? "left-0" : "right-0"
              } cursor-pointer group`}
              style={{ top: label.top }}
              onClick={() => onMuscleSelect(label.muscle)}
            >
              {/* Label Container */}
              <div className={`flex items-center ${label.side === "left" ? "flex-row" : "flex-row-reverse"} gap-1`}>
                {/* Label Text */}
                <div
                  className={`text-sm font-medium text-black px-2 py-1 whitespace-nowrap ${
                    label.side === "left" ? "text-left" : "text-right"
                  } ${
                    selectedMuscle === label.muscle
                      ? "font-bold text-[#FF9F66]"
                      : "group-hover:font-semibold group-hover:text-[#FF9F66]"
                  } transition-all duration-200`}
                >
                  {label.name}
                </div>

                {/* Connector Line and Point */}
                <div className="relative flex items-center">
                  <div
                    className={`h-[1px] ${
                      selectedMuscle === label.muscle ? "bg-[#FF9F66]" : "bg-gray-400 group-hover:bg-[#FF9F66]"
                    } transition-colors duration-200`}
                    style={{ width: "40px" }}
                  />
                  <div
                    className={`w-2 h-2 ${
                      selectedMuscle === label.muscle ? "bg-[#FF9F66]" : "bg-gray-400 group-hover:bg-[#FF9F66]"
                    } transition-colors duration-200`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
