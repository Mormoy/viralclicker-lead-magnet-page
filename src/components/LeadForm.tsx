
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Logo from './Logo';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
}

const LeadForm = ({ isOpen, onClose, onSubmit }: LeadFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'El nombre es requerido';
    
    // Validación actualizada para aceptar números internacionales con +
    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de WhatsApp es requerido';
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Número de WhatsApp inválido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendFormDataByEmail = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Construct email data with formspree.io
      const response = await fetch('https://formspree.io/f/info@viralclicker.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          subject: 'Nuevo Lead de ViralClicker',
          _replyto: data.email,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar el formulario');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending form data:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const emailSent = await sendFormDataByEmail(formData);
      
      if (emailSent) {
        // Store user data in localStorage for tracking webinar completion
        localStorage.setItem('viralclicker_user', JSON.stringify({
          ...formData,
          registrationDate: new Date().toISOString(),
          webinarCompleted: false
        }));
        
        onSubmit(formData);
        
        toast({
          title: "¡Formulario enviado con éxito!",
          description: "Te redirigiremos a nuestro webinar.",
        });
      } else {
        toast({
          title: "Error al enviar el formulario",
          description: "Por favor, inténtalo de nuevo más tarde.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-viralDark border border-viralOrange max-w-md w-full">
        <div className="flex flex-col items-center space-y-6 py-4">
          <Logo className="text-3xl" />
          
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">
            ¡Completa tus datos para acceder al webinar!
          </h2>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Tu nombre completo"
                value={formData.fullName}
                onChange={handleChange}
                className="bg-white/10 border-viralOrange/50 text-white"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Número de WhatsApp</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+34 612 345 678"
                value={formData.phone}
                onChange={handleChange}
                className="bg-white/10 border-viralOrange/50 text-white"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                className="bg-white/10 border-viralOrange/50 text-white"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-viralOrange hover:bg-viralOrange/90 text-white font-bold py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Acceder ahora"}
            </Button>
            
            <p className="text-white/70 text-xs text-center mt-4">
              Al enviar este formulario, aceptas nuestros términos y condiciones y política de privacidad.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadForm;
