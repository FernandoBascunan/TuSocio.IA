import React, { useState, useEffect } from 'react';
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
  IonItem,
  IonSpinner,
  IonTitle,
  IonInput
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import './Producto.css';

type Producto = {
  idProducto: number;
  nombreProducto: string;
  valorNeto: number;
  tipoProducto: string;
  unidadMedida: string;
  fechaIngreso: string;
  fechaCaducidad: string;
};

const Producto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const history = useHistory();

  useEffect(() => {
    fetch(`http://localhost:3001/api/productos/${id}`)
      .then(res => res.json())
      .then(data => {
        setProducto(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (field: keyof Producto, value: string) => {
    if (producto) {
      setProducto({ ...producto, [field]: value });
    }
  };

  const handleSave = () => {
    fetch(`http://localhost:3001/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valorNeto: producto?.valorNeto,
        tipoProducto: producto?.tipoProducto,
        unidadMedida: producto?.unidadMedida,
        fechaIngreso: producto?.fechaIngreso,
        fechaCaducidad: producto?.fechaCaducidad
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setEditMode(false);
      })
      .catch(err => console.error(err));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton className='nav-button2' onClick={() => history.push('/Profile')} disabled={loading}>Perfil</IonButton>
          <IonButton className='nav-button' onClick={() => history.push('/Inventario')} disabled={loading}>Inventario</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <IonSpinner name="crescent" />
        ) : producto ? (
          <IonCard>
            <IonCardContent>
              <IonTitle color="primary">{producto.nombreProducto}</IonTitle>

              <IonItem>
                <IonLabel position="stacked">Tipo de Producto</IonLabel>
                <IonInput
                  disabled={!editMode}
                  value={producto.tipoProducto}
                  onIonChange={(e) => handleChange('tipoProducto', e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Valor Neto</IonLabel>
                <IonInput
                  type="number"
                  disabled={!editMode}
                  value={producto.valorNeto}
                  onIonChange={(e) => handleChange('valorNeto', e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Unidad de Medida</IonLabel>
                <IonInput
                  disabled={!editMode}
                  value={producto.unidadMedida}
                  onIonChange={(e) => handleChange('unidadMedida', e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Fecha de Ingreso</IonLabel>
                <IonInput
                  type="date"
                  disabled={!editMode}
                  value={producto.fechaIngreso.slice(0, 10)}
                  onIonChange={(e) => handleChange('fechaIngreso', e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Fecha de Caducidad</IonLabel>
                <IonInput
                  type="date"
                  disabled={!editMode}
                  value={producto.fechaCaducidad.slice(0, 10)}
                  onIonChange={(e) => handleChange('fechaCaducidad', e.detail.value!)}
                />
              </IonItem>

              <IonButton expand="block" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancelar' : 'Modificar'}
              </IonButton>

              {editMode && (
                <IonButton expand="block" color="success" onClick={handleSave}>
                  Guardar Cambios
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>
        ) : (
          <IonText color="danger">Producto no encontrado.</IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Producto;