import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonItem, IonLabel, IonToast, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import './RecuperarPassword.css'; 

const RecuperarPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleRecuperar = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setToastMessage('Ingrese un correo válido');
      setShowToast(true);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      setToastMessage(data.message || 'Revisa tu correo electrónico');
      setShowToast(true);
    } catch  {
      setToastMessage('Error al solicitar recuperación');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Recuperar Contraseña</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Correo registrado</IonLabel>
          <IonInput value={email} onIonChange={(e) => setEmail(e.detail.value!)} />
        </IonItem>
        <IonButton expand="block" onClick={handleRecuperar}>Enviar</IonButton>

        <IonToast
          isOpen={showToast}
          message={toastMessage}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default RecuperarPassword;
