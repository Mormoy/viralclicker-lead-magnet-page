
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
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'El nombre es requerido';
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{9,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Teléfono inválido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      toast({
        title: "¡Formulario enviado con éxito!",
        description: "Te redirigiremos a nuestro webinar.",
      });
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
              <Label htmlFor="phone" className="text-white">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Tu número de teléfono"
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
            >
              Acceder ahora
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
