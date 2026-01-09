import { useState, useCallback } from 'react';
import { changeOwnPassword } from '@/services/rbacAdminService';
import { useToast } from '@/contexts/ToastContext';
import { useI18n } from '@/contexts/I18nContext';

export function usePasswordChange() {
  const { showError, showSuccess } = useToast();
  const { t } = useI18n();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      return t('password_change_validation_missing');
    }

    if (newPassword.length < 8) {
      return t('password_change_validation_tooShort');
    }

    if (newPassword !== confirmPassword) {
      return t('password_change_validation_mismatch');
    }

    return null;
  };

  const handleSubmit = useCallback(
    async (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      const validationError = validate();
      if (validationError) {
        showError(validationError);
        return;
      }

      setChangingPassword(true);
      const { error } = await changeOwnPassword(newPassword);
      setChangingPassword(false);

      if (error) {
        const errorMessage =
          error === 'invalid_password'
            ? t('password_change_error_invalidPassword')
            : error === 'not_authorized'
              ? t('password_change_error_notAuthorized')
              : t('password_change_error_generic');
        showError(errorMessage);
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      showSuccess(t('password_change_success'));
    },
    [newPassword, confirmPassword, showError, showSuccess, t]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const canSubmit = !!newPassword && !!confirmPassword && !changingPassword;

  return {
    newPassword,
    confirmPassword,
    showPassword,
    changingPassword,
    setNewPassword,
    setConfirmPassword,
    toggleShowPassword,
    handleSubmit,
    canSubmit,
  };
}
