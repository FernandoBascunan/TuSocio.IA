import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
  IonIcon,
  IonInput,
  IonToast,
} from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Perfil.css';

interface UserData {
  id: string;
  direccion: string;
  tipoPyme: string;
  registro: string;
  fono: string;
  nombre: string;
  apellido: string;
  correo: string;
}

const PerfilPage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const history = useHistory();

  function decodeJWT(token: string): UserData | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) throw new Error("Token inválido");
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const jsonPayload = atob(padded);
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decodificando JWT:', e);
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      history.push('/Login');
      return;
    }

    try {
      const userData = decodeJWT(token);
      setUserData(userData);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      history.push('/Login');
    }
  }, [history]);

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (userData) {
      setUserData({ ...userData, [field]: value });
    }
  };

  const handleGuardar = async () => {
    if (!userData) return;

    try {
      const response = await fetch('http://localhost:3001/api/usuario/modificar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (response.ok) {
        setShowToast(true);
        setEditMode(false);
      } else {
        alert(result.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    history.push('/Login');
  };

  const titulos: Record<number, string> = {
    1: "Ventas Mensuales",
    2: "Reporte de Stock",
    3: "Estado de Resultados",
    4: "Proyeccion de demanda"
  };
  const descripciones: Record<number, string> = {
    1: "Reporte que muestra el total de ventas realizadas durante cada mes, permitiendo analizar el comportamiento de ingresos a lo largo del tiempo, identificar tendencias y tomar decisiones informadas para optimizar la estrategia comercial.",
    2: "Reporte que detalla el estado actual del inventario, incluyendo cantidades disponibles, productos más vendidos y aquellos con menor rotación, facilitando la gestión eficiente del stock.",
    3: "Reporte financiero que resume los ingresos y gastos de la empresa, proporcionando una visión clara de la rentabilidad y sostenibilidad del negocio.",
    4: "Reporte que estima cuánto se espera vender de un producto o servicio en un período futuro."
  };

  const handleDownloadReport = async (tipoReporte: number) => {
    setLoadingReport(true);
    try {
      const response = await fetch(`http://localhost:3001/api/reportes/${tipoReporte}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Error al descargar reporte');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${tipoReporte}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Error al descargar reporte');
    } finally {
      setLoadingReport(false);
    }
  };

  if (!userData) return null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton className='nav-button' onClick={() => history.push('/Profile')}>Inicio</IonButton>
          <IonButton className='nav-button' onClick={() => history.push('/Inventario')}>Inventario</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonGrid >
          <IonRow>
            {/* Columna izquierda con datos del usuario */}
            <IonCol size="12" sizeMd="4" className="sidebar" style={{ paddingRight: '20px' }}>
              <IonAvatar className='avatar' style={{ marginBottom: '20px' }}>
                <IonIcon icon={personCircleOutline} />
              </IonAvatar>

              <div className="user-info" style={{ marginBottom: '20px' }}>
                <strong>{userData.tipoPyme}</strong><br />
                <small>ID: {userData.id}</small>
              </div>

              {/* Datos estáticos o editables */}
              {editMode ? (
                <>
                  {[
                    { label: 'Correo', key: 'correo' },
                    { label: 'Dirección', key: 'direccion' },
                    { label: 'Fono', key: 'fono' },
                    { label: 'Nombre', key: 'nombre' },
                    { label: 'Apellido', key: 'apellido' },
                  ].map(({ label, key }) => (
                    <div key={key} style={{ marginBottom: '10px' }}>
                      <label style={{ fontWeight: 'bold' }}>{label}:</label><br />
                      <IonInput className='reInput'
                        value={userData[key as keyof UserData]}
                        onIonChange={(e) => handleInputChange(key as keyof UserData, e.detail.value!)}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: 'Correo', key: 'correo' },
                    { label: 'Dirección', key: 'direccion' },
                    { label: 'Fono', key: 'fono' },
                    { label: 'Nombre', key: 'nombre' },
                    { label: 'Apellido', key: 'apellido' },
                  ].map(({ label, key }) => (
                    <div key={key} style={{ marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold'}}>{label}: </span>
                      <span>{userData[key as keyof UserData]}</span>
                    </div>
                  ))}
                </>
              )}

              {!editMode ? (
                <IonButton expand="block" onClick={() => setEditMode(true)} style={{ marginTop: '20px' }}>
                  Gestion de cuenta
                </IonButton>
              ) : (
                <>
                  <IonButton expand="block" onClick={handleGuardar} style={{ marginTop: '20px' }}>
                    Guardar Cambios
                  </IonButton>
                  <IonButton onClick={() => setEditMode(false)}>
                    Cancelar
                  </IonButton>
                </>
              )}

              <IonButton onClick={handleCerrarSesion}>
                Cerrar Sesión
              </IonButton>
            </IonCol>

            {/* Columna derecha solo con reportes */}
            <IonCol >
              <IonRow>
                {Object.entries(titulos).map(([key, titulo]) => (
                  <IonCol size="12" sizeMd="6" key={key} className="textCenter" style={{ marginBottom: '20px' }}>
                    <h4>{titulo}</h4>
                    <IonButton className="reportButton"
                      expand="block"
                      disabled={loadingReport}
                      onClick={() => handleDownloadReport(Number(key))}
                    >
                      {loadingReport ? 'Descargando...' : 'Descargar'}
                    </IonButton>
                    {Object.entries(descripciones).map(([descKey, descripcion]) => (
                      Number(descKey) === Number(key) && (
                        <p key={descKey} style={{ marginTop: '10px' }}>{descripcion}</p>
                      )
                    ))}
                  </IonCol>
                ))}
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Datos actualizados con éxito"
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default PerfilPage;
