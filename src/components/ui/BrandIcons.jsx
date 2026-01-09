import { cn } from '@/lib/utils';

function baseProps(className) {
  return {
    className: cn('shrink-0', className),
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
  };
}

export function BPHomeIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M4.5 10.5 12 4l7.5 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-3.25a.75.75 0 0 1-.75-.75V15a2 2 0 0 0-2-2h-.5a2 2 0 0 0-2 2v5.75a.75.75 0 0 1-.75.75H6A1.5 1.5 0 0 1 4.5 20v-9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 10.2h5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function BPSportsIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M6.25 8.25c2.25-3.25 9.25-3.25 11.5 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 9.5v5.25c0 1.25 1 2.25 2.25 2.25h9.5c1.25 0 2.25-1 2.25-2.25V9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 17v2.25M16 17v2.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 12.25h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function BPLiveIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M8.5 12a3.5 3.5 0 1 1 7 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 10.2a7 7 0 0 1 12 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M4.2 8.1a10 10 0 0 1 15.6 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M12 14.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function BPCasinoIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M8.5 3.75h7l4.75 5.75-8.25 10.75L3.75 9.5 8.5 3.75Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 9.5h7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M12 9.5v10.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

export function BPWalletIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M4.5 8.25A2.25 2.25 0 0 1 6.75 6h10.5A2.25 2.25 0 0 1 19.5 8.25v8.5A2.25 2.25 0 0 1 17.25 19H6.75A2.25 2.25 0 0 1 4.5 16.75v-8.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 10.25h-3.25a2 2 0 0 0 0 4H19.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16.4 12.25h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BPCoinIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9.2 9.4c.3-1.3 1.4-2.2 2.8-2.2 1.6 0 2.8 1 2.8 2.4 0 1.1-.6 1.8-2 2.3l-1 .35c-1.2.4-1.8 1-1.8 2.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 16.7h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BPUserIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M12 12.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5.5 19.2c1.4-2.3 3.6-3.4 6.5-3.4s5.1 1.1 6.5 3.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BPLoginIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M10.25 7.5V6.75c0-1.24 1.01-2.25 2.25-2.25h6c1.24 0 2.25 1.01 2.25 2.25v10.5c0 1.24-1.01 2.25-2.25 2.25h-6c-1.24 0-2.25-1.01-2.25-2.25v-.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m8 8.5 3.5 3.5L8 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BPLogoutIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M13.75 7.5V6.75c0-1.24-1.01-2.25-2.25-2.25h-6C4.26 4.5 3.25 5.51 3.25 6.75v10.5c0 1.24 1.01 2.25 2.25 2.25h6c1.24 0 2.25-1.01 2.25-2.25v-.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 12h-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m16 8.5-3.5 3.5L16 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BPChevronRightIcon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="m10 7 5 5-5 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function X({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Plus({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Minus({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRight({ className, ...props }) {
  return <BPChevronRightIcon className={className} {...props} />;
}

export function ChevronLeft({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="m14 7-5 5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronUp({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="m7 14 5-5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDown({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoreHorizontal({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M6.5 12h.01M12 12h.01M17.5 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Check({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M5.5 12.5 10 17l8.5-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertCircle({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.2v5.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 16.7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function RefreshCw({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M20 12a8 8 0 0 1-13.7 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12a8 8 0 0 1 13.7-5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.3 17.6H4.2v-2.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.7 6.4h2.1v2.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Clock({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5v5l3.2 1.9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bell({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M12 21a2.25 2.25 0 0 0 2.2-1.7H9.8A2.25 2.25 0 0 0 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 16.6V11a6 6 0 0 0-12 0v5.6l-1.4 1.6h14.8L18 16.6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sun({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3.5v2.1M12 18.4v2.1M4.3 12H6.4M17.6 12h2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m5.2 5.2 1.5 1.5m11.1 11.1 1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Moon({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path
        d="M20 13.2A7 7 0 0 1 10.8 4a6.5 6.5 0 1 0 9.2 9.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Search({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Copy({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M9 9h10v10H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5V4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function Clipboard({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M9 4.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 3.5h6a1.5 1.5 0 0 1 1.5 1.5V6.5a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 6.5V5A1.5 1.5 0 0 1 9 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6.5 7.5v13A1.5 1.5 0 0 0 8 22h8a1.5 1.5 0 0 0 1.5-1.5v-13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function Eye({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function EyeOff({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M3.5 4.5 20.5 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 6.2A10.2 10.2 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.6 16.6 0 0 1-3 4.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.4 7.9A16.3 16.3 0 0 0 2.5 12s3.5 6.5 9.5 6.5c1.2 0 2.3-.2 3.3-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.2 10.2a3 3 0 0 0 3.6 3.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Trash2({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M4.5 7h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7.5 7l.8 13A1.5 1.5 0 0 0 9.8 21.5h4.4a1.5 1.5 0 0 0 1.5-1.4l.8-13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10.2 11v6M13.8 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Play({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M9.3 7.6 18 12l-8.7 4.4V7.6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function Grid3X3({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M4.5 4.5h5v5h-5v-5Zm0 7.5h5v5h-5v-5Zm0 7.5h5v5h-5v-5Zm7.5-15h5v5h-5v-5Zm0 7.5h5v5h-5v-5Zm0 7.5h5v5h-5v-5Zm7.5-15h5v5h-5v-5Zm0 7.5h5v5h-5v-5Zm0 7.5h5v5h-5v-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function LayoutGrid({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M4.5 4.5h7v7h-7v-7Zm8.5 0h6.5v15H13V4.5ZM4.5 13h7v6.5h-7V13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function Flame({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 21c3.6 0 6.5-2.9 6.5-6.5 0-3.2-2.2-4.9-3.5-6.6-.8-1.1-1.3-2.1-1.3-3.9-2 1.1-3.2 2.8-3.7 4.8C9.4 7.5 8.2 6.3 7.2 5 5.7 7 5 8.9 5 10.9 5 16.1 7.9 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10.3 14.3c-.4 1.9.8 3.7 1.7 4.7 1.6-1.2 2.6-2.7 2.3-4.7-.2-1.2-1-2.1-2.3-3-1.2.9-1.6 1.7-1.7 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

export function Gem({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M7 4h10l4 6-9 11L3 10l4-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 4l5 6 5-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function Trophy({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M8 4.5h8V9a4 4 0 0 1-8 0V4.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.5 17h5M10.5 21h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6H4.8A1.8 1.8 0 0 0 3 7.8v.7C3 10.4 4.6 12 6.5 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 6h1.2A1.8 1.8 0 0 1 21 7.8v.7c0 1.9-1.6 3.5-3.5 3.5H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13.2V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkles({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 3l1.2 3.6L17 7.8l-3.8 1.2L12 12.6 10.8 9 7 7.8l3.8-1.2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.7" />
      <path d="M19 13l.6 1.7L21.3 15l-1.7.6L19 17.3l-.6-1.7L16.7 15l1.7-.6L19 13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export function Award({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M9.2 12.2 8 21l4-2 4 2-1.2-8.8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10.3 7.9 12 6.6l1.7 1.3-.6 2.1H10.9l-.6-2.1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

export function Zap({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function TrendingUp({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M4.5 16.5 10 11l3.2 3.2 6.3-6.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.8 7.5H19.5V11.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 3.5 14.6 9l6 .6-4.5 3.6 1.4 5.7L12 16.9 6.5 18.9l1.4-5.7-4.5-3.6 6-.6L12 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function Calendar({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M7 3.8v2.4M17 3.8v2.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.5 7.2h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 5.8h11A2 2 0 0 1 19.5 7.8v11.7a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7.8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 11h3M8 14.2h3M13 11h3M13 14.2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function FilterX({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M4 5.5h16l-6.5 7v6l-3 1.8v-7.8L4 5.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15.5 9.8 19.2 13.5M19.2 9.8l-3.7 3.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Users({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M9.2 12.4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.8 11.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z" stroke="currentColor" strokeWidth="2" opacity="0.8" />
      <path d="M3.8 19.2c1.2-2.2 3.1-3.4 5.4-3.4s4.2 1.2 5.4 3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.2 18.8c.8-1.6 2.1-2.5 3.8-2.5 1.2 0 2.3.4 3.2 1.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function UserX({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M10.2 12.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M3.6 19.2c1.4-2.3 3.6-3.4 6.6-3.4 1.3 0 2.4.2 3.4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.2 11.2 19.6 14.6M19.6 11.2l-3.4 3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowDownCircle({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.3v8.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="m8.8 12.7 3.2 3.2 3.2-3.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Radio({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M4.5 12a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.2 12a4.8 4.8 0 0 1 9.6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M10 12a2 2 0 0 1 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M12 14.6a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Gamepad2({ className, ...props }) {
  return (
    <svg {...baseProps(className)} {...props}>
      <path d="M7.2 9.5h9.6c2 0 3.6 1.6 3.6 3.6 0 2.7-1.1 5.9-3 5.9-1.2 0-2.1-1.1-2.7-2.1-.3-.6-1-.9-1.7-.9H11c-.7 0-1.4.3-1.7.9-.6 1-1.5 2.1-2.7 2.1-1.9 0-3-3.2-3-5.9 0-2 1.6-3.6 3.6-3.6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8.4 12.8h3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11.2v3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.4 12.2h.01M18.2 13.8h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
