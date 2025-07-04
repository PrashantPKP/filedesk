import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface PasswordLoginProps {
  onLogin: () => void;
}

const PasswordLogin = ({ onLogin }: PasswordLoginProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1736') {
      localStorage.setItem('fileVaultAuth', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">File Vault</h1>
          <p className="text-gray-600">Enter password to access your files</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          
          <Button type="submit" className="w-full">
            Access Vault
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordLogin;
