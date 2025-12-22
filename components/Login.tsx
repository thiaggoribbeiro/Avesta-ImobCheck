
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
  onLogin: (email: string) => void;
}

type AuthMode = 'login' | 'request_access' | 'reset_password' | 'success';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'login') {
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('A conexão com o servidor está levando muito tempo. Tente novamente.');
      }, 60000);

      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          onLogin(data.user.email!);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao autenticar. Verifique suas credenciais.');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    } else {
      try {
        const { error: insertError } = await supabase.from('access_requests').insert([
          {
            name,
            email,
            phone,
            type: mode,
            status: 'pending'
          }
        ]);

        if (insertError) throw insertError;

        // Chamada direta para a Edge Function de e-mail
        const { data: functionData, error: functionError } = await supabase.functions.invoke('send-access-request-email', {
          body: {
            record: {
              name,
              email,
              phone,
              type: mode,
              created_at: new Date().toISOString()
            }
          }
        });

        if (functionError) {
          console.warn('Erro ao disparar e-mail (mas a solicitação foi salva):', functionError);
          // Não bloqueamos o usuário se o e-mail falhar, pois o dado foi salvo no banco.
        }

        setMode('success');
      } catch (err: any) {
        setError('Ocorreu um erro ao enviar sua solicitação. Tente novamente mais tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (mode === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <span className="material-symbols-outlined text-5xl">check_circle</span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Solicitação Enviada!</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Sua solicitação foi registrada no sistema. Entraremos em contato em breve via e-mail ou telefone.
            </p>
          </div>
          <button
            onClick={() => setMode('login')}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo.png"
            alt="ImobCheck Logo"
            className="w-20 h-20 object-contain"
          />
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white leading-none">
              Imob<span className="font-extrabold">Check</span>
            </h1>
            <span className="text-base text-slate-600 dark:text-slate-300 font-medium tracking-wide">Avesta</span>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-4">
              {mode === 'login' && 'Bem-vindo de volta'}
              {mode === 'request_access' && 'Solicitar Novo Acesso'}
              {mode === 'reset_password' && 'Recuperar Senha'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {mode !== 'login' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                </div>
                <input
                  className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 p-3.5 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder-slate-400"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">E-mail</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
              </div>
              <input
                className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 p-3.5 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder-slate-400"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {mode !== 'login' ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Telefone</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">call</span>
                </div>
                <input
                  className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 p-3.5 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder-slate-400"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Senha</label>
                <button
                  type="button"
                  onClick={() => setMode('reset_password')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input
                  className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 pr-11 p-3.5 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder-slate-400"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined">
                  {mode === 'login' ? 'login' : 'send'}
                </span>
                {mode === 'login' ? 'Entrar' : 'Enviar Solicitação'}
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                Não tem uma conta?
                <button
                  onClick={() => setMode('request_access')}
                  className="ml-1 font-bold text-primary hover:underline"
                >
                  Criar agora
                </button>
              </>
            ) : (
              <button
                onClick={() => setMode('login')}
                className="font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Voltar para o login
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
