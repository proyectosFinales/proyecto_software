import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRol } from './userInfo';

const RutaProtegida = ({ element, requiredRoles }) => {
  const [acceso, setAcceso] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const id = sessionStorage.getItem('token');

  useEffect(() => {
    const getUserRol = async () => {
      try {
        const data = await getRol(id);
        
        if (requiredRoles.includes(data.rol)) {
          setAcceso(true);
        } else if (data.rol === "1") {
            navigate("/menuCoordinador");
        } else if (data.rol === "2") {
            navigate("/menuProfesor");
        } else if (data.rol === "3") {
            navigate("/menuEstudiante");
        }
      } catch (error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
  
    getUserRol();
  }, [id, navigate, requiredRoles]);
  

  if (loading) {
    return <div>Cargando...</div>;
  }

  return acceso ? element : null;
};

export default RutaProtegida;