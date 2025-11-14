import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/untyped";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string()
    .trim()
    .email('Por favor, insira um endereço de email válido')
    .max(255, 'Email muito longo'),
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(72, 'Senha muito longa')
});

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
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
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    try {
      z.string().trim().email().parse(email);
    } catch {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
        setIsForgotPassword(false);
        setEmail("");
      }
    } catch (error) {
      toast.error("Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    try {
      authSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Login realizado com sucesso!");
          onOpenChange(false);
          setEmail("");
          setPassword("");
          
          // Verifica se o usuário já completou o onboarding
          const { data: profileData } = await supabase
            .from('profiles' as any)
            .select('onboarding_completed')
            .eq('user_id', data.user.id)
            .maybeSingle();
          
          const profile = profileData as any;
          
          // Redireciona baseado no status do onboarding
          if (profile?.onboarding_completed) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        }
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email já está cadastrado. Faça login.");
          } else if (error.message.includes("Password should be at least")) {
            toast.error("A senha deve ter no mínimo 6 caracteres");
          } else {
            toast.error(`Erro ao criar conta: ${error.message}`);
          }
        } else {
          // Verifica se precisa confirmar email
          if (data?.user?.identities?.length === 0) {
            toast.error("Este email já está em uso. Tente fazer login.");
          } else if (data?.user && !data?.session) {
            toast.success(
              "Conta criada com sucesso! Verifique seu email para confirmar e depois faça login.",
              { duration: 6000 }
            );
          } else {
            toast.success("Conta criada com sucesso! Redirecionando...");
            onOpenChange(false);
            navigate("/onboarding");
          }
          setEmail("");
          setPassword("");
          setIsLogin(true); // Volta para tela de login
        }
      }
    } catch (error) {
      toast.error("Erro ao processar autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/20 glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isForgotPassword ? "Recuperar Senha" : isLogin ? "Entrar" : "Criar Conta"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isForgotPassword
              ? "Digite seu email para receber instruções de recuperação"
              : isLogin 
                ? "Entre para continuar sua jornada fitness" 
                : "Crie sua conta e comece a transformação"}
          </DialogDescription>
        </DialogHeader>

        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-background/50 border-border/50"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-hero hover:opacity-90 transition-smooth"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Email de Recuperação"
              )}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-muted-foreground hover:text-foreground transition-smooth underline"
                disabled={loading}
              >
                Voltar para o login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-background/50 border-border/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-hero hover:opacity-90 transition-smooth"
            disabled={loading || isGoogleLoading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              isLogin ? "Entrar" : "Criar Conta"
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

          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || isGoogleLoading}
            className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter', letterSpacing: '-0.06em' }}
          >
            {isGoogleLoading ? (
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

            <div className="text-center text-sm space-y-2">
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-muted-foreground hover:text-foreground transition-smooth underline block w-full"
                  disabled={loading}
                >
                  Esqueceu a senha?
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-muted-foreground hover:text-foreground transition-smooth underline"
                disabled={loading}
              >
                {isLogin 
                  ? "Não tem conta? Criar nova conta" 
                  : "Já tem conta? Fazer login"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
