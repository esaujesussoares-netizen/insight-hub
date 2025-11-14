import { useState, useRef, useCallback } from 'react';
import { useVoice, VoiceProvider } from './useVoice';
import { supabase } from '@/integrations/supabase/untyped';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationContext {
  hasIntroduced: boolean;
  lastObjective: string;
  userPreferences: string[];
  mood: string;
}

interface Intent {
  type: string;
  data?: string;
}

export const useChat = (initialVoiceProvider: VoiceProvider = 'google-male') => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState('');
  const [aiName, setAiName] = useState<string>('');
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>(initialVoiceProvider);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    hasIntroduced: false,
    lastObjective: '',
    userPreferences: [],
    mood: 'neutral'
  });
  
  const { speak, isLoading: isVoiceLoading } = useVoice();
  const chatHistoryRef = useRef<Message[]>([]);

  // Analisar intenção do usuário de forma mais inteligente
  const analyzeIntent = useCallback((message: string): Intent => {
    const lowerMsg = message.toLowerCase().trim();
    
    // Padrões para captura de nome
    const namePatterns = [
      /(meu nome é|me chamo|sou o|sou a|pode me chamar de)\s+([a-záàâãéèêíïóôõöúçñ]{2,20})/i,
      /(nome é)\s+([a-záàâãéèêíïóôõöúçñ]{2,20})/i,
      /^([a-záàâãéèêíïóôõöúçñ]{2,20})$/i // Apenas um nome sem contexto
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[2]) {
        const name = match[2].split(' ')[0].trim();
        if (name.length >= 2 && name.length <= 20) {
          return { type: 'set_name', data: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() };
        }
      } else if (pattern.test(lowerMsg) && lowerMsg.split(' ').length === 1) {
        // Caso o usuário digite apenas o nome
        const name = lowerMsg;
        if (name.length >= 2 && name.length <= 20 && !/[0-9]/.test(name)) {
          return { type: 'set_name', data: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() };
        }
      }
    }

    // Outras intenções
    if (/(oi|olá|ola|e aí|eai|hello|hi|opa)/.test(lowerMsg)) {
      return { type: 'greeting' };
    }
    
    if (/(dia|data|hoje|que dia)/.test(lowerMsg)) {
      return { type: 'date_info' };
    }
    
    if (/(emagrecer|perder peso|secar|dieta|emagrecimento)/.test(lowerMsg)) {
      return { type: 'weight_loss' };
    }
    
    if (/(massa|muscular|ganhar|forte|hipertrofia)/.test(lowerMsg)) {
      return { type: 'muscle_gain' };
    }
    
    if (/(energia|força|cansado|fadiga|disposição)/.test(lowerMsg)) {
      return { type: 'energy' };
    }
    
    if (/(receita|comer|refeição|fome|almoço|janta|jantar|lanche|ceia)/.test(lowerMsg)) {
      return { type: 'meal_suggestion' };
    }
    
    if (/(obrigado|obrigada|valeu|agradeço)/.test(lowerMsg)) {
      return { type: 'thanks' };
    }
    
    return { type: 'general' };
  }, []);

  // Gerar resposta usando ChatGPT via edge function
  const generateResponse = useCallback(async (intent: Intent): Promise<string> => {
    try {
      // Preparar histórico de mensagens para o ChatGPT
      const chatMessages = chatHistoryRef.current.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('nutri-ai-chat', {
        body: {
          messages: chatMessages,
          userName,
          intent,
          userProfile
        }
      });

      if (error) {
        console.error('Erro ao chamar nutri-ai-chat:', error);
        throw error;
      }

      if (data?.fallback) {
        return data.fallback;
      }

      return data?.response || 'Desculpe, não consegui processar sua mensagem. Pode tentar novamente?';
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Ops, tive um problema aqui. Vamos tentar de novo?';
    }
  }, [userName, userProfile]);

  // Salvar mensagem no banco
  const saveMessage = useCallback(async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('nutri_ai_messages' as any)
        .insert({
          conversation_id: conversationId,
          role,
          content
        });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }, [user]);

  // Criar nova conversa
  const createConversation = useCallback(async (firstMessage: string) => {
    if (!user?.id) return null;

    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
      const { data, error } = await supabase
        .from('nutri_ai_conversations' as any)
        .insert({
          user_id: user.id,
          title
        })
        .select()
        .single();

      if (error) throw error;
      return (data as any)?.id || null;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      return null;
    }
  }, [user]);

  // Carregar conversa anterior
  const loadConversation = useCallback(async (conversationId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('nutri_ai_messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = (data as any[]).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));

      setMessages(loadedMessages);
      chatHistoryRef.current = loadedMessages;
      setCurrentConversationId(conversationId);
      toast.success('Conversa carregada');
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      toast.error('Erro ao carregar conversa');
    }
  }, [user]);

  // Processar mensagem do usuário
  const sendMessage = useCallback(async (content: string, useVoice: boolean = true) => {
    if (!content.trim() || isProcessing) return;

    setIsProcessing(true);
    
    // Criar conversa se não existir
    if (!currentConversationId && user?.id) {
      const newConvId = await createConversation(content);
      if (newConvId) {
        setCurrentConversationId(newConvId);
        await saveMessage(newConvId, 'user', content.trim());
      }
    } else if (currentConversationId) {
      await saveMessage(currentConversationId, 'user', content.trim());
    }
    
    // Adicionar mensagem do usuário
    const userMessage: Message = { role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    chatHistoryRef.current = [...chatHistoryRef.current, userMessage];

    try {
      // Analisar intenção
      const intent = analyzeIntent(content);
      
      // Processar intenção de nome localmente com humor
      let aiResponse = '';
      if (intent.type === 'set_name' && intent.data) {
        setUserName(intent.data);
        setConversationContext(prev => ({ ...prev, hasIntroduced: true }));
        
        // Resposta humorística quando o usuário diz o nome
        aiResponse = `Olha que coincidência maravilhosa! Eu também me chamo ${intent.data}... então meu chará, podemos começar? 😄`;
      } else {
        // Gerar resposta usando ChatGPT
        aiResponse = await generateResponse(intent);
      }
      
      // Adicionar resposta do AI
      const aiMessage: Message = { role: 'assistant', content: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      chatHistoryRef.current = [...chatHistoryRef.current, aiMessage];

      // Salvar resposta do assistente
      if (currentConversationId) {
        await saveMessage(currentConversationId, 'assistant', aiResponse);
      }

      // Falar a resposta sempre (removendo emojis)
      console.log('🔊 Preparando para falar resposta com voz:', voiceProvider);
      // Remove emojis e markdown antes de falar
      const textToSpeak = aiResponse
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
        .replace(/\*\*/g, '')
        .trim();
      
      if (textToSpeak) {
        console.log('🗣️ Falando:', textToSpeak.substring(0, 50) + '...');
        await speak(textToSpeak, voiceProvider);
      }

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Desculpe, tive um problema. Pode repetir?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [analyzeIntent, generateResponse, speak, isProcessing, isVoiceLoading, voiceProvider, currentConversationId, user, createConversation, saveMessage]);

  // Inicializar conversa
  const startConversation = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Buscar informações completas do perfil para personalizar voz, nome e dietas
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Armazenar perfil completo para uso nas conversas
      setUserProfile(profile);

      // Definir nome do AI baseado no nome do usuário
      let profileName = profile?.name || 'Amigo';
      
      // Se for email, pegar parte antes do @ e remover caracteres especiais
      if (profileName.includes('@')) {
        profileName = profileName.split('@')[0].replace(/[^a-zA-Z]/g, '');
      }
      
      const firstName = profileName.split(' ')[0];
      setAiName(firstName);

      // Definir voz baseada no gênero
      const genderBasedVoice: VoiceProvider = profile?.gender === 'female' 
        ? 'google-female' 
        : 'google-male';
      
      setVoiceProvider(genderBasedVoice);

      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Olá! Eu sou seu NutriAI e me chamo ${firstName}. Qual é o seu nome?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      chatHistoryRef.current = [welcomeMessage];
      
      // Falar a mensagem de boas-vindas com a voz apropriada
      setTimeout(() => speak(`Olá! Eu sou seu NutriAI e me chamo ${firstName}. Qual é o seu nome?`, genderBasedVoice), 1000);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      // Fallback para mensagem padrão
      const welcomeMessage: Message = {
        role: 'assistant',
        content: 'Olá! Eu sou seu NutriAI. Qual é o seu nome?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      chatHistoryRef.current = [welcomeMessage];
      setTimeout(() => speak('Olá! Eu sou seu NutriAI. Qual é o seu nome?', voiceProvider), 1000);
    }
  }, [speak, voiceProvider, user]);

  return {
    messages,
    sendMessage,
    startConversation,
    loadConversation,
    isProcessing,
    userName,
    conversationContext,
    voiceProvider,
    setVoiceProvider,
    currentConversationId
  };
};
