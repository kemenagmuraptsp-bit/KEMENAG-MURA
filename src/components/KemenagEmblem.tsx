export function KemenagEmblem({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <img
      src="/assets/aistudio/Kementerian_Agama_new_logo_f9b3eec1.png"
      alt="Logo Kementerian Agama Republik Indonesia"
      className={`${className} object-contain select-none`}
    />
  );
}
