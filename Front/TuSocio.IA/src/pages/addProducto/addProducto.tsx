import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonItem, IonLabel, IonButton, IonDatetime
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

const AddProducto: React.FC = () => {
  const [producto, setProducto] = useState({
  idProducto: 0,
  nombreProducto: '',
  valorNeto: 0,
  tipoProducto: '',
  unidadMedida: 0,
  fechaIngreso: '',
  fechaCaducidad: ''
});

  const history = useHistory();


  const handleChange = (key: string, value: string) => {
    setProducto(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No hay sesión activa');
    return;
  }

  try {
    const res = await fetch('http://localhost:3001/api/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(producto),
    });

    if (!res.ok) throw new Error('Error al agregar producto');

    alert('Producto agregado con éxito');
    history.push('/Inventario');
  } catch (error) {
    console.error(error);
    alert('Hubo un error al agregar el producto');
  }
};


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Agregar Producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="contentAdd">

        <IonItem className="center">
          <IonLabel position="stacked">ID Producto</IonLabel>
          <IonInput
            type="number"
            value={producto.idProducto}
            onIonChange={e => handleChange('idProducto', e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Nombre</IonLabel>
          <IonInput
            value={producto.nombreProducto}
            onIonChange={e => handleChange('nombreProducto', e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Valor Neto</IonLabel>
          <IonInput
            type="number"
            value={producto.valorNeto}
            onIonChange={e => handleChange('valorNeto', e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Tipo de Producto</IonLabel>
          <IonInput
            value={producto.tipoProducto}
            onIonChange={e => handleChange('tipoProducto', e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Unidad de Medida</IonLabel>
          <IonInput
            type="number"
            value={producto.unidadMedida}
            onIonChange={e => handleChange('unidadMedida', e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fecha de Ingreso</IonLabel>
          <IonDatetime
            value={producto.fechaIngreso}
            onIonChange={e => handleChange('fechaIngreso', String(e.detail.value ?? ''))}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fecha de Caducidad</IonLabel>
          <IonDatetime
            value={producto.fechaCaducidad}
            onIonChange={e => handleChange('fechaCaducidad', String(e.detail.value ?? ''))}
          />
        </IonItem>

        <IonButton expand="block" onClick={() => history.push('/Inventario')}>
          Volver
        </IonButton>
        <IonButton expand="block" onClick={handleSubmit}>
          Guardar Producto
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AddProducto;
