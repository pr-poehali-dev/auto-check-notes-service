import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormProps {
  onLogin: (email: string, name: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const teacherName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
      onLogin(email, teacherName);
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setEmail('teacher@school.ru');
    setPassword('demo123');
    setTimeout(() => {
      onLogin('teacher@school.ru', 'Мария Ивановна');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Icon name="BookOpen" size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ПроверкаТетрадей.РФ</h1>
          <p className="text-white/80 text-lg">Вход для учителей</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Войти в систему</CardTitle>
            <CardDescription>
              Введите свои данные для доступа к платформе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Icon name="Mail" size={18} className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@school.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Icon name="Lock" size={18} className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={20} className="mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">или</span>
              </div>
            </div>

            <Button 
              onClick={handleDemoLogin}
              variant="outline" 
              className="w-full"
              type="button"
            >
              <Icon name="Sparkles" size={18} className="mr-2" />
              Демо-вход (учитель)
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Нет аккаунта?{' '}
              <button className="text-primary hover:underline font-medium">
                Зарегистрироваться
              </button>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-white/60 text-sm mt-6">
          © 2026 ПроверкаТетрадей.РФ — Автоматизация проверки письменных работ
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
