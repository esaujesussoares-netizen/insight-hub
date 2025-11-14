import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddMeasurementsDialogProps {
  onAdd: (measurements: any) => void;
  trigger: React.ReactNode;
}

export const AddMeasurementsDialog = ({ onAdd, trigger }: AddMeasurementsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [measurements, setMeasurements] = useState({
    neck: "",
    shoulders: "",
    chest: "",
    waist: "",
    hips: "",
    left_arm: "",
    right_arm: "",
    left_forearm: "",
    right_forearm: "",
    left_thigh: "",
    right_thigh: "",
    left_calf: "",
    right_calf: "",
    triceps_skinfold: "",
    biceps_skinfold: "",
    subscapular_skinfold: "",
    suprailiac_skinfold: "",
    abdominal_skinfold: "",
    thigh_skinfold: "",
    calf_skinfold: "",
    notes: ""
  });

  const handleSubmit = () => {
    const formattedData: any = { notes: measurements.notes };
    
    Object.keys(measurements).forEach(key => {
      if (key !== 'notes' && measurements[key as keyof typeof measurements]) {
        formattedData[key] = parseFloat(measurements[key as keyof typeof measurements]);
      }
    });

    onAdd(formattedData);
    setOpen(false);
    setMeasurements({
      neck: "", shoulders: "", chest: "", waist: "", hips: "",
      left_arm: "", right_arm: "", left_forearm: "", right_forearm: "",
      left_thigh: "", right_thigh: "", left_calf: "", right_calf: "",
      triceps_skinfold: "", biceps_skinfold: "", subscapular_skinfold: "",
      suprailiac_skinfold: "", abdominal_skinfold: "", thigh_skinfold: "",
      calf_skinfold: "", notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Medidas Corporais</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="circumferences">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="circumferences">Circunferências</TabsTrigger>
            <TabsTrigger value="skinfolds">Dobras Cutâneas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="circumferences" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pescoço (cm)</Label>
                <Input type="number" step="0.1" value={measurements.neck} onChange={(e) => setMeasurements({...measurements, neck: e.target.value})} />
              </div>
              <div>
                <Label>Ombros (cm)</Label>
                <Input type="number" step="0.1" value={measurements.shoulders} onChange={(e) => setMeasurements({...measurements, shoulders: e.target.value})} />
              </div>
              <div>
                <Label>Peito (cm)</Label>
                <Input type="number" step="0.1" value={measurements.chest} onChange={(e) => setMeasurements({...measurements, chest: e.target.value})} />
              </div>
              <div>
                <Label>Cintura (cm)</Label>
                <Input type="number" step="0.1" value={measurements.waist} onChange={(e) => setMeasurements({...measurements, waist: e.target.value})} />
              </div>
              <div>
                <Label>Quadril (cm)</Label>
                <Input type="number" step="0.1" value={measurements.hips} onChange={(e) => setMeasurements({...measurements, hips: e.target.value})} />
              </div>
              <div>
                <Label>Braço Esq. (cm)</Label>
                <Input type="number" step="0.1" value={measurements.left_arm} onChange={(e) => setMeasurements({...measurements, left_arm: e.target.value})} />
              </div>
              <div>
                <Label>Braço Dir. (cm)</Label>
                <Input type="number" step="0.1" value={measurements.right_arm} onChange={(e) => setMeasurements({...measurements, right_arm: e.target.value})} />
              </div>
              <div>
                <Label>Antebraço Esq. (cm)</Label>
                <Input type="number" step="0.1" value={measurements.left_forearm} onChange={(e) => setMeasurements({...measurements, left_forearm: e.target.value})} />
              </div>
              <div>
                <Label>Antebraço Dir. (cm)</Label>
                <Input type="number" step="0.1" value={measurements.right_forearm} onChange={(e) => setMeasurements({...measurements, right_forearm: e.target.value})} />
              </div>
              <div>
                <Label>Coxa Esq. (cm)</Label>
                <Input type="number" step="0.1" value={measurements.left_thigh} onChange={(e) => setMeasurements({...measurements, left_thigh: e.target.value})} />
              </div>
              <div>
                <Label>Coxa Dir. (cm)</Label>
                <Input type="number" step="0.1" value={measurements.right_thigh} onChange={(e) => setMeasurements({...measurements, right_thigh: e.target.value})} />
              </div>
              <div>
                <Label>Panturrilha Esq. (cm)</Label>
                <Input type="number" step="0.1" value={measurements.left_calf} onChange={(e) => setMeasurements({...measurements, left_calf: e.target.value})} />
              </div>
              <div>
                <Label>Panturrilha Dir. (cm)</Label>
                <Input type="number" step="0.1" value={measurements.right_calf} onChange={(e) => setMeasurements({...measurements, right_calf: e.target.value})} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="skinfolds" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tríceps (mm)</Label>
                <Input type="number" step="0.1" value={measurements.triceps_skinfold} onChange={(e) => setMeasurements({...measurements, triceps_skinfold: e.target.value})} />
              </div>
              <div>
                <Label>Bíceps (mm)</Label>
                <Input type="number" step="0.1" value={measurements.biceps_skinfold} onChange={(e) => setMeasurements({...measurements, biceps_skinfold: e.target.value})} />
              </div>
              <div>
                <Label>Subescapular (mm)</Label>
                <Input type="number" step="0.1" value={measurements.subscapular_skinfold} onChange={(e) => setMeasurements({...measurements, subscapular_skinfold: e.target.value})} />
              </div>
              <div>
                <Label>Supra-ilíaca (mm)</Label>
                <Input type="number" step="0.1" value={measurements.suprailiac_skinfold} onChange={(e) => setMeasurements({...measurements, suprailiac_skinfold: e.target.value})} />
              </div>
              <div>
                <Label>Abdominal (mm)</Label>
                <Input type="number" step="0.1" value={measurements.abdominal_skinfold} onChange={(e) => setMeasurements({...measurements, abdominal_skinfold: e.target.value})} />
              </div>
              <div>
                <Label>Coxa (mm)</Label>
                <Input type="number" step="0.1" value={measurements.thigh_skinfold} onChange={(e) => setMeasurements({...measurements, thigh_skinfold: e.target.value})} />
              </div>
              <div>
                <Label>Panturrilha (mm)</Label>
                <Input type="number" step="0.1" value={measurements.calf_skinfold} onChange={(e) => setMeasurements({...measurements, calf_skinfold: e.target.value})} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea 
            value={measurements.notes} 
            onChange={(e) => setMeasurements({...measurements, notes: e.target.value})}
            placeholder="Adicione observações sobre as medidas..."
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">Salvar Medidas</Button>
      </DialogContent>
    </Dialog>
  );
};
