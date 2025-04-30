
import React, { useState, useRef, useEffect } from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { CirclePlay, Video } from 'lucide-react';

const Webinar = () => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Este efecto simula que el video ha terminado después de 15 segundos
  // En una implementación real, usarías el evento onEnded del video
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (videoStarted) {
      timer = setTimeout(() => {
        setVideoEnded(true);
      }, 15000); // 15 segundos para simular fin del video
    }
    
    return () => clearTimeout(timer);
  }, [videoStarted]);

  const handlePlayVideo = () => {
    setVideoStarted(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleCalendlyClick = () => {
    // En una implementación real, esto abriría Calendly
    window.open('https://calendly.com/your-calendly-link', '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-viralDark">
      {/* Header */}
      <header className="py-4 px-6 flex justify-center md:justify-start">
        <div className="container">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12 flex flex-col items-center">
        <div className="max-w-4xl w-full mx-auto text-center space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Descubra cómo <span className="text-viralOrange">ViralClicker</span> puede transformar su negocio
          </h1>
          
          <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden">
            {!videoStarted ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-viralDark/70">
                <CirclePlay className="w-16 h-16 text-viralOrange mb-4" />
                <Button 
                  onClick={handlePlayVideo}
                  className="bg-viralOrange hover:bg-viralOrange/90 text-white font-bold"
                >
                  Ver webinar ahora
                </Button>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                autoPlay
                poster="/lovable-uploads/fdafc651-14c1-4db1-8d9d-a4a0171a29b6.png"
              >
                <source src="#" type="video/mp4" />
                Su navegador no soporta el elemento de video.
              </video>
            )}
          </div>
          
          {videoEnded && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                ¿Listo para llevar su negocio al siguiente nivel?
              </h2>
              
              <p className="text-white/80 text-lg">
                Agende una videollamada con uno de nuestros expertos para recibir una consultoría personalizada.
              </p>
              
              <Button 
                onClick={handleCalendlyClick}
                className="bg-viralOrange hover:bg-viralOrange/90 text-white text-lg font-bold py-6 px-8 rounded-full"
              >
                <Video className="w-5 h-5 mr-2" />
                Reservar una videollamada
              </Button>
            </div>
          )}
          
          <div className="mt-12 p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Lo que nuestros clientes dicen</h3>
            
            <div className="space-y-4">
              <p className="text-white/80 italic">
                "Gracias a ViralClicker hemos aumentado nuestras conversiones en un 150% en solo 3 meses."
              </p>
              <p className="text-viralOrange font-semibold">
                - María González, CEO de MarketingPro
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-viralDark border-t border-gray-800 py-4 text-center text-white/50">
        <div className="container mx-auto px-6">
          © 2025 ViralClicker. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Webinar;
