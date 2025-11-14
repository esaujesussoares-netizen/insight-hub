interface ExerciseTransparentImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ExerciseTransparentImage({ 
  src, 
  alt, 
  className = "" 
}: ExerciseTransparentImageProps) {
  return (
    <div className="transparent-image-container">
      {/* Imagem com fundo transparente */}
      <img 
        src={src} 
        alt={alt}
        className={`exercise-image-transparent ${className}`}
        onError={(e) => {
          console.log('Erro ao carregar imagem transparente:', src);
          // Fallback: esconde a imagem se não carregar
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Overlay para garantir transparência */}
      <div className="transparency-overlay"></div>
    </div>
  );
}
