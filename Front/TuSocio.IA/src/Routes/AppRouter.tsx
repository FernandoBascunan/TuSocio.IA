
import React from 'react';
import { IonReactRouter } from '@ionic/react-router';
import { Route,Redirect } from 'react-router';
import iniciarsesion from '../pages/InicioSesion/InicioSesion';
import Registro from '../pages/Registro/Registro'
import Perfil from '../pages/Perfil/Perfil';
import Inventario from '../pages/Inventario/Inventario';
import Producto from '../pages/Producto/Producto';
import addProducto from '../pages/addProducto/addProducto';

const AppRouter:React.FC =()=>{
    return (
        <IonReactRouter>
              <Route path='/'> <Redirect to="/Login" /></Route>
              <Route path="/Login" component={iniciarsesion} exact={true} />
              <Route path='/Register' component={Registro} exact={true}/>
              <Route path="/Profile" component={Perfil} exact={true} />
              <Route path="/Inventario" component={Inventario} exact={true} />
              <Route path="/producto/:id" component={Producto} exact />
              <Route path="/addProducto" component={addProducto} exact={true} />
        </IonReactRouter>
    )
}

export default AppRouter
