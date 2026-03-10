import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ensureProfile, signInWithEmail, signUpWithEmail } from '../services/supabase';

type AuthMode = 'login' | 'signup';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (mode === 'login') {
        const user = await signInWithEmail(email.trim(), password);
        await ensureProfile(user.id, user.email ?? undefined);
      } else {
        const { user, session } = await signUpWithEmail(email.trim(), password);
        if (session && user) {
          // メール確認OFFの場合：登録と同時にログイン済みになる
          // onAuthStateChangeが発火してApp.tsxが自動でホーム画面に遷移する
          await ensureProfile(user.id, user.email ?? undefined);
        } else {
          // メール確認ONの場合（通常は使わない）
          setInfo('確認メールを送信しました。メール内のリンクをタップしてください。');
          setMode('login');
        }
      }
    } catch (authError) {
      const errorMessage = authError instanceof Error ? authError.message : '認証に失敗しました。';
      console.error('Auth error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>FitnessApp</Text>
        <Text style={styles.subtitle}>AIアバターと一緒に筋トレを記録</Text>

        <View style={styles.switchRow}>
          <Pressable
            onPress={() => setMode('login')}
            style={[styles.switchButton, mode === 'login' && styles.switchButtonActive]}
          >
            <Text style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>
              ログイン
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('signup')}
            style={[styles.switchButton, mode === 'signup' && styles.switchButtonActive]}
          >
            <Text style={[styles.switchText, mode === 'signup' && styles.switchTextActive]}>
              サインアップ
            </Text>
          </Pressable>
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor="#7c7c9f"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="パスワード"
          placeholderTextColor="#7c7c9f"
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <Pressable style={styles.submitButton} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>{mode === 'login' ? 'ログイン' : 'アカウント作成'}</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#21213a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    padding: 20,
    gap: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#cfcfe6',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: '#171729',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  switchButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#e94560',
  },
  switchText: {
    color: '#9d9db8',
    fontSize: 14,
    fontWeight: '700',
  },
  switchTextActive: {
    color: '#ffffff',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34345a',
    backgroundColor: '#171729',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#e94560',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  error: {
    color: '#ff8fa1',
    fontSize: 13,
  },
  info: {
    color: '#9be9a8',
    fontSize: 13,
  },
});
