
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
  
  // Tracking checkpoints for the video (percentages)
  const checkpoints = [25, 50, 75];
  const [checkpointsReached, setCheckpointsReached] = useState<number[]>([]);
  
  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('viralclicker_user');
    return userData ? JSON.parse(userData) : null;
  };
  
  // Track when user arrives at the webinar page
  useEffect(() => {
    const userData = getUserData();
    
    if (userData) {
      // Update user stage
      const updatedUserData = {
        ...userData,
        lastStage: 'llegada_webinar',
        webinarVisitTime: new Date().toISOString()
      };
      
      localStorage.setItem('viralclicker_user', JSON.stringify(updatedUserData));
      
      // Send notification email that user arrived at the webinar page
      sendTrackingEmail({
        ...updatedUserData,
        action: 'webinar_visit',
        timestamp: new Date().toISOString(),
        estado: 'Llegada al Webinar - Usuario ha accedido a la página del webinar',
        detalles: 'El usuario ha visitado la página del webinar pero aún no ha iniciado el video'
      });
    }
    
    // Set up listener for when user leaves the page
    const handleBeforeUnload = () => {
      const userData = getUserData();
      if (userData && !userData.webinarCompleted && videoStarted) {
        // Get current video progress
        const currentTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
        const duration = videoRef.current ? Math.floor(videoRef.current.duration || 0) : 0;
        const progressPercent = duration > 0 ? Math.floor((currentTime / duration) * 100) : 0;
        
        // Update local storage to track that user did not complete the webinar
        const updatedUserData = {
          ...userData,
          webinarLeft: new Date().toISOString(),
          webinarCompleted: false,
          videoProgress: currentTime,
          videoDuration: duration,
          videoProgressPercent: progressPercent,
          lastStage: 'abandono_webinar'
        };
        
        localStorage.setItem('viralclicker_user', JSON.stringify(updatedUserData));
        
        // Use sendBeacon API to send data when page is closing
        const formData = new FormData();
        
        // Add data to FormData
        formData.append('name', userData.fullName || '');
        formData.append('email', userData.email || '');
        formData.append('phone', userData.phone || '');
        formData.append('_subject', 'Cliente ha Abandonado el Webinar - ViralClicker');
        formData.append('estado', `Abandono del Webinar - Progreso: ${progressPercent}%`);
        formData.append('detalles', `El usuario vio ${currentTime} segundos de ${duration} segundos totales (${progressPercent}%)`);
        formData.append('fecha_abandono', new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }));
        formData.append('checkpoints_alcanzados', checkpointsReached.join(', '));
        
        // Send data using navigator.sendBeacon
        navigator.sendBeacon('https://formspree.io/f/xwpoboln', formData);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [videoStarted, checkpointsReached]);

  // Track video completion
  useEffect(() => {
    if (videoEnded) {
      // Mark webinar as completed in localStorage
      const userData = getUserData();
      if (userData) {
        const updatedUserData = {
          ...userData,
          webinarCompleted: true,
          completionDate: new Date().toISOString(),
          lastStage: 'webinar_completado'
        };
        
        localStorage.setItem('viralclicker_user', JSON.stringify(updatedUserData));
        
        // Send completion notification
        sendTrackingEmail({
          ...updatedUserData,
          action: 'webinar_completed',
          timestamp: new Date().toISOString(),
          estado: 'Webinar Completado - Usuario ha visto el webinar completo',
          detalles: 'El usuario ha finalizado la visualización completa del video del webinar',
          checkpoints_alcanzados: checkpointsReached.join(', '),
          fecha_completado: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
        });
      }
    }
  }, [videoEnded, checkpointsReached]);

  const sendTrackingEmail = async (data: any) => {
    try {
      const response = await fetch('https://formspree.io/f/xwpoboln', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.fullName,
          phone: data.phone,
          email: data.email,
          _subject: `ViralClicker - ${data.estado || data.action}`,
          estado: data.estado,
          detalles: data.detalles,
          fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
          accion: data.action,
          progreso_video: data.videoProgressPercent ? `${data.videoProgressPercent}%` : 'No iniciado',
          checkpoints_alcanzados: data.checkpoints_alcanzados || 'Ninguno'
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
        const updatedUserData = {
          ...userData,
          videoStarted: true,
          videoStartTime: new Date().toISOString(),
          lastStage: 'inicio_video'
        };
        
        localStorage.setItem('viralclicker_user', JSON.stringify(updatedUserData));
        
        sendTrackingEmail({
          ...updatedUserData,
          action: 'video_started',
          timestamp: new Date().toISOString(),
          estado: 'Inicio de Video - Usuario ha comenzado a ver el webinar',
          detalles: 'El usuario ha hecho clic en reproducir y ha comenzado a ver el video'
        });
      }
    }
  };

  const handleContactClick = () => {
    const userData = getUserData();
    
    if (userData) {
      const updatedUserData = {
        ...userData,
        contactRequested: true,
        contactRequestTime: new Date().toISOString(),
        lastStage: 'solicitud_contacto'
      };
      
      localStorage.setItem('viralclicker_user', JSON.stringify(updatedUserData));
      
      sendTrackingEmail({
        ...updatedUserData,
        action: 'contact_requested',
        timestamp: new Date().toISOString(),
        estado: 'Solicitud de Contacto - Usuario ha solicitado ser contactado',
        detalles: 'El usuario ha completado el webinar y ha solicitado ser contactado por el equipo de ventas'
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
      const duration = Math.floor(videoRef.current.duration || 0);
      
      if (duration > 0) {
        const progressPercent = Math.floor((currentTime / duration) * 100);
        
        // Check if we've hit any checkpoints
        checkpoints.forEach(checkpoint => {
          if (progressPercent >= checkpoint && !checkpointsReached.includes(checkpoint)) {
            // Add this checkpoint to our reached checkpoints
            setCheckpointsReached(prev => {
              const newCheckpoints = [...prev, checkpoint].sort((a, b) => a - b);
              
              // Send checkpoint notification
              const userData = getUserData();
              if (userData) {
                const updatedUserData = {
                  ...userData,
                  lastCheckpoint: checkpoint,
                  videoProgress: currentTime,
                  videoDuration: duration,
                  videoProgressPercent: progressPercent,
                  lastStage: `checkpoint_${checkpoint}`
                };
                
                localStorage.setItem('viralclicker_user', JSON.stringify(updatedUserData));
                
                sendTrackingEmail({
                  ...updatedUserData,
                  action: `video_progress_${checkpoint}`,
                  timestamp: new Date().toISOString(),
                  estado: `Progreso del Video: ${checkpoint}% - Usuario continúa viendo el webinar`,
                  detalles: `El usuario ha alcanzado el ${checkpoint}% del webinar (${currentTime} segundos de ${duration} segundos)`,
                  videoProgress: currentTime,
                  videoDuration: duration,
                  videoProgressPercent: progressPercent,
                  checkpoints_alcanzados: newCheckpoints.join(', ')
                });
              }
              
              return newCheckpoints;
            });
          }
        });
        
        // Also update localStorage with the current progress
        const userData = getUserData();
        if (userData && currentTime % 30 === 0) {  // Update every 30 seconds
          const updatedUserData = {
            ...userData,
            videoProgress: currentTime,
            videoDuration: duration,
            videoProgressPercent: progressPercent
          };
          
          localStorage.setItem('viralclicker_user', JSON.stringify(updatedUserData));
        }
      }
    }
  };

  // Use a simulated video ending for testing or short videos
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (videoStarted && videoRef.current) {
      videoRef.current.addEventListener('ended', () => {
        setVideoEnded(true);
      });
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('ended', () => setVideoEnded(true));
      }
      clearTimeout(timer);
    };
  }, [videoStarted]);

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
