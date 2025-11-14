import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Layers, SplitSquareHorizontal } from "lucide-react";

interface PhotoComparisonOverlayProps {
  firstPhoto: {
    url: string;
    date: string;
    weight?: number;
  };
  lastPhoto: {
    url: string;
    date: string;
    weight?: number;
  };
}

export const PhotoComparisonOverlay = ({
  firstPhoto,
  lastPhoto,
}: PhotoComparisonOverlayProps) => {
  const [opacity, setOpacity] = useState(50);
  const [viewMode, setViewMode] = useState<"overlay" | "sideBySide">("overlay");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Comparação Detalhada</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "overlay" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("overlay")}
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "sideBySide" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("sideBySide")}
            >
              <SplitSquareHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "overlay" ? (
          <div className="space-y-4">
            <div className="relative w-full h-96 rounded-lg overflow-hidden bg-muted">
              {/* Foto base (primeira) */}
              <img
                src={firstPhoto.url}
                alt="Foto inicial"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {/* Foto overlay (última) com opacidade ajustável */}
              <img
                src={lastPhoto.url}
                alt="Foto atual"
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200"
                style={{ opacity: opacity / 100 }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Foto Inicial ({firstPhoto.date})
                </span>
                <span className="font-medium">Opacidade: {opacity}%</span>
                <span className="text-muted-foreground">
                  Foto Atual ({lastPhoto.date})
                </span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {(firstPhoto.weight || lastPhoto.weight) && (
              <div className="flex justify-between text-sm pt-2 border-t">
                {firstPhoto.weight && (
                  <div>
                    <span className="text-muted-foreground">Peso inicial: </span>
                    <span className="font-medium">{firstPhoto.weight}kg</span>
                  </div>
                )}
                {lastPhoto.weight && (
                  <div>
                    <span className="text-muted-foreground">Peso atual: </span>
                    <span className="font-medium">{lastPhoto.weight}kg</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground text-center">
                {firstPhoto.date}
              </div>
              <img
                src={firstPhoto.url}
                alt="Foto inicial"
                className="w-full h-64 object-cover rounded-lg"
              />
              {firstPhoto.weight && (
                <div className="text-sm text-center">
                  Peso: {firstPhoto.weight}kg
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground text-center">
                {lastPhoto.date}
              </div>
              <img
                src={lastPhoto.url}
                alt="Foto atual"
                className="w-full h-64 object-cover rounded-lg"
              />
              {lastPhoto.weight && (
                <div className="text-sm text-center">
                  Peso: {lastPhoto.weight}kg
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
