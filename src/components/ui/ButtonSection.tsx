interface ButtonSectionProps {
  view: string;
  match: string;
  children: React.ReactNode;
  onClick: () => void;
}

export const ButtonSection = ({
  children,
  view,
  match,
  onClick,
}: ButtonSectionProps) => {
  const isActive = view === match;
  const className = isActive ? "!text-primary !bg-theme" : "";
  return (
    <button
      onClick={onClick}
      className={`w-max flex items-center gap-2 px-3 py-2 rounded transition-colors text-secondary bg-transparent ${className}`}
    >
      {children}
    </button>
  );
};
