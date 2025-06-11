import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonCard,
  IonCardContent,
  IonText,
  IonImg,
  IonButton,
  IonLabel,
  IonItem
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import './Producto.css';




const Producto: React.FC = () => {
    const { id } = useParams<{ id: string }>();
      const [loading, /*setLoading*/] = useState(false);
        const history = useHistory();
    return(
    <IonPage>
          {/* Encabezado */}
          <IonHeader>
            <IonToolbar>
                <IonButton className='nav-button2' onClick={() => history.push('/Profile')} disabled={loading}>Perfil</IonButton>
                <IonButton className='nav-button' onClick={() => history.push('/Inventario')} disabled={loading}>Inventario</IonButton>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
        <IonCard>
          <IonImg src="https://via.placeholder.com/150" alt={`Producto ${id}`} />
          <IonCardContent>
            <IonText color="primary">
              <h2>Producto {id}</h2>
            </IonText>
            <p>Fecha de último pedido: 20/05/2025</p>
            <p>Descripción: Este es un producto de ejemplo con ID {id}.</p>
            <IonItem>
              <IonLabel>Stock disponible:</IonLabel>
              <IonText>20 unidades</IonText>
            </IonItem>
            <IonItem>
              <IonLabel>Precio:</IonLabel>
              <IonText>$150.00</IonText>
            </IonItem>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Producto;