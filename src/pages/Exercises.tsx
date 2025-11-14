import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCw, X } from "lucide-react";
import { MuscleMap } from "@/components/MuscleMap";
import { ExerciseList } from "@/components/ExerciseList";
import { BottomNav } from "@/components/BottomNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type MuscleGroup = 
  | "ombros" | "peitoral" | "biceps" | "antebracos" | "abdomen" 
  | "obliquos" | "abdutores" | "adutores" | "quadriceps" | "cardio"
  | "trapezio" | "triceps" | "dorsais" | "lombares" | "gluteos" 
  | "isquiotibiais" | "panturrilhas";

const Exercises = () => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [view, setView] = useState<"front" | "back">("front");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRotate = () => {
    setView(prev => prev === "front" ? "back" : "front");
    setSelectedMuscle(null);
  };

  const handleMuscleSelect = (muscle: MuscleGroup) => {
    setSelectedMuscle(muscle);
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <div className="sticky top-16 md:top-20 bg-white z-10 px-4 py-4 border-b">
          <h1 className="text-2xl font-bold mb-4 text-black">Escolha um exercício</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 text-black placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Muscle Map */}
            <div className="relative">
              <MuscleMap 
                view={view}
                selectedMuscle={selectedMuscle}
                onMuscleSelect={handleMuscleSelect}
              />
              
              {/* Rotate Button */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleRotate}
                  className="bg-[#FF9F66] hover:bg-[#FF8F56] text-white rounded-full px-6 py-3 shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2"
                >
                  <RotateCw className="w-5 h-5" />
                  <span className="font-medium">Rotacionar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">
                Exercícios - {selectedMuscle}
              </DialogTitle>
            </DialogHeader>
            {selectedMuscle && (
              <ExerciseList 
                muscle={selectedMuscle}
                searchQuery={searchQuery}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Bottom Navigation */}
        <BottomNav currentPage="exercises" />
      </div>
    </Layout>
  );
};

export default Exercises;
