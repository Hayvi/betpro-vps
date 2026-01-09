import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const StyledCard = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-xl border p-4 md:p-5 overflow-hidden ui-trans-fast",
        // Light mode: Clean white with subtle border
        "bg-white border-slate-200",
        // Dark mode: Deep solid slate with subtle gold border accent
        "dark:bg-[#0B1121] dark:border-amber-500/10",
        // Refined shadows with gold undertones
        "shadow-sm hover:shadow-lg",
        "dark:shadow-amber-950/20 dark:hover:shadow-amber-900/30",
        // Elegant hover state - brighten gold border
        "hover:border-amber-500/20 dark:hover:border-amber-500/20",
        className
      )}
      {...props}
    >
      {/* Removed decorative blobs and noise patterns for a clean, non-AI look */}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

StyledCard.displayName = 'StyledCard';

export { StyledCard };
export default StyledCard;