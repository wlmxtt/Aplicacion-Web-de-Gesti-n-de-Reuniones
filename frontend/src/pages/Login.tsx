import React, { useState } from 'react';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('ugma_token', response.data.token);
      localStorage.setItem('ugma_user', JSON.stringify(response.data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Bienvenido</h2>
          <p className="mt-2 text-sm text-slate-400">Inicia sesión en el sistema UGMA</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/50">{error}</div>}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-300">Correo Electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-xl border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                placeholder="director@ugma.edu.ve"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" id="password-label" className="block text-sm font-medium text-slate-300">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-xl border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
