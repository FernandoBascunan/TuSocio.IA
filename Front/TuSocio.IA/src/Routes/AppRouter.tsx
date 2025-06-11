
import React from 'react';
import { IonReactRouter } from '@ionic/react-router';
import { Route,Redirect } from 'react-router';
import iniciarsesion from '../pages/InicioSesion/InicioSesion';
import Registro from '../pages/Registro/Registro'
import Perfil from '../pages/Perfil/Perfil';
import Inventario from '../pages/Inventario/Inventario';
import Producto from '../pages/Producto/Producto';
import addProducto from '../pages/addProducto/addProducto';
import RecuperarPassword from '../pages/RecuperarPassword/RecuperarPassword';
import ResetPassword from '../pages/RecuperarPassword/ResetPassword';
const AppRouter:React.FC =()=>{
    return (
            <IonReactRouter>
            <Route exact path="/">
                <Redirect to="/Login" />
            </Route>
            <Route path="/Login" component={iniciarsesion} exact />
            <Route path="/Register" component={Registro} exact />
            <Route path="/Profile" component={Perfil} exact />
            <Route path="/Inventario" component={Inventario} exact />
            <Route path="/producto/:id" component={Producto} exact />
            <Route path="/addProducto" component={addProducto} exact />
            <Route path="/recuperar-password" component={RecuperarPassword} exact />
            <Route path="/reset-password/:token" component={ResetPassword} exact />
            </IonReactRouter>
    )
}

export default AppRouter
