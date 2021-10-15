import '../App.css';
import React from 'react';  
import {Link} from 'react-router-dom';
import { MDBIcon} from "mdbreact";
import Axios from 'axios'; 
import {useHistory} from 'react-router-dom';

function NavBar(){
    //to work with express session and axios with need to do this
    Axios.defaults.withCredentials = true; 
    let history = useHistory();

    const logout = () => {
      localStorage.clear();
      history.push('/login');
        
    }
    return(
        <div className = "navBar">
            <div className= "leftSide">
                <div className = "links">
                    <Link to = "/"><MDBIcon icon="home" /> Home</Link>
                    <Link to = "/profile"><MDBIcon far icon="user" /> Profile</Link>
                    <Link to = "/password"><MDBIcon icon="key" />Change Password</Link>
                    <Link to = "#" onClick = {logout}><MDBIcon icon="sign-out-alt" />Logout</Link>
                </div>
            </div>
        </div>
    );
    
}

export default NavBar;