import axios from 'axios';
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
  IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

import './Registro.css';



const Registro: React.FC = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [rut, setRut] = useState('');
  const [registro, setRegistro] = useState('');
  const [tipoPyme, setTipoPyme] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const history = useHistory();


  const validateRut = (rut: string) => /^[0-9]{7,8}-[0-9Kk]{1}$/.test(rut);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?56?\s?[2-9]\d{8}$/.test(phone);
  const validatePassword = (password: string) => password.length >= 8;

  const handleRegistro = async () => {

    
    const newErrors: { [key: string]: string } = {};
    if (!firstname) newErrors.firstname = 'El nombre del usuario es requerido.';
    if (!lastname) newErrors.lastname = 'El apellido del usuario es requerido.';
    if (!direccion) newErrors.direccion = 'La Dirección de la empresa es requerida.';
    if (!tipoPyme) newErrors.tipoPyme = 'El tipo de Pyme es requerido.';
    if (!registro) newErrors.registro = 'El año de registro es requerido.';
    if (!validateRut(rut)) newErrors.rut = 'RUT inválido. El formato correcto es 12345678-9 o 1234567-8.';
    if (!validateEmail(email)) newErrors.email = 'Email inválido. El formato correcto es ejemplo@dominio.com.';
    if (!validatePhone(phone)) newErrors.phone = 'Número telefónico inválido.';
    if (!validatePassword(password)) newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        console.log("Enviando solicitud al servidor...");
        console.log('Valores antes de enviar:', {
        firstname,
        lastname,
        rut,
        registro,
        tipoPyme,
        direccion,
        email,
        phone,
        password,
      });
        const response = await axios.post('http://localhost:3001/api/register', {
        rut,         
        direccion,  
        tipoPyme,     
        registro,    
        phone,        
        firstname,   
        lastname,     
        email,      
        password, 
      });
        
        if (response.status === 201) {
          console.log('Registro exitoso');
          history.push('./Login');
        }
      } catch (error: unknown) {
        console.error('Error al registrar usuario:', error);
        setErrors({ general: 'Hubo un error al registrar. Inténtelo de nuevo.' });
      }
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
            <h1>Registro</h1>
            <IonItem>
              <IonLabel position="floating">Nombre del Emprendedor</IonLabel>
              <IonInput value={firstname} onIonChange={e => setFirstname(e.detail.value!)} />
            </IonItem>
            {errors.firstname && <IonText color="danger">{errors.firstname}</IonText>}
            <IonItem>
              <IonLabel position="floating">Apellido del Emprendedor</IonLabel>
              <IonInput value={lastname} onIonChange={e => setLastname(e.detail.value!)} />
            </IonItem>
            {errors.lastname && <IonText color="danger">{errors.lastname}</IonText>}
            <IonItem>
              <IonLabel position="floating">RUT Pyme</IonLabel>
              <IonInput value={rut} onIonChange={e => setRut(e.detail.value!)} />
            </IonItem>
            {errors.rut && <IonText color="danger">{errors.rut}</IonText>}
            <IonItem>
              <IonLabel position="floating">Año de Registro</IonLabel>
              <IonInput value={registro} onIonChange={e => setRegistro(e.detail.value!)} />
            </IonItem>
            {errors.registro && <IonText color="danger">{errors.registro}</IonText>}
            <IonItem>
              <IonLabel position="floating">Tipo de Pyme</IonLabel>
              <IonInput value={tipoPyme} onIonChange={e => setTipoPyme(e.detail.value!)} />
            </IonItem>
            {errors.tipoPyme && <IonText color="danger">{errors.tipoPyme}</IonText>}
            <IonItem>
              <IonLabel position="floating">Email</IonLabel>
              <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value!)} />
            </IonItem>
            {errors.email && <IonText color="danger">{errors.email}</IonText>}
            <IonItem>
              <IonLabel position="floating">Número telefónico</IonLabel>
              <IonInput type="tel" value={phone} onIonChange={e => setPhone(e.detail.value!)} />
            </IonItem>
            {errors.phone && <IonText color="danger">{errors.phone}</IonText>}
      
           <IonItem>
              <IonLabel position="floating">Dirección</IonLabel>
              <IonInput  value={direccion} onIonChange={e => setDireccion(e.detail.value!)} />
            </IonItem>
            {errors.direccion && <IonText color="danger">{errors.direccion}</IonText>}
            <IonItem>
              <IonLabel position="floating">Contraseña</IonLabel>
              <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
            </IonItem>
            {errors.password && <IonText color="danger">{errors.password}</IonText>}
            <IonItem>
              <IonLabel position="floating">Confirmar Contraseña</IonLabel>
              <IonInput type="password" value={confirmPassword} onIonChange={e => setConfirmPassword(e.detail.value!)} />
            </IonItem>
            {errors.confirmPassword && <IonText color="danger">{errors.confirmPassword}</IonText>}
           
            <IonButton expand="block" onClick={handleRegistro}>
              Registrarme
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={() => history.push('./Login')}>
              Ya tengo una cuenta
            </IonButton>
          </div>
        </div>
      </IonContent>
      
    </IonPage>
  );
};

export default Registro;