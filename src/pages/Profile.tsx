import { Layout } from "@/components/Layout";
import { GymCard } from "@/components/GymCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Settings, Target, Bell, Crown, Smartphone, Globe, Shield, Download, Lock, Trash2, Database } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { EditableAvatar } from "@/components/EditableAvatar";
import { supabase } from "@/integrations/supabase/untyped";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  // === INÍCIO DAS MODIFICAÇÕES ===
  type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintenance';
  interface UserProfileData {
    name: string;
    email: string;
    age: number | null;
    weight: number | null;
    height: number | null;
    fitness_goal: FitnessGoal | '';
  }

  interface UserPreferences {
    workoutNotifications: boolean;
    autoGoals: boolean;
    aiAnalysis: boolean;
    dataSharing: boolean;
    biometricAuth: boolean;
  }

  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserProfileData>({
    name: '',
    email: '',
    age: null,
    weight: null,
    height: null,
    fitness_goal: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    workoutNotifications: false,
    autoGoals: true,
    aiAnalysis: false,
    dataSharing: true,
    biometricAuth: false
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setUserData(prev => ({ ...prev, email: '' }));
        return;
      }

      try {
        // Buscar perfil do Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          setAvatarUrl(profile.avatar_url || '');
          
          // Se o nome salvo for um email, tentar usar o metadata do usuário
          let displayName = profile.name || '';
          if (displayName.includes('@')) {
            displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         displayName.split('@')[0].replace(/[.+]/g, ' ');
          }
          
          setUserData({
            name: displayName,
            email: user.email ?? '',
            age: profile.age ?? null,
            weight: profile.weight ?? null,
            height: profile.height ?? null,
            fitness_goal: profile.fitness_goal as FitnessGoal ?? ''
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }

      // Fallback para localStorage se não houver perfil
      try {
        const saved = localStorage.getItem('userData');
        if (saved) {
          const parsed = JSON.parse(saved);
          
          let userName = parsed.name || '';
          if (userName === 'male' || userName === 'female' || userName === 'other' || !userName) {
            userName = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
          }
          
          setUserData({
            name: userName,
            email: parsed.email || user?.email || '',
            age: parsed.age ?? null,
            weight: parsed.currentWeight ?? parsed.weight ?? null,
            height: parsed.height ?? null,
            fitness_goal: (parsed.fitnessGoal ?? parsed.fitness_goal) as FitnessGoal ?? ''
          });
          return;
        }
      } catch (_e) {
        // ignore JSON parse errors
      }

      // Fallback final para user metadata
      const m = (user.user_metadata || {}) as Record<string, any>;
      setUserData({
        name: (m.name || m.full_name as string) ?? '',
        email: user.email ?? '',
        age: typeof m.age === 'number' ? m.age : m.age ? Number(m.age) : null,
        weight: typeof m.weight === 'number' ? m.weight : m.weight ? Number(m.weight) : null,
        height: typeof m.height === 'number' ? m.height : m.height ? Number(m.height) : null,
        fitness_goal: (m.fitness_goal as FitnessGoal) ?? ''
      });
    };

    loadProfile();
  }, [user]);

  // Carregar preferências salvas
  useEffect(() => {
    const loadPreferences = () => {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        try {
          setPreferences(JSON.parse(saved));
        } catch (e) {
          console.error('Erro ao carregar preferências:', e);
        }
      }
    };
    loadPreferences();
  }, []);

  // Salvar preferências
  const savePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
    
    // Implementar ações reais baseadas nas preferências
    if (newPrefs.workoutNotifications) {
      // Solicitar permissão para notificações
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notificações ativadas",
              description: "Você receberá lembretes para treinar!",
            });
          }
        });
      }
    }

    toast({
      title: "Preferências salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  const togglePreference = (key: keyof UserPreferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    savePreferences(newPrefs);
  };

  // Baixar dados do usuário
  const handleDownloadData = async () => {
    try {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id);

      const userData = {
        profile,
        meals,
        preferences,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `npng-jm-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Dados exportados",
        description: "Seus dados foram baixados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar dados:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível baixar seus dados.",
        variant: "destructive",
      });
    }
  };

  // Alterar senha
  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/profile`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir sua senha.",
      });
    } catch (error) {
      console.error('Erro ao solicitar troca de senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    }
  };

  // Excluir conta
  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.'
    );

    if (!confirmation) return;

    const doubleConfirmation = window.confirm(
      'ÚLTIMA CONFIRMAÇÃO: Todos os seus treinos, refeições e progresso serão permanentemente excluídos. Deseja continuar?'
    );

    if (!doubleConfirmation) return;

    try {
      if (!user) return;

      // Deletar dados do usuário
      await supabase.from('meals').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);

      // Fazer logout
      await signOut();
      
      localStorage.clear();
      
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });

      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir sua conta. Entre em contato com o suporte.",
        variant: "destructive",
      });
    }
  };

  const goalValueForSelect = useMemo(() => {
    const val = userData.fitness_goal ? userData.fitness_goal.replace('_','-') : '';
    if (val === 'weight-loss' || val === 'muscle-gain' || val === 'maintenance') return val;
    return 'maintenance';
  }, [userData.fitness_goal]);
  // === FIM DAS MODIFICAÇÕES ===

  return (
    <Layout>
      <div className="p-3 md:p-4 pb-24 md:pb-4 space-y-4 md:space-y-6 max-w-4xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 md:mb-4 flex justify-center">
            <EditableAvatar 
              name={userData.name}
              currentAvatarUrl={avatarUrl}
              onAvatarUpdate={setAvatarUrl}
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold truncate px-2">{userData.name || "—"}</h1>
          <p className="text-sm md:text-base text-muted-foreground">Membro desde Janeiro 2024</p>
          <Badge className="mt-2 bg-gradient-fitness text-white text-xs md:text-sm">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="text-center p-3 md:p-4 rounded-lg glass-card">
            <div className="text-xl md:text-2xl font-bold text-primary">0</div>
            <div className="text-xs md:text-sm text-muted-foreground">Treinos</div>
          </div>
          <div className="text-center p-3 md:p-4 rounded-lg glass-card">
            <div className="text-xl md:text-2xl font-bold text-secondary">0</div>
            <div className="text-xs md:text-sm text-muted-foreground">Refeições</div>
          </div>
          <div className="text-center p-3 md:p-4 rounded-lg glass-card">
            <div className="text-xl md:text-2xl font-bold">0</div>
            <div className="text-xs md:text-sm text-muted-foreground break-words">Dias ativos</div>
          </div>
        </div>

        {/* Personal Information */}
        <GymCard
          title="Informações Pessoais"
          description="Seus dados básicos e objetivos"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" defaultValue={userData.name || ""} />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={userData.email || ""} />
              </div>
              
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input id="age" defaultValue={userData.age !== null ? String(userData.age) : ""} />
              </div>
              
              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input id="height" defaultValue={userData.height !== null ? String(userData.height) : ""} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Peso atual (kg)</Label>
                <Input id="weight" defaultValue={userData.weight !== null ? String(userData.weight) : ""} />
              </div>
              
              <div>
                <Label htmlFor="goal-weight">Peso objetivo (kg)</Label>
                <Input id="goal-weight" defaultValue={(() => {
                  try {
                    const saved = localStorage.getItem('userData');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      return parsed.goalWeight ? String(parsed.goalWeight) : '';
                    }
                  } catch (_e) {}
                  return '';
                })()} />
              </div>
              
              <div>
                <Label htmlFor="activity-level">Nível de atividade</Label>
                <Select defaultValue={(() => {
                  try {
                    const saved = localStorage.getItem('userData');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      return parsed.activityLevel || 'moderate';
                    }
                  } catch (_e) {}
                  return 'moderate';
                })()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário</SelectItem>
                    <SelectItem value="light">Atividade leve</SelectItem>
                    <SelectItem value="moderate">Atividade moderada</SelectItem>
                    <SelectItem value="high">Atividade alta</SelectItem>
                    <SelectItem value="very-high">Muito ativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="goal">Objetivo principal</Label>
                <Select defaultValue={goalValueForSelect}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-loss">Perda de peso</SelectItem>
                    <SelectItem value="muscle-gain">Ganho de massa</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="strength">Ganho de força</SelectItem>
                    <SelectItem value="endurance">Resistência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button variant="fitness" className="flex-1 text-xs sm:text-sm">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="ml-1">Salvar Alterações</span>
            </Button>
            <Button variant="outline" className="flex-1 text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="ml-1">Recalcular Metas</span>
            </Button>
          </div>
        </GymCard>

        {/* Preferences */}
        <GymCard
          title="Preferências do App"
          description="Personalize sua experiência"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm md:text-base">Notificações de treino</div>
                  <div className="text-xs md:text-sm text-muted-foreground break-words">Lembretes diários para se exercitar</div>
                </div>
              </div>
              <Switch 
                checked={preferences.workoutNotifications} 
                onCheckedChange={() => togglePreference('workoutNotifications')}
                className="flex-shrink-0" 
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <Target className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm md:text-base">Metas automáticas</div>
                  <div className="text-xs md:text-sm text-muted-foreground break-words">Ajuste automático baseado no progresso</div>
                </div>
              </div>
              <Switch 
                checked={preferences.autoGoals} 
                onCheckedChange={() => togglePreference('autoGoals')}
                className="flex-shrink-0" 
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm md:text-base">Análise por IA</div>
                  <div className="text-xs md:text-sm text-muted-foreground break-words">Análise automática de refeições por foto</div>
                </div>
              </div>
              <Switch 
                checked={preferences.aiAnalysis} 
                onCheckedChange={() => togglePreference('aiAnalysis')}
                className="flex-shrink-0" 
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm md:text-base">Compartilhamento de dados</div>
                  <div className="text-xs md:text-sm text-muted-foreground break-words">Me permite compartilhar progresso com a comunidade</div>
                </div>
              </div>
              <Switch 
                checked={preferences.dataSharing} 
                onCheckedChange={() => togglePreference('dataSharing')}
                className="flex-shrink-0" 
              />
            </div>
          </div>
        </GymCard>

        {/* Subscription */}
        <GymCard
          variant="nutrition"
          title="Plano Premium"
          description="Aproveite todos os recursos do nPnG JM"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-hero">
              <div className="text-white">
                <div className="text-lg font-semibold">Plano Premium Ativo</div>
                <div className="text-sm opacity-90">Renovação automática em 23 dias</div>
              </div>
              <Crown className="w-8 h-8 text-yellow-300" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Análise IA ilimitada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Treinos personalizados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Relatórios avançados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Suporte prioritário</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1 text-xs sm:text-sm">
                Gerenciar Assinatura
              </Button>
              <Button variant="nutrition-outline" className="text-xs sm:text-sm">
                Cancelar Plano
              </Button>
            </div>
          </div>
        </GymCard>

        {/* Privacy & Security */}
        <GymCard
          title="Privacidade e Segurança"
          description="Controle seus dados e privacidade"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm md:text-base">Autenticação biométrica</div>
                  <div className="text-xs md:text-sm text-muted-foreground break-words">Use impressão digital ou Face ID</div>
                </div>
              </div>
              <Switch 
                checked={preferences.biometricAuth} 
                onCheckedChange={() => togglePreference('biometricAuth')}
                className="flex-shrink-0" 
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 text-xs sm:text-sm"
                onClick={handleDownloadData}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Baixar Meus Dados
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-xs sm:text-sm"
                onClick={handleChangePassword}
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Alterar Senha
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 text-xs sm:text-sm"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Excluir Conta
              </Button>
            </div>
          </div>
        </GymCard>

        {/* Admin Tools */}
        <GymCard
          title="Ferramentas Administrativas"
          description="Gerencie conteúdo do aplicativo"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <Database className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-medium">Biblioteca de Exercícios</div>
                  <div className="text-sm text-muted-foreground">
                    Visualize, edite e substitua GIFs dos exercícios
                  </div>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/exercise-management')}
                className="flex-shrink-0"
              >
                Gerenciar
              </Button>
            </div>
          </div>
        </GymCard>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>nPnG JM v2.1.0</p>
          <div className="flex justify-center gap-4">
            <Button variant="link" size="sm">Política de Privacidade</Button>
            <Button variant="link" size="sm">Termos de Uso</Button>
            <Button variant="link" size="sm">Suporte</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;