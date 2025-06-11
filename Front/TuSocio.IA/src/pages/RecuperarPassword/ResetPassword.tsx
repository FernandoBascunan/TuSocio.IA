import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, IonToast } from '@ionic/react';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState('');
  const history = useHistory();

  const handleSubmit = async () => {
    const regex = /^[a-zA-Z0-9]{8,12}$/;
    if (!regex.test(password)) {
      setToast('Contraseña debe tener entre 8 y 12 caracteres sin símbolos');
      return;
    }

    const res = await fetch('http://localhost:3001/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password })
    });

    const data = await res.json();
    setToast(data.message);
    if (res.ok) setTimeout(() => history.push('/'), 2000);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Nueva contraseña</IonLabel>
          <IonInput type="password" value={password} onIonChange={(e) => setPassword(e.detail.value!)} />
        </IonItem>
        <IonButton expand="block" onClick={handleSubmit}>Aceptar</IonButton>
        <IonToast isOpen={!!toast} message={toast} duration={3000} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
};

export default ResetPassword;
