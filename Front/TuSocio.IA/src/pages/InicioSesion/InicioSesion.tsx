import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonInput, 
  IonButton, 
  IonItem, 
  IonLabel, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonLoading, 
  useIonToast 
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './InicioSesion.css';

const IniciarSesion: React.FC = () => {
  const [rutOrEmail, setRutOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  // Validar si es Rut chileno válido
  const validateRut = (rut: string) => {
    const re = /^\d{7,8}-[0-9kK]$/;
    return re.test(rut.trim());
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const isEmail = (input: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmail(rutOrEmail) && !validateRut(rutOrEmail)) {
      present({
        message: 'El formato ingresado es incorrecto. Por favor ingrese un RUT válido.',
        duration: 3000,
        color: 'danger'
      });
      return;
    }

    if (!validatePassword(password)) {
      present({
        message: 'La contraseña es incorrecta. Por favor intente de nuevo.',
        duration: 3000,
        color: 'danger'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: rutOrEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }

      localStorage.setItem('token', data.token);

      present({
        message: '¡Bienvenido!',
        duration: 2000,
        color: 'success'
      });

      history.push('/Profile');

    } catch (error) {
      present({
        message: error instanceof Error ? error.message : 'Error de conexión',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>TuSocio.IA</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="form-container">
          <div className="form-content">
            <h1>Bienvenido!!</h1>

            <IonItem>
              <IonLabel position="floating">Rut de Pyme o Correo</IonLabel>
              <IonInput 
                value={rutOrEmail} 
                onIonChange={(e) => setRutOrEmail(e.detail.value!)}
                required 
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Contraseña</IonLabel>
              <IonInput 
                type="password" 
                value={password} 
                onIonChange={(e) => setPassword(e.detail.value!)}
                required
              />
            </IonItem>

            <a href="#" onClick={(e) => { 
              e.preventDefault(); 
              history.push('/recuperar-password');
            }}>
              ¿Olvidaste tu contraseña?
            </a>

            <IonButton expand="block" onClick={handleLogin} disabled={loading}>
              Iniciar Sesión
            </IonButton>

            <IonButton expand="block" onClick={() => history.push('/Register')}>
              Registrarme
            </IonButton>
          </div>
        </div>

        <IonLoading
          isOpen={loading}
          message={'Iniciando sesión...'}
          spinner="circles"
        />
      </IonContent>
    </IonPage>
  );
};

export default IniciarSesion;
