
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Logo from '@/components/Logo';
import CountdownTimer from '@/components/CountdownTimer';
import LeadForm from '@/components/LeadForm';

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleFormSubmit = (formData: any) => {
    // En una aplicación real, aquí enviarías los datos a tu backend
    console.log('Form data submitted:', formData);
    
    // Cerrar el formulario
    setIsFormOpen(false);
    
    // Redireccionar al webinar
    navigate('/webinar');
  };

  return (
    <div className="flex flex-col min-h-screen bg-viralDark">
      {/* Header */}
      <header className="py-4 px-6 flex justify-center md:justify-start">
        <div className="container">
          <Logo />
        </div>
      </header>

      {/* Contador */}
      <CountdownTimer />

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-6 py-12 md:py-20 flex flex-col">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-white">Capte más </span>
            <span className="text-viralOrange">leads calificados</span>
            <span className="text-white"> y </span>
            <br className="hidden md:block" />
            <span className="text-white">aumente sus ventas</span>
          </h1>
          
          <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto">
            Optimizamos su presencia digital para conectar con clientes potenciales y convertir visitas en ventas.
          </p>
          
          <Button 
            onClick={handleOpenForm}
            className="bg-viralOrange hover:bg-viralOrange/90 text-white text-lg md:text-xl font-bold py-6 px-8 rounded-full animate-pulse-soft"
          >
            ¡Quiero aumentar mis ventas!
          </Button>
          
          <p className="text-white/70 text-lg md:text-xl mt-8">
            Más de 500 empresas confían en nosotros
          </p>
          
          {/* Imagen 16:9 del webinar */}
          <div className="mt-6 w-full aspect-video rounded-lg overflow-hidden">
            <img 
              src="/lovable-uploads/fdafc651-14c1-4db1-8d9d-a4a0171a29b6.png" 
              alt="Webinar ViralClicker" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Formulario Modal */}
        <LeadForm 
          isOpen={isFormOpen} 
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
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

export default Index;
