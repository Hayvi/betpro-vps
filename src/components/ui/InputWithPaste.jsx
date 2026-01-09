import { forwardRef, useRef } from "react";
import { Clipboard, Search } from "@/components/ui/BrandIcons";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";

const InputWithPaste = forwardRef(
  ({ className, type, value, onChange, showPaste = true, showSearch = false, variant = 'default', ...props }, ref) => {
    const inputRef = useRef(null);
    const combinedRef = ref || inputRef;
    const { t } = useI18n();

    const handlePaste = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && onChange) {
          onChange({ target: { value: text }, currentTarget: { value: text } });
        }
      } catch (err) {
        console.warn("Clipboard access denied", err);
      }
    };

    return (
      <div className="relative w-full">
        <input
          type={type}
          value={value}
          onChange={onChange}
          ref={combinedRef}
          className={cn(
            variant === 'dashboard'
              ? "dash-control"
              : cn(
                "w-full px-5 py-3 rounded-xl border ui-trans-fast",
                "bg-slate-900/40 border-slate-800/80 text-white placeholder:text-slate-500",
                "focus:outline-none focus:bg-slate-900/60 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
              ),
            showPaste && "pl-12 md:pl-4 rtl:pl-4 rtl:pr-12 rtl:md:pr-4",
            showSearch && "pr-12 rtl:pr-4 rtl:pl-12",
            className
          )}
          {...props}
        />
        {showPaste && (
          <button
            type="button"
            onClick={handlePaste}
            className="md:hidden absolute start-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-300 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            aria-label={t('common_paste_aria')}
          >
            <Clipboard className="w-4 h-4" />
          </button>
        )}
        {showSearch && (
          <Search
            aria-hidden="true"
            className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          />
        )}
      </div>
    );
  }
);

InputWithPaste.displayName = "InputWithPaste";

export { InputWithPaste };