import { useEffect, useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import AppLogo from '../components/AppLogo';
import { getAuthErrorMessage, loginWithEmail } from '../services/authService';
import useAuth from '../hooks/useAuth';
import FeedbackModal from '../components/FeedbackModal';
import styles from '../styles/screens/LoginScreen.styles';

export default function LoginScreen({ navigation, route }) {
  const { user, loading: sessionLoading } = useAuth();
  const [email, setEmail] = useState(route?.params?.registeredEmail || '');
  const [password, setPassword] = useState(route?.params?.registeredPassword || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, type: 'erro', title: '', message: '' });

  useEffect(() => {
    if (!sessionLoading && user) {
      navigation.replace('Home');
    }
  }, [navigation, sessionLoading, user]);

  function showError(message) {
    setFeedback({ visible: true, type: 'erro', title: 'Login não realizado', message });
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return showError('Verifique o e-mail e a senha informados.');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return showError('Digite um e-mail válido para continuar.');

    try {
      setLoading(true);
      await loginWithEmail(normalizedEmail, password);
      navigation.replace('Home');
    } catch (error) {
      showError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.card}>
        <AppLogo />
        <Text style={styles.kicker}>CENTRAL DE RETENÇÃO</Text>
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Decisões melhores para manter clientes na rede Ford.</Text>

        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#94A3B8" secureTextEntry value={password} onChangeText={setPassword} />

        <PrimaryButton title={loading || sessionLoading ? 'Entrando...' : 'Entrar'} onPress={handleLogin} disabled={loading || sessionLoading} />
        <Text style={styles.registerPrompt}>Ainda não tem conta?</Text>
        <PrimaryButton title="Criar conta" variant="secondary" onPress={() => navigation.navigate('Cadastro')} disabled={loading || sessionLoading} />
      </View>

      <FeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        buttonText="Tentar novamente"
        onButtonPress={() => setFeedback((prev) => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}
