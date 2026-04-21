export function NeoLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      aria-label="Neo"
      role="img"
    >
      <polygon points="50,2 98,26 98,74 50,98 2,74 2,26" fill="#58BF00" />
      <polygon points="30,28 30,72 42,72 42,48 58,72 70,72 70,28 58,28 58,52 42,28" fill="white" />
    </svg>
  );
}
