import { useEffect } from 'react';
import supabase from '../model/supabase';

const LimpiarToken = () => {
  const limpiarTokensExpirados = async () => {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('usuarios')
        .update({
          recoveryToken: null,
          expRecuperacion: null
        })
        .lt('expRecuperacion', now);

      if (error) {
        console.error('Error al limpiar tokens:', error);
      }
  };

  useEffect(() => {
    limpiarTokensExpirados();
    const interval = setInterval(() => {
      limpiarTokensExpirados();
    }, 1800000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default LimpiarToken;
