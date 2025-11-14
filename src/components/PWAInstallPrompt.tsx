import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    console.log('🔧 PWA Install Prompt: Inicializado');
    
    // Detectar plataforma
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      setPlatform('ios');
      console.log('📱 Plataforma detectada: iOS');
    } else if (isAndroid) {
      setPlatform('android');
      console.log('📱 Plataforma detectada: Android');
    } else {
      setPlatform('desktop');
      console.log('💻 Plataforma detectada: Desktop');
    }

    // Verificar se já foi instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    
    console.log('✅ App instalado?', isStandalone);
    console.log('❌ Prompt foi dispensado antes?', hasBeenDismissed);

    if (isStandalone) {
      console.log('⏭️ App já instalado, não mostrando prompt');
      return;
    }

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('🎉 Evento beforeinstallprompt capturado!');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Mostrar prompt após 2 segundos
    const timer = setTimeout(() => {
      console.log('⏰ 2 segundos passados, mostrando prompt...');
      setShowPrompt(true);
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    console.log('🎯 Botão de instalação clicado');
    
    if (deferredPrompt) {
      console.log('✨ Tentando instalação automática...');
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('📊 Resultado da instalação:', outcome);
        
        if (outcome === 'accepted') {
          console.log('✅ Usuário aceitou a instalação');
          setShowPrompt(false);
          localStorage.setItem('pwa-install-dismissed', 'true');
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ Erro na instalação automática:', error);
        setShowManualInstructions(true);
      }
    } else {
      console.log('📖 Instalação automática não disponível, mostrando instruções manuais');
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    console.log('❌ Usuário dispensou o prompt');
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const getManualInstructions = () => {
    switch (platform) {
      case 'ios':
        return (
          <div className="space-y-3">
            <p className="font-semibold text-sm">Como instalar no iPhone/iPad:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Toque no ícone <strong>Compartilhar</strong> (quadrado com seta) na parte inferior do Safari</li>
              <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
              <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
            </ol>
            <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
              <Download className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                O ícone ficará disponível na sua tela inicial como um app nativo!
              </p>
            </div>
          </div>
        );
      case 'android':
        return (
          <div className="space-y-3">
            <p className="font-semibold text-sm">Como instalar no Android:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Toque no menu <strong>⋮</strong> (três pontos) no canto superior direito do Chrome</li>
              <li>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar app"</strong></li>
              <li>Confirme tocando em <strong>"Adicionar"</strong> ou <strong>"Instalar"</strong></li>
            </ol>
            <div className="bg-green-50 p-3 rounded-lg flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-xs text-green-800">
                O app será instalado e ficará acessível com os outros apps!
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <p className="font-semibold text-sm">Como instalar no Desktop:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Clique no ícone <strong>⊕</strong> ou <strong>🖥️</strong> na barra de endereço</li>
              <li>Ou abra o menu do navegador e selecione <strong>"Instalar nPnG JM"</strong></li>
              <li>Confirme a instalação</li>
            </ol>
            <div className="bg-purple-50 p-3 rounded-lg flex items-start gap-2">
              <Monitor className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
              <p className="text-xs text-purple-800">
                O app será instalado como um aplicativo independente no seu computador!
              </p>
            </div>
          </div>
        );
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-2 border-primary/20 animate-in slide-in-from-bottom duration-500">
        <div className="relative p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <img src="/icon-192x192.png" alt="nPnG JM" className="w-16 h-16 rounded-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Instale o nPnG JM
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tenha acesso rápido e offline ao seu personal trainer com IA!
            </p>
          </div>

          {!showManualInstructions ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Acesso instantâneo da tela inicial
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Funciona offline
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Notificações de treino
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Experiência como app nativo
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="flex-1"
                >
                  Agora não
                </Button>
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar App
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {getManualInstructions()}
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="w-full"
              >
                Entendi
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
