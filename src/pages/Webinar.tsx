
import React, { useState, useRef, useEffect } from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { CirclePlay, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';

const Webinar = () => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('viralclicker_user');
    return userData ? JSON.parse(userData) : null;
  };
  
  // Track when user arrives at the webinar page
  useEffect(() => {
    const userData = getUserData();
    
    if (userData) {
      // Send notification email that user arrived at the webinar page
      sendTrackingEmail({
        ...userData,
        action: 'webinar_visit',
        timestamp: new Date().toISOString()
      });
    }
    
    // Set up listener for when user leaves the page
    const handleBeforeUnload = () => {
      const userData = getUserData();
      if (userData && !userData.webinarCompleted && videoStarted) {
        // Update local storage to track that user did not complete the webinar
        localStorage.setItem('viralclicker_user', JSON.stringify({
          ...userData,
          webinarLeft: new Date().toISOString(),
          webinarCompleted: false,
          videoProgress: videoRef.current ? Math.floor(videoRef.current.currentTime) : 0
        }));
        
        // Note: This won't actually send an email on page close due to browser limitations
        // We'll rely on the next visit to send this data
        navigator.sendBeacon('https://formspree.io/f/info@viralclicker.com', JSON.stringify({
          ...userData,
          action: 'webinar_abandoned',
          timestamp: new Date().toISOString(),
          videoProgress: videoRef.current ? Math.floor(videoRef.current.currentTime) : 0
        }));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [videoStarted]);

  // Track video completion
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (videoStarted) {
      // In a real implementation, we would use the actual video duration
      timer = setTimeout(() => {
        setVideoEnded(true);
        
        // Mark webinar as completed in localStorage
        const userData = getUserData();
        if (userData) {
          localStorage.setItem('viralclicker_user', JSON.stringify({
            ...userData,
            webinarCompleted: true,
            completionDate: new Date().toISOString()
          }));
          
          // Send completion notification
          sendTrackingEmail({
            ...userData,
            action: 'webinar_completed',
            timestamp: new Date().toISOString()
          });
        }
      }, 15000); // 15 segundos para simular fin del video
    }
    
    return () => clearTimeout(timer);
  }, [videoStarted]);

  const sendTrackingEmail = async (data: any) => {
    try {
      const response = await fetch('https://formspree.io/f/info@viralclicker.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          subject: `ViralClicker Tracking: ${data.action}`,
          _replyto: data.email || 'noreply@viralclicker.com'
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error sending tracking data:', error);
      return false;
    }
  };

  const handlePlayVideo = () => {
    setVideoStarted(true);
    if (videoRef.current) {
      videoRef.current.play();
      
      // Track video start
      const userData = getUserData();
      if (userData) {
        sendTrackingEmail({
          ...userData,
          action: 'video_started',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  const handleContactClick = () => {
    const userData = getUserData();
    
    if (userData) {
      sendTrackingEmail({
        ...userData,
        action: 'contact_requested',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "¡Gracias por tu interés!",
        description: "Nuestro equipo te contactará pronto.",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo procesar tu solicitud. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  // Video time update handler to track progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      const duration = Math.floor(videoRef.current.duration);
      
      // Track progress at 25%, 50%, 75% points
      const progressPoints = [0.25, 0.5, 0.75];
      const currentProgress = currentTime / duration;
      
      progressPoints.forEach(point => {
        if (Math.abs(currentProgress - point) < 0.01) {
          const userData = getUserData();
          if (userData) {
            sendTrackingEmail({
              ...userData,
              action: `video_progress_${Math.floor(point * 100)}`,
              timestamp: new Date().toISOString(),
              videoProgress: currentTime,
              videoDuration: duration
            });
          }
        }
      });
    }
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
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setVideoEnded(true)}
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
                Nuestro equipo de expertos estará encantado de contactarte para brindarte una consultoría personalizada.
              </p>
              
              <Button 
                onClick={handleContactClick}
                className="bg-viralOrange hover:bg-viralOrange/90 text-white text-lg font-bold py-6 px-8 rounded-full"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contáctame
              </Button>
            </div>
          )}
          
          {/* Testimonios */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Clientes felices con nuestros servicios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonio 1 */}
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-20 h-20 mb-4 border-2 border-viralOrange">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" alt="Cliente 1" />
                      <AvatarFallback className="bg-viralOrange text-white">MC</AvatarFallback>
                    </Avatar>
                    <p className="text-white/90 text-center italic mb-4">
                      "Gracias a ViralClicker hemos aumentado nuestras conversiones en un 150% en solo 3 meses."
                    </p>
                    <p className="text-viralOrange font-semibold">
                      María Castillo, CEO de MarketingPro
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonio 2 */}
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-20 h-20 mb-4 border-2 border-viralOrange">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="Cliente 2" />
                      <AvatarFallback className="bg-viralOrange text-white">JR</AvatarFallback>
                    </Avatar>
                    <p className="text-white/90 text-center italic mb-4">
                      "La estrategia personalizada que nos brindó ViralClicker incrementó nuestras ventas en un 200% el primer año."
                    </p>
                    <p className="text-viralOrange font-semibold">
                      Javier Rodríguez, Director de TechSolutions
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonio 3 */}
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-20 h-20 mb-4 border-2 border-viralOrange">
                      <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" alt="Cliente 3" />
                      <AvatarFallback className="bg-viralOrange text-white">LM</AvatarFallback>
                    </Avatar>
                    <p className="text-white/90 text-center italic mb-4">
                      "Nunca pensé que podríamos captar tantos leads calificados. ViralClicker ha revolucionado nuestra forma de hacer marketing."
                    </p>
                    <p className="text-viralOrange font-semibold">
                      Laura Méndez, Fundadora de InnovaShop
                    </p>
                  </div>
                </CardContent>
              </Card>
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
