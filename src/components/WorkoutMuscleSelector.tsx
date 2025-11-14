import { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  ZoomIn, ZoomOut,
  Dumbbell,
  Edit3,
  Trash2,
  Plus,
  Save
} from 'lucide-react';
import bodyFrontImg from '@/assets/body-front.png';
import bodyBackImg from '@/assets/body-back.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface MuscleLabel {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

interface Connector {
  id: number;
  fromLabelId: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
  color: string;
}

export function WorkoutMuscleSelector() {
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
  const [zoom, setZoom] = useState(1);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // Estado para modal de exercícios
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedMuscleForExercises, setSelectedMuscleForExercises] = useState<MuscleLabel | null>(null);
  
  // **MODO EDIÇÃO**
  const [editMode, setEditMode] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null);
  const [draggingLabel, setDraggingLabel] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [imageScale, setImageScale] = useState(1);
  
  // Linhas conectoras
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [draggingConnector, setDraggingConnector] = useState<{ id: number; point: 'start' | 'end' } | null>(null);
  
  const [muscleLabels, setMuscleLabels] = useState<{
    front: MuscleLabel[];
    back: MuscleLabel[];
  }>({
    front: [
      { id: 1, name: "Ombros", x: 45, y: 15, width: 60, height: 24, rotation: 0, color: "#1EAEDB", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 2, name: "Peitoral", x: 40, y: 25, width: 70, height: 22, rotation: 0, color: "#1EAEDB", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 3, name: "Bíceps", x: 20, y: 35, width: 55, height: 22, rotation: 0, color: "#1EAEDB", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 4, name: "Abdômen", x: 45, y: 45, width: 65, height: 22, rotation: 0, color: "#1EAEDB", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 5, name: "Oblíquos", x: 35, y: 50, width: 70, height: 22, rotation: -5, color: "#1EAEDB", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 6, name: "Quadríceps", x: 45, y: 65, width: 75, height: 22, rotation: 0, color: "#1EAEDB", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 7, name: "Panturrilhas", x: 45, y: 85, width: 75, height: 22, rotation: 0, color: "#1EAEDB", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" }
    ],
    back: [
      { id: 8, name: "Trapézio", x: 45, y: 10, width: 65, height: 22, rotation: 0, color: "#9b87f5", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 9, name: "Dorsais", x: 45, y: 25, width: 65, height: 22, rotation: 0, color: "#9b87f5", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 10, name: "Tríceps", x: 70, y: 35, width: 55, height: 22, rotation: 0, color: "#9b87f5", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 11, name: "Lombares", x: 45, y: 40, width: 70, height: 22, rotation: 0, color: "#9b87f5", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 12, name: "Glúteos", x: 45, y: 55, width: 65, height: 22, rotation: 0, color: "#9b87f5", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 13, name: "Isquiotibiais", x: 45, y: 70, width: 80, height: 22, rotation: 0, color: "#9b87f5", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" },
      { id: 14, name: "Cardio", x: 80, y: 90, width: 50, height: 22, rotation: 0, color: "#9b87f5", textColor: "#ffffff", fontSize: 12, fontFamily: "Inter" }
    ]
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentLabels = muscleLabels[currentView];

  // Tamanhos responsivos
  const getContainerSize = () => {
    if (isMobileView) {
      return { width: 280, height: 420 };
    }
    return { width: 400, height: 600 };
  };

  // Exibe modal de exercícios ou seleciona para edição
  const handleLabelClick = (muscleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (editMode) {
      setSelectedLabel(muscleId);
    } else {
      setSelectedAreas(prev => 
        prev.includes(muscleId) 
          ? prev.filter(id => id !== muscleId)
          : [...prev, muscleId]
      );
      
      const allLabels = [...muscleLabels.front, ...muscleLabels.back];
      const muscle = allLabels.find(m => m.id === muscleId);
      if (muscle) {
        setSelectedMuscleForExercises(muscle);
        setShowExerciseModal(true);
      }
    }
  };

  // Funções de drag and drop para labels
  const handleLabelMouseDown = (muscleId: number, e: React.MouseEvent) => {
    if (!editMode) return;
    e.stopPropagation();
    
    const label = currentLabels.find(l => l.id === muscleId);
    if (!label || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + (label.x / 100) * rect.width);
    const offsetY = e.clientY - (rect.top + (label.y / 100) * rect.height);
    
    setDraggingLabel(muscleId);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedLabel(muscleId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingLabel !== null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
      
      updateLabel(draggingLabel, { 
        x: Math.max(0, Math.min(95, newX)),
        y: Math.max(0, Math.min(95, newY))
      });
    }
    
    if (draggingConnector && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = ((e.clientX - rect.left) / rect.width) * 100;
      const newY = ((e.clientY - rect.top) / rect.height) * 100;
      
      setConnectors(prev => prev.map(conn => {
        if (conn.id === draggingConnector.id) {
          if (draggingConnector.point === 'start') {
            return { ...conn, x1: newX, y1: newY };
          } else {
            return { ...conn, x2: newX, y2: newY };
          }
        }
        return conn;
      }));
    }
  };

  const handleMouseUp = () => {
    if (draggingLabel !== null) {
      saveToLocalStorage();
    }
    setDraggingLabel(null);
    setDraggingConnector(null);
  };

  // Atualizar propriedades do label
  const updateLabel = (id: number, updates: Partial<MuscleLabel>) => {
    setMuscleLabels(prev => ({
      ...prev,
      [currentView]: prev[currentView].map(label => 
        label.id === id ? { ...label, ...updates } : label
      )
    }));
  };

  // Adicionar novo label
  const addNewLabel = () => {
    const newLabel: MuscleLabel = {
      id: Date.now(),
      name: "Novo Label",
      x: 50,
      y: 50,
      width: 70,
      height: 24,
      rotation: 0,
      color: currentView === 'front' ? "#1EAEDB" : "#9b87f5",
      textColor: "#ffffff",
      fontSize: 12,
      fontFamily: "Inter"
    };
    
    setMuscleLabels(prev => ({
      ...prev,
      [currentView]: [...prev[currentView], newLabel]
    }));
    
    setSelectedLabel(newLabel.id);
    toast.success('Novo label adicionado');
  };

  // Excluir label
  const deleteLabel = (labelId: number) => {
    setMuscleLabels(prev => ({
      ...prev,
      [currentView]: prev[currentView].filter(label => label.id !== labelId)
    }));
    
    // Remover conectores associados
    setConnectors(prev => prev.filter(conn => conn.fromLabelId !== labelId));
    
    setSelectedLabel(null);
    toast.success('Label excluído');
    saveToLocalStorage();
  };

  // Adicionar linha conectora
  const addConnector = () => {
    if (!selectedLabel) {
      toast.error('Selecione um label primeiro');
      return;
    }
    
    const label = currentLabels.find(l => l.id === selectedLabel);
    if (!label) return;
    
    const newConnector: Connector = {
      id: Date.now(),
      fromLabelId: selectedLabel,
      x1: label.x + 5,
      y1: label.y + 2,
      x2: label.x + 15,
      y2: label.y + 10,
      strokeWidth: 2,
      color: '#000000'
    };
    
    setConnectors(prev => [...prev, newConnector]);
    toast.success('Linha conectora adicionada');
  };

  // Salvar no localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('muscleLabelsConfig', JSON.stringify(muscleLabels));
    localStorage.setItem('connectorsConfig', JSON.stringify(connectors));
    localStorage.setItem('backgroundConfig', JSON.stringify({ backgroundColor, imageScale }));
  };

  const handleSave = () => {
    saveToLocalStorage();
    toast.success('Configurações salvas com sucesso!');
  };
  
  // **NOVO: Dados de exercícios por grupo muscular**
  const exercisesByMuscle: Record<string, string[]> = {
    "Ombros": ["Desenvolvimento com Halteres", "Elevação Lateral", "Desenvolvimento Arnold", "Remada Alta"],
    "Peitoral": ["Supino Reto", "Supino Inclinado", "Crucifixo", "Flexão de Braços"],
    "Bíceps": ["Rosca Direta", "Rosca Martelo", "Rosca Concentrada", "Rosca Scott"],
    "Abdômen": ["Abdominal Supra", "Prancha", "Abdominal Canivete", "Elevação de Pernas"],
    "Oblíquos": ["Abdominal Oblíquo", "Prancha Lateral", "Russian Twist", "Mountain Climbers"],
    "Quadríceps": ["Agachamento", "Leg Press", "Cadeira Extensora", "Afundo"],
    "Panturrilhas": ["Panturrilha em Pé", "Panturrilha Sentado", "Panturrilha no Leg Press"],
    "Trapézio": ["Encolhimento com Halteres", "Remada Alta", "Face Pull"],
    "Dorsais": ["Puxada Frontal", "Remada Curvada", "Barra Fixa", "Remada Unilateral"],
    "Tríceps": ["Tríceps Pulley", "Tríceps Testa", "Mergulho", "Tríceps Coice"],
    "Lombares": ["Levantamento Terra", "Hiperextensão", "Good Morning"],
    "Glúteos": ["Agachamento", "Hip Thrust", "Stiff", "Cadeira Abdutora"],
    "Isquiotibiais": ["Stiff", "Mesa Flexora", "Levantamento Terra", "Afundo Reverso"],
    "Cardio": ["Corrida", "Bicicleta", "Elíptico", "Pular Corda", "HIIT"]
  };

  useEffect(() => {
    const savedLabels = localStorage.getItem('muscleLabelsConfig');
    if (savedLabels) {
      setMuscleLabels(JSON.parse(savedLabels));
    }
    
    const savedConnectors = localStorage.getItem('connectorsConfig');
    if (savedConnectors) {
      setConnectors(JSON.parse(savedConnectors));
    }
    
    const savedBackground = localStorage.getItem('backgroundConfig');
    if (savedBackground) {
      const bg = JSON.parse(savedBackground);
      setBackgroundColor(bg.backgroundColor);
      setImageScale(bg.imageScale);
    }
  }, []);

  const currentImage = currentView === 'front' ? bodyFrontImg : bodyBackImg;
  const containerSize = getContainerSize();
  const selectedLabelData = currentLabels.find(l => l.id === selectedLabel);

  return (
    <div className="bg-gradient-to-br from-background to-muted rounded-xl p-1 sm:p-4 lg:p-6">
      {/* Header - Responsivo */}
      <div className="flex justify-between items-center mb-3 sm:mb-6 px-2 sm:px-0">
        <h2 className="text-lg sm:text-2xl font-bold text-foreground">
          {isMobileView ? 'Grupos Musculares' : 'Selecionar Grupos Musculares'}
        </h2>
        
        <div className="flex gap-1 sm:gap-2">
          {/* Botão Modo Edição */}
          <Button
            onClick={() => {
              setEditMode(!editMode);
              setSelectedLabel(null);
              if (!editMode) {
                toast.info('Modo de edição ativado');
              }
            }}
            variant={editMode ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Edit3 size={16} />
            {!isMobileView && (editMode ? 'Sair da Edição' : 'Modo Editar')}
          </Button>
          
          {editMode && (
            <Button
              onClick={handleSave}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Save size={16} />
              {!isMobileView && 'Salvar'}
            </Button>
          )}
          
          {/* Controles de Zoom */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button 
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-1 sm:p-2 hover:bg-muted/80 rounded transition-colors"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs sm:text-sm px-1 sm:px-2">{(zoom * 100).toFixed(0)}%</span>
            <button 
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
              className="p-1 sm:p-2 hover:bg-muted/80 rounded transition-colors"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`grid ${editMode ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3 sm:gap-6 lg:gap-8 px-1 sm:px-0`}>
        {/* Imagem Anatômica com Labels - Responsivo */}
        <div className="relative lg:col-span-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4 px-1 sm:px-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              {editMode ? 'Modo Edição' : 'Selecione as Áreas'}
            </h3>
            
            <button
              onClick={() => setCurrentView(currentView === 'front' ? 'back' : 'front')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors shadow-md text-sm sm:text-base"
            >
              <RotateCw size={16} />
              <span>Rotacionar</span>
            </button>
          </div>
          
          <div className="flex justify-center items-center rounded-lg sm:rounded-xl p-1 sm:p-4 border border-dashed border-border"
               style={{ backgroundColor }}>
            <div 
              ref={containerRef}
              className="relative rounded-lg shadow-lg overflow-hidden"
              style={{ 
                width: `${containerSize.width}px`,
                height: `${containerSize.height}px`,
                transform: `scale(${zoom})`,
                transition: 'all 0.3s ease-in-out',
                cursor: editMode ? 'move' : 'default'
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Imagem do corpo humano */}
              <img 
                src={currentImage} 
                alt={`Vista ${currentView === 'front' ? 'frontal' : 'traseira'}`}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ transform: `scale(${imageScale})` }}
              />

              {/* Linhas conectoras */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connectors.map((connector) => (
                  <g key={connector.id}>
                    <line
                      x1={`${connector.x1}%`}
                      y1={`${connector.y1}%`}
                      x2={`${connector.x2}%`}
                      y2={`${connector.y2}%`}
                      stroke={connector.color}
                      strokeWidth={connector.strokeWidth}
                    />
                    {editMode && (
                      <>
                        <circle
                          cx={`${connector.x1}%`}
                          cy={`${connector.y1}%`}
                          r="4"
                          fill={connector.color}
                          className="cursor-move pointer-events-auto"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingConnector({ id: connector.id, point: 'start' });
                          }}
                        />
                        <circle
                          cx={`${connector.x2}%`}
                          cy={`${connector.y2}%`}
                          r="4"
                          fill={connector.color}
                          className="cursor-move pointer-events-auto"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingConnector({ id: connector.id, point: 'end' });
                          }}
                        />
                      </>
                    )}
                  </g>
                ))}
              </svg>

            {/* Labels dos músculos */}
            {currentLabels.map((label) => (
              <div
                key={label.id}
                className={`absolute transition-all rounded-md ${
                  editMode 
                    ? selectedLabel === label.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:ring-2 hover:ring-primary/50'
                    : selectedAreas.includes(label.id) 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-background/90 text-foreground border-2 border-primary/30 hover:border-primary'
                }`}
                style={{
                  left: `${label.x}%`,
                  top: `${label.y}%`,
                  transform: `rotate(${label.rotation}deg)`,
                  width: `${label.width}px`,
                  height: `${label.height}px`,
                  backgroundColor: label.color,
                  cursor: editMode ? 'move' : 'pointer'
                }}
                onClick={(e) => handleLabelClick(label.id, e)}
                onMouseDown={(e) => handleLabelMouseDown(label.id, e)}
              >
                <div 
                  className="flex items-center justify-center h-full text-center font-medium p-1"
                  style={{ 
                    fontSize: `${label.fontSize}px`,
                    color: label.textColor,
                    fontFamily: label.fontFamily
                  }}
                >
                  {label.name}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Painel de Edição */}
        {editMode && (
          <div className="lg:col-span-1">
            {/* Botões de Ação Principais */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button
                    onClick={addNewLabel}
                    className="w-full gap-2"
                    variant="default"
                  >
                    <Plus size={16} />
                    Adicionar Novo Label
                  </Button>
                  
                  {selectedLabel && (
                    <Button
                      onClick={() => deleteLabel(selectedLabel)}
                      className="w-full gap-2"
                      variant="destructive"
                    >
                      <Trash2 size={16} />
                      Excluir Label Selecionado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Painel de Edição do Label Selecionado */}
            {selectedLabelData && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Editar Label</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLabel(null)}
                    >
                      ✕
                    </Button>
                  </div>

                <div className="space-y-3">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={selectedLabelData.name}
                      onChange={(e) => updateLabel(selectedLabel!, { name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Largura (px)</Label>
                      <Input
                        type="number"
                        value={selectedLabelData.width}
                        onChange={(e) => updateLabel(selectedLabel!, { width: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Altura (px)</Label>
                      <Input
                        type="number"
                        value={selectedLabelData.height}
                        onChange={(e) => updateLabel(selectedLabel!, { height: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor do Label</Label>
                    <Input
                      type="color"
                      value={selectedLabelData.color}
                      onChange={(e) => updateLabel(selectedLabel!, { color: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <Input
                      type="color"
                      value={selectedLabelData.textColor}
                      onChange={(e) => updateLabel(selectedLabel!, { textColor: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Tamanho do Texto (px)</Label>
                    <Input
                      type="number"
                      value={selectedLabelData.fontSize}
                      onChange={(e) => updateLabel(selectedLabel!, { fontSize: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label>Fonte</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedLabelData.fontFamily}
                      onChange={(e) => updateLabel(selectedLabel!, { fontFamily: e.target.value })}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>

                  <div>
                    <Label>Rotação (graus)</Label>
                    <Input
                      type="number"
                      value={selectedLabelData.rotation}
                      onChange={(e) => updateLabel(selectedLabel!, { rotation: Number(e.target.value) })}
                    />
                  </div>
                </div>

                  <Button
                    onClick={addConnector}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Plus size={16} />
                    Adicionar Linha Conectora
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Controles Gerais */}
            <Card className="mt-4">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-lg font-semibold">Configurações Gerais</h3>

                <div>
                  <Label>Cor de Fundo</Label>
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Escala da Imagem</Label>
                  <Input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={imageScale}
                    onChange={(e) => setImageScale(Number(e.target.value))}
                  />
                  <span className="text-sm text-muted-foreground">{(imageScale * 100).toFixed(0)}%</span>
                </div>

                {connectors.length > 0 && (
                  <div>
                    <Label>Linhas Conectoras</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {connectors.map((conn) => (
                        <div key={conn.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Input
                            type="color"
                            value={conn.color}
                            onChange={(e) => setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, color: e.target.value } : c))}
                            className="w-12 h-8"
                          />
                          <Input
                            type="number"
                            value={conn.strokeWidth}
                            onChange={(e) => setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, strokeWidth: Number(e.target.value) } : c))}
                            className="w-16"
                            min="1"
                            max="10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConnectors(prev => prev.filter(c => c.id !== conn.id))}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Painel de Seleção */}
        {!editMode && (
          <div className="w-full lg:w-80 space-y-3 sm:space-y-6 px-1 sm:px-0">
            <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">Áreas Selecionadas</h3>
              
              <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
                {selectedAreas.length === 0 ? (
                  <p className="text-muted-foreground text-center py-3 text-sm">Nenhuma área selecionada</p>
                ) : (
                  selectedAreas.map(muscleId => {
                    const allLabels = [...muscleLabels.front, ...muscleLabels.back];
                    const muscle = allLabels.find(m => m.id === muscleId);
                    return (
                      <div key={muscleId} className="flex items-center justify-between bg-background p-2 sm:p-3 rounded-lg border border-border text-sm">
                        <span className="font-medium text-foreground truncate">{muscle?.name}</span>
                        <button 
                          onClick={() => handleLabelClick(muscleId, { stopPropagation: () => {} } as any)}
                          className="text-destructive hover:text-destructive/80 transition-colors text-xs sm:text-sm ml-2"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => setSelectedAreas([])}
                disabled={selectedAreas.length === 0}
                className="w-full bg-muted text-muted-foreground py-2 rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Limpar Seleção
              </button>
              
              <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Músculos selecionados:</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{selectedAreas.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* **NOVO: Modal de Exercícios** */}
      <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              Exercícios - {selectedMuscleForExercises?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {selectedMuscleForExercises && exercisesByMuscle[selectedMuscleForExercises.name] ? (
              exercisesByMuscle[selectedMuscleForExercises.name].map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-foreground font-medium">{exercise}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum exercício disponível para este grupo muscular.
              </p>
            )}
          </div>
          
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setShowExerciseModal(false)}
              className="flex-1 bg-muted text-muted-foreground py-2 rounded-lg hover:bg-muted/80 transition-colors font-medium"
            >
              Fechar
            </button>
            <button
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Adicionar ao Treino
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
