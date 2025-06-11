import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonLabel,
  IonSearchbar,
  IonText,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonInput
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Inventario.css';

const Inventario: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{from: 'user' | 'ia'; text: string}[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const history = useHistory();
  const chatEndRef = useRef<HTMLDivElement>(null);
const generarPrediccion = async () => {
  console.log('Clic detectado');
  const res = await fetch('http://localhost:3001/api/prediccion');
  console.log('Respuesta recibida', res.status);
};
  type Producto = {
  idProducto: number;
  nombreProducto: string;
  tipoProducto: string;
  valorNeto: number;
  unidadMedida: string;
  fechaIngreso: string;
  fechaCaducidad: string;
};
useEffect(() => {
  fetch('http://localhost:3001/api/productos')
    .then(res => res.json())
    .then(setProductos)
    .catch(err => console.error(err));
}, []);

const eliminarProducto = async (id: number) => {
  if (!window.confirm('¿Eliminar este producto?')) return;
  await fetch(`http://localhost:3001/api/productos/${id}`, { method: 'DELETE' });
  setProductos(prev => prev.filter(p => p.idProducto !== id));
};
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const enviarPregunta = async () => {
    if (!input.trim()) return;
    setLoading(true);

    setChat(prev => [...prev, { from: 'user', text: input }]);
    setInput('');

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const respuesta = data.respuesta || 'Sin respuesta.';

      setChat(prev => [...prev, { from: 'ia', text: respuesta }]);
    } catch {
      setChat(prev => [...prev, { from: 'ia', text: 'Error al contactar con la IA.' }]);
    } finally {
      setLoading(false);
    }
  };

  const irAProducto = (id: number) => {
    history.push(`/producto/${id}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar >
          <IonButton className="nav-button2" onClick={() => history.push('/Profile')} disabled={loading}>Perfil</IonButton>
          <IonButton className="nav-button" onClick={() => history.push('/Inventario')} disabled={loading}>Inventario</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonGrid className='colorWhite'>
          <IonRow>
            <IonCol sizeMd="3" size="12" className='AAA'>
                <IonButton expand="block" onClick={generarPrediccion}>
                  Generar Predicción de Demanda
                </IonButton>
              <IonLabel className="ia-chat-card">
                <IonButton  className="addProducto" onClick={() => history.push('/addProducto')}>Agregar Producto</IonButton>
                
                <strong>IA Chat</strong>

                <div className="chat-area">
                  {chat.length === 0 && (
                    <IonText color="medium">Empieza la conversación escribiendo abajo...</IonText>
                  )}

                  {chat.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.from}`}>
                      <div className={`bubble ${msg.from}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  <div ref={chatEndRef} />
                </div>

                <div className="chat-input-container">
                  <IonInput
                    className="chat-input"
                    placeholder="Escribe tu pregunta..."
                    value={input}
                    onIonChange={e => setInput(e.detail.value!)}
                    disabled={loading}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !loading && input.trim()) enviarPregunta();
                    }}
                  />
                  <IonButton
                    onClick={enviarPregunta}
                    disabled={loading || !input.trim()}
                  >
                    Enviar
                  </IonButton>
                </div>
              </IonLabel>

              <IonCard style={{ marginTop: '12px' }}>
                <IonCardContent>
                  <IonLabel><strong>Filtros</strong></IonLabel>
                  <IonSearchbar placeholder="Buscar..." />

                  <IonItem>
                    <IonLabel>Rango de precios</IonLabel>
                    <IonSelect>
                      <IonSelectOption value="1">$0 - $100</IonSelectOption>
                      <IonSelectOption value="2">$100 - $500</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel>Tipo de producto</IonLabel>
                    <IonSelect>
                      <IonSelectOption value="1">Electrónico</IonSelectOption>
                      <IonSelectOption value="2">Alimento</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel>Stock</IonLabel>
                    <IonSelect>
                      <IonSelectOption value="1">Disponible</IonSelectOption>
                      <IonSelectOption value="2">Agotado</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol sizeMd="9" size="12">
              {productos.map(producto => (
                  <IonCard key={producto.idProducto} className='card'>
                    <IonCardContent>
                      <IonRow className="ion-align-items-center">
                        <IonCol size="8">
                          <IonText><strong>{producto.nombreProducto}</strong></IonText>
                          <p>Tipo: {producto.tipoProducto}</p>
                          <p>Valor: ${producto.valorNeto}</p>
                        </IonCol>
                        <IonCol size="4" className="ion-text-end">
                          <IonButton onClick={() => irAProducto(producto.idProducto)}>Ver</IonButton>
                          <IonButton color="danger" onClick={() => eliminarProducto(producto.idProducto)}>Eliminar</IonButton>
                        </IonCol>
                      </IonRow>
                    </IonCardContent>
                  </IonCard>
                ))}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Inventario;
