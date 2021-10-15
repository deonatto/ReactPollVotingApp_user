import React from 'react';
import {Route, Redirect} from 'react-router-dom';



function ProtectedRoute({hasAuth: hasAuth, component: Component, ...rest}) {


    return <Route {...rest} render = {(props)=>{
        if(hasAuth){
            return <Component />;
        }else{
            return (
                <Redirect to = {{pathname:'/login', state: {from: props.location} }} />
            );
        }
    }}/>;

}

export default ProtectedRoute;