import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OnboardingData } from "../OnboardingFlow";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step2 = ({ data, updateData, nextStep, prevStep }: StepProps) => {
  const [date, setDate] = useState<Date | undefined>(
    data.birthDate ? new Date(data.birthDate) : undefined
  );
  const [name, setName] = useState(data.name || '');
  const [dateInput, setDateInput] = useState('');

  // Formatar data para DD/MM/AAAA
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Converter data digitada para Date
  const handleDateInput = (value: string) => {
    setDateInput(value);
    
    // Quando tiver 10 caracteres (DD/MM/AAAA)
    if (value.length === 10) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        
        // Validar data
        const newDate = new Date(year, month, day);
        if (
          !isNaN(newDate.getTime()) && 
          newDate.getDate() === day && 
          newDate.getMonth() === month && 
          newDate.getFullYear() === year &&
          newDate <= new Date() &&
          newDate >= new Date("1900-01-01")
        ) {
          setDate(newDate);
          updateData({ birthDate: newDate.toISOString().split('T')[0] });
        } else {
          toast.error("Data inválida");
        }
      }
    }
  };

  const handleContinue = () => {
    if (!name || !data.gender || !date || !data.weight || !data.height || !data.goalWeight) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    updateData({ name });
    nextStep();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Dados Pessoais</h2>
        <p className="text-muted-foreground">Nos conte um pouco sobre você</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nome Completo</Label>
          <Input
            type="text"
            placeholder="Digite seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Sexo</Label>
          <Select value={data.gender} onValueChange={(value) => updateData({ gender: value as any })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Feminino</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Data de Nascimento</Label>
          
          {/* OPÇÃO 1: DIGITAÇÃO RÁPIDA */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Edit className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Digite rapidamente:</span>
            </div>
            <Input
              type="text"
              value={dateInput || formatDateForInput(data.birthDate)}
              onChange={(e) => {
                let value = e.target.value;
                
                // Auto-formatar para DD/MM/AAAA
                value = value.replace(/\D/g, '');
                if (value.length > 2) {
                  value = value.substring(0, 2) + '/' + value.substring(2);
                }
                if (value.length > 5) {
                  value = value.substring(0, 5) + '/' + value.substring(5, 9);
                }
                
                handleDateInput(value);
              }}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className="font-medium"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formato: DD/MM/AAAA (ex: 28/10/1995)
            </p>
          </div>

          {/* OU - Separador */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* OPÇÃO 2: SELETOR VISUAL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Selecione no calendário:</span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    updateData({ birthDate: newDate?.toISOString().split('T')[0] });
                    setDateInput(''); // Limpar input digitado
                  }}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Peso Atual</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="70"
                value={data.weight || ''}
                onChange={(e) => updateData({ weight: Number(e.target.value) })}
              />
              <Select value={data.weightUnit || 'kg'} onValueChange={(value) => updateData({ weightUnit: value as any })}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Altura</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="175"
                value={data.height || ''}
                onChange={(e) => updateData({ height: Number(e.target.value) })}
              />
              <Select value={data.heightUnit || 'cm'} onValueChange={(value) => updateData({ heightUnit: value as any })}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="ft/in">ft/in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Meta de Peso</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="65"
              value={data.goalWeight || ''}
              onChange={(e) => updateData({ goalWeight: Number(e.target.value) })}
            />
            <Select value={data.weightUnit || 'kg'} onValueChange={(value) => updateData({ weightUnit: value as any })}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="w-full">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleContinue} className="w-full gradient-hero hover:opacity-90 transition-smooth">
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Step2;
