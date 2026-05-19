import React, { useState, useRef, useEffect } from 'react'; // Adicionado useEffect
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const AIChatScreen = ({ route }: any) => {
  // Pega o token vindo do initialParams do App.tsx
  const { token } = route.params || {};

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Olá! Sou o Space Expert, seu assistente de mecânica. Como posso ajudar com a manutenção hoje? 🏍️",
      sender: 'ai'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // LOG de depuração para você ver no terminal do Ubuntu se o token chegou
  useEffect(() => {
    console.log("Token recebido no Chat:", token ? "Token Carregado ✅" : "Token Vazio ❌");
  }, [token]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Se o token não estiver aqui, nem tenta a requisição para evitar o 401
    if (!token) {
      const errorMsg: Message = { 
        id: Date.now().toString(), 
        text: "Erro de autenticação: Token não encontrado. Tente fazer login novamente.", 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Ajuste o IP conforme a rede do seu Dell G15 em Maceió
      const response = await axios.post(
        'http://192.168.0.123:8000/api/v1/ai/consultar/', 
        { pergunta: currentInput },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`, // Garantindo o formato Bearer
            'Content-Type': 'application/json'
          } 
        }
      );

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: response.data.resposta, 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Erro Axios 401/500:", error.response?.data || error.message);
      
      const errorMsg: Message = { 
        id: Date.now().toString(), 
        text: "Desculpe, não consegui processar sua dúvida agora. Verifique a conexão com o servidor.", 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble, 
            item.sender === 'user' ? styles.userBubble : styles.aiBubble
          ]}>
            {item.sender === 'ai' && (
              <Text style={styles.aiBadge}>SPACE EXPERT</Text>
            )}
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Descreva o problema da moto..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <MaterialCommunityIcons name="send" color="white" size={24} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  bubble: { 
    padding: 14, 
    borderRadius: 20, 
    marginVertical: 6, 
    maxWidth: '85%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#F97316', 
    borderBottomRightRadius: 4 
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#1a1a1a', 
    borderBottomLeftRadius: 4 
  },
  aiBadge: { 
    color: '#F97316', 
    fontSize: 10, 
    fontWeight: 'bold', 
    marginBottom: 4,
    letterSpacing: 1
  },
  messageText: { color: '#fff', fontSize: 15, lineHeight: 20 },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderColor: '#eee',
    alignItems: 'center'
  },
  input: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    borderRadius: 25, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    maxHeight: 100, 
    color: '#333',
    fontSize: 16
  },
  sendButton: { 
    marginLeft: 10, 
    backgroundColor: '#F97316', 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});

export default AIChatScreen;