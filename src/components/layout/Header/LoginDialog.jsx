import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';


export function LoginDialog({ open, onOpenChange }) {
  const { isDark } = useTheme();
  const { showError, showSuccess } = useToast();
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { t, isRtl } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showError(t('auth_login_missingCredentials'));
      return;
    }

    const result = await login(username.trim(), password);
    if (result && !result.error) {
      showSuccess(t('auth_login_success'));
      onOpenChange(false);
    } else if (result && result.error) {
      const message =
        result.error === 'invalid_credentials'
          ? t('auth_login_invalidCredentials')
          : result.error === 'user_not_found'
          ? t('auth_login_userNotFound')
          : result.error === 'inactive_user'
          ? t('auth_login_inactiveUser')
          : t('auth_unexpectedError');
      showError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md transition-all duration-500 rounded-2xl border-0 backdrop-blur-xl',
          isDark ? 'bg-slate-900/95 shadow-2xl' : 'bg-white/95 shadow-2xl'
        )}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className={cn(
            'text-center text-2xl font-black bg-clip-text',
            isDark
              ? 'from-cyan-300 to-emerald-300 text-transparent bg-gradient-to-l'
              : 'from-cyan-600 to-emerald-600 text-transparent bg-gradient-to-l'
          )}>
            {t('auth_login_title')}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold">
              {t('auth_login_usernameLabel')}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t('auth_login_usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">
              {t('auth_login_passwordLabel')}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth_login_passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            variant="primary"
            className="w-full"
          >
            {loading ? t('auth_login_loading') : t('auth_login_button')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
