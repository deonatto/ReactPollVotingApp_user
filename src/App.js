import './App.css';
import Login from './pages/login';
import Home from './pages/home';
import Profile from './pages/profile';
import Password from './pages/password';
import Results from './pages/results';
import Vote from './pages/vote';
import { BrowserRouter as Router, Route, Switch,Redirect} from 'react-router-dom';


function App() {
  return(
    <Router>
      <Switch>
        <Route exact path="/login" component = {Login}></Route>
        <Route exact path="/" component = {Home}></Route>
        <Route exact path="/profile" component = {Profile}></Route>
        <Route exact path="/password" component = {Password}></Route>
        <Route exact path="/results/:id" component = {Results}></Route>
        <Route exact path="/vote/:id" component = {Vote}></Route>

      </Switch>
    </Router>

  );
  
 
}

export default App;
