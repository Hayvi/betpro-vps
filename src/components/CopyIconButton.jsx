import { useState } from 'react';
import { Copy } from '@/components/ui/BrandIcons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';


export function CopyIconButton({ value, className }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleCopy = async () => {
    if (!value) return;
    try {
      const textToCopy = String(value);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      // Show toast with the copied value
      toast.success(`${t('common_copy_success')}: ${textToCopy}`, {
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t('common_copy_error'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-slate-600/40 px-1.5 py-1 text-[10px]',
        'hover:bg-slate-800/60 active:scale-95 transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40',
        className
      )}
      aria-label={t('common_copy_aria')}
    >
      <Copy aria-hidden="true" className="w-3 h-3" />
      <span className="ml-1 hidden xs:inline">{copied ? t('common_copy_label_copied') : t('common_copy_label_copy')}</span>
    </button>
  );
}
