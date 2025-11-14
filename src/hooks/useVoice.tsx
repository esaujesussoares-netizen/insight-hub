import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VoiceProvider = 'google-male' | 'google-female' | 'elevenlabs-male' | 'elevenlabs-female';

export const useVoice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = async (text: string, voiceProvider: VoiceProvider = 'google-male') => {
    if (!text || isPlaying) return;

    // Verificar se outra voz já está tocando (previne duplicação)
    const globalPlaying = sessionStorage.getItem('voice_playing') === 'true';
    if (globalPlaying) {
      console.log('Outra voz já está tocando, aguardando...');
      return;
    }

    setIsLoading(true);
    sessionStorage.setItem('voice_playing', 'true');
    
    try {
      console.log('Requesting speech for:', { text, voiceProvider });

      // Se for Google, usar Web Speech API nativa do navegador
      if (voiceProvider === 'google-male' || voiceProvider === 'google-female') {
        // Garantir que as vozes estejam carregadas
        const loadVoices = () => {
          return new Promise<SpeechSynthesisVoice[]>((resolve) => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve(voices);
              return;
            }
            
            // Aguardar evento de carregamento das vozes
            const voicesChangedHandler = () => {
              voices = window.speechSynthesis.getVoices();
              if (voices.length > 0) {
                window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
                resolve(voices);
              }
            };
            
            window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
            
            // Timeout de segurança
            setTimeout(() => {
              window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
              resolve(window.speechSynthesis.getVoices());
            }, 1000);
          });
        };
        
        const voices = await loadVoices();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Filtrar vozes em português
        const ptBrVoices = voices.filter(v => v.lang?.toLowerCase().startsWith('pt-br') || v.lang?.toLowerCase().startsWith('pt'));
        
        // Hints de nomes por gênero
        const maleNameHints = ['male','daniel','felipe','heitor','ricardo','thiago','joão','joao','miguel','pedro','andre','antônio','antonio'];
        const femaleNameHints = ['female','maria','luciana','francisca','leticia','camila','isabela','victoria','ana','sofia','carla'];
        
        // Função auxiliar para escolher por hints
        const pickByHints = (list: SpeechSynthesisVoice[], hints: string[]) => {
          return list.find(v => {
            const name = (v.name || '').toLowerCase();
            return hints.some(h => name.includes(h));
          }) || null;
        };
        
        // Selecionar voz baseada no gênero + ajustar timbre (pitch/rate)
        let selectedVoice: SpeechSynthesisVoice | null = null;
        if (voiceProvider === 'google-male') {
          // Tentar encontrar voz masculina por nome; se não houver, usar primeira pt-BR e deixar mais grave
          selectedVoice = pickByHints(ptBrVoices, maleNameHints) 
            || ptBrVoices[0] 
            || voices.find(v => v.lang?.toLowerCase().startsWith('pt')) 
            || voices[0] 
            || null;
          utterance.pitch = 0.86; // voz mais grave
          utterance.rate = 0.98;
        } else {
          // Tentar encontrar voz feminina; se não houver, usar pt-BR padrão e deixar um pouco mais aguda
          selectedVoice = pickByHints(ptBrVoices, femaleNameHints) 
            || ptBrVoices[1] 
            || ptBrVoices[0] 
            || voices.find(v => v.lang?.toLowerCase().startsWith('pt')) 
            || voices[0] 
            || null;
          utterance.pitch = 1.08; // voz mais aguda
          utterance.rate = 1.02;
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('Using voice:', selectedVoice.name);
        }
        
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
          sessionStorage.removeItem('voice_playing');
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          setIsLoading(false);
          sessionStorage.removeItem('voice_playing');
          toast.error('Erro ao reproduzir áudio');
        };
        
        window.speechSynthesis.speak(utterance);
        return;
      }

      // Para ElevenLabs, usar edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceProvider },
      });

      if (error) {
        console.error('Error generating speech:', error);
        
        // Edge function retornou erro - não mostrar toast, será tratado no catch
        sessionStorage.removeItem('voice_playing');
        setIsLoading(false);
        return;
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Convert base64 to blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Play audio
      const audio = new Audio(url);
      
      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false); // ✅ Resetar isLoading quando o áudio começar a tocar
      };
      audio.onended = () => {
        setIsPlaying(false);
        sessionStorage.removeItem('voice_playing');
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false); // ✅ Resetar isLoading em caso de erro
        sessionStorage.removeItem('voice_playing');
        URL.revokeObjectURL(url);
        toast.error('Erro ao reproduzir áudio');
      };

      await audio.play();
      console.log('Audio playing successfully');
    } catch (error) {
      console.error('Error in speak function:', error);
      sessionStorage.removeItem('voice_playing');
      setIsLoading(false);
      
      // Não mostrar toast para erros de voz - API pode estar temporariamente indisponível
      // O erro já foi logado no console para debug
    }
  };

  return { speak, isLoading, isPlaying };
};
