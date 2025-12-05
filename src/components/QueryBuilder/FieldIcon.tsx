interface FieldIconProps {
  icon?: string;
}

export default function FieldIcon({ icon }: FieldIconProps) {
  if (icon === 'number') {
    return <span className="text-[#626266] font-bold text-sm">#</span>;
  }

  if (icon === 'date') {
    return (
      <svg className="w-3.5 h-3.5 text-[#626266]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    );
  }

  if (icon === 'computed') {
    return (
      <svg className="w-3.5 h-3.5 text-[#626266]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <path d="M8 7h8M8 12h8M8 17h4"/>
      </svg>
    );
  }

  return <span className="text-[#626266] text-sm">Aa</span>;
}
