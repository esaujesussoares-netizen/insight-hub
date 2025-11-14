import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Aguarda carregamento do status de onboarding
    if (loading || onboardingLoading) return;

    // Redireciona com base no status do onboarding
    if (onboardingCompleted) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  }, [user, loading, onboardingLoading, onboardingCompleted, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login com Google");
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <span className="text-3xl">💪</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              nPnG JM
            </h1>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: 'Inter', letterSpacing: '-0.06em' }}>
              Entre para começar sua jornada fitness
            </p>
          </div>

          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter', letterSpacing: '-0.06em' }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Entrar com Google</span>
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Email Login Link */}
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full transition-all duration-300 hover:bg-accent"
            style={{ fontFamily: 'Inter', letterSpacing: '-0.06em' }}
          >
            Entrar com Email
          </Button>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'Inter' }}>
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="underline hover:text-primary transition-colors">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="underline hover:text-primary transition-colors">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
