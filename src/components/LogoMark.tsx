type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bac PowerSchool logo"
    >
      <rect width="64" height="64" rx="16" fill="#4F46E5" />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="#FFFFFF"
      >
        BP
      </text>
    </svg>
  );
}
