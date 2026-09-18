import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import AppLogo from '../components/AppLogo';
import { getAuthErrorMessage, logout, registerWithEmail } from '../services/authService';
import FeedbackModal from '../components/FeedbackModal';
import styles from '../styles/screens/RegisterScreen.styles';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, type: 'aviso', title: '', message: '', goToLogin: false });

  function openFeedback(type, title, message, goToLogin = false) {
    setFeedback({ visible: true, type, title, message, goToLogin });
  }

  async function handleRegister() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!name.trim() || !normalizedEmail || !password.trim() || !confirmPassword.trim()) {
      return openFeedback('aviso', 'Campos incompletos', 'Preencha todos os campos obrigatórios antes de continuar.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return openFeedback('erro', 'Cadastro não realizado', 'Digite um e-mail válido para concluir o cadastro.');
    }
    if (password.length < 6) {
      return openFeedback('erro', 'Cadastro não realizado', 'A senha deve ter pelo menos 6 caracteres.');
    }
    if (password !== confirmPassword) {
      return openFeedback('erro', 'Cadastro não realizado', 'Senha e confirmar senha precisam ser iguais.');
    }

    try {
      setLoading(true);
      await registerWithEmail({ name, email: normalizedEmail, password });
      await logout();
      openFeedback(
        'sucesso',
        'Cadastro realizado com sucesso',
        'Sua conta foi criada no Firebase com o perfil inicial Analista. Agora você já pode entrar.',
        true,
      );
    } catch (error) {
      openFeedback('erro', 'Cadastro não realizado', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.card}>
        <AppLogo />
        <Text style={styles.kicker}>NOVO ACESSO</Text>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Entre na operação FordRetain em poucos passos.</Text>
        <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#94A3B8" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="Confirmar senha" placeholderTextColor="#94A3B8" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <Text style={styles.roleNotice}>Novas contas recebem o perfil Analista. Perfis elevados são definidos por um administrador.</Text>
        <PrimaryButton title={loading ? 'Cadastrando...' : 'Cadastrar'} onPress={handleRegister} disabled={loading} />
        <PrimaryButton title="Voltar ao Login" variant="secondary" onPress={() => navigation.navigate('Login')} disabled={loading} />
      </View>

      <FeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        buttonText={feedback.goToLogin ? 'Ir para Login' : 'Entendi'}
        onButtonPress={() => {
          const next = feedback.goToLogin;
          setFeedback((prev) => ({ ...prev, visible: false, goToLogin: false }));
          if (next) navigation.navigate('Login', { registeredEmail: email.trim().toLowerCase(), registeredPassword: password });
        }}
      />
    </KeyboardAvoidingView>
  );
}
