import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GymCard } from "@/components/GymCard";
import { StatCard } from "@/components/StatCard";
import { Dumbbell, Apple, TrendingUp, Zap, Camera, Users, ChefHat } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import heroVideo from "@/assets/hero-video.mp4";
import heroVideo2 from "@/assets/hero-video-2.mp4";
import heroFitnessImage from "@/assets/hero-fitness.jpg";
import nutritionImage from "@/assets/nutrition-hero.jpg";
import workoutsImage from "@/assets/workouts-hero.jpg";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { Clock } from "@/components/Clock";
import { useIsMobile } from "@/hooks/use-mobile";


const Index = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const { user } = useAuth();
  const { onboardingCompleted, loading } = useOnboardingStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const videos = [heroVideo, heroVideo2];

  // Não redirecionar automaticamente - usuário pode navegar livremente
  // O onboarding será acessado apenas quando o usuário clicar em "Começar Agora"

  const handleProtectedAction = (path: string) => {
    if (user) {
      if (!onboardingCompleted && path === "/dashboard") {
        navigate("/onboarding");
      } else {
        navigate(path);
      }
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <video 
          key={currentVideo}
          autoPlay 
          muted 
          playsInline
          webkit-playsinline="true"
          preload="auto"
          poster={heroFitnessImage}
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          onLoadedData={(e) => {
            const video = e.currentTarget;
            video.play().catch(() => {
              // Fallback silencioso se autoplay falhar
            });
          }}
          onEnded={() => {
            setCurrentVideo((prev) => (prev + 1) % videos.length);
          }}
        >
          <source src={videos[currentVideo]} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="relative z-10 px-4 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            {!isMobile && (
              <div className="flex justify-center mb-6">
                <Clock />
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              nPnG <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">JM</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Seu personal trainer e nutricionista com IA no bolso
            </p>
            <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
              Combine treinos inteligentes com análise nutricional por IA. Alcance seus objetivos fitness com precisão científica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => handleProtectedAction("/dashboard")}
              >
                <Zap className="w-5 h-5" />
                Começar Agora
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para <span className="text-primary">transformar</span> seu corpo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia avançada de IA combinada com ciência do exercício para resultados comprovados
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Fitness Feature */}
            <GymCard 
              variant="fitness"
              title="Treinos Inteligentes"
              description="Rotinas personalizadas baseadas em seus objetivos"
              className="p-8"
            >
              <div 
                className="h-32 bg-cover bg-center rounded-lg mb-4"
                style={{ backgroundImage: `url(${workoutsImage})` }}
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <span>350+ exercícios com demonstrações</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <span>Acompanhamento de progresso</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <span>Adaptação automática de cargas</span>
                </div>
                <Button 
                  variant="fitness" 
                  className="w-full mt-4"
                  onClick={() => handleProtectedAction("/workouts")}
                >
                  Explorar Treinos
                </Button>
              </div>
            </GymCard>

            {/* Nutrition Feature */}
            <GymCard 
              variant="nutrition"
              title="Nutrição com IA"
              description="Análise instantânea de refeições com 90% de precisão"
              className="p-8"
            >
              <div 
                className="h-32 bg-cover bg-center rounded-lg mb-4"
                style={{ backgroundImage: `url(${nutritionImage})` }}
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-secondary" />
                  <span>Foto → Calorias e macros</span>
                </div>
                <div className="flex items-center gap-3">
                  <Apple className="w-6 h-6 text-secondary" />
                  <span>Planos de dieta personalizados</span>
                </div>
                <div className="flex items-center gap-3">
                  <ChefHat className="w-6 h-6 text-secondary" />
                  <span>Receitas sugeridas pela IA</span>
                </div>
                <Button
                  variant="nutrition" 
                  className="w-full mt-4"
                  onClick={() => handleProtectedAction("/nutrition")}
                >
                  Analisar Refeição
                </Button>
              </div>
            </GymCard>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="Capacidade +50K Usuários Ativos"
              value="50K+"
              change="+12%"
              variant="fitness"
            />
            <StatCard
              icon={<Dumbbell className="w-6 h-6" />}
              title="Exercícios"
              value="350+"
              variant="fitness"
            />
            <StatCard
              icon={<Apple className="w-6 h-6" />}
              title="Refeições Analisadas"
              value="1M+"
              change="+25%"
              variant="nutrition"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Precisão IA"
              value="90%+"
              variant="nutrition"
            />
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Pronto para começar sua transformação?</h3>
            <p className="text-muted-foreground mb-8">
              Junte-se a milhares de pessoas que já estão alcançando seus objetivos com o nPnG JM
            </p>
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => handleProtectedAction("/dashboard")}
            >
              <Zap className="w-5 h-5" />
              Iniciar Jornada Gratuita
            </Button>
          </div>
        </div>
      </section>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Index;
