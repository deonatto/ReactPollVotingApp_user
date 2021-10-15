import '../App.css';
import React, {useEffect, useState} from 'react'; 
import Axios from 'axios'; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import { MDBDataTable} from 'mdbreact';
import { useParams, useHistory} from 'react-router-dom';
import NavBar from './navBar';


const Results = () =>{
    const params = useParams()
    const[pollList,setPollList] = useState("");
    let history = useHistory(); 
    
    // useEffect to get poll options
    useEffect(()=>{
      async function getResults(){
        try{
          
          const id = params.id;
          const response = await Axios.post("http://localhost:5000/results",{
            id: id
          },{
            headers:{"x-access-token": localStorage.getItem("user")}
          });
          if(!response.data.auth){
            history.push('/login');
          }else{
            setPollList(response.data.list.map(col =>{
              return {
                  name: col.poll_name,
                  votes: col.votes
              }
            }));
          }
              
          
        }catch(error) {
          if (error.response) {
            if(error.response.status === 401){
                history.push('/login');
                
            }else{
                console.log(error.response)
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
        }

      }
      getResults();
        
    },[]);



  const data = {
    columns: [
      {
        label: 'Name',
        field: 'name',
        sort: 'asc'
      },
      {
        label: 'Votes',
        field: 'votes',
        sort: 'asc'
      }
    ],
    rows: pollList
  };

  return (
      <div className = "main-home-container">
          <NavBar/>
          <div className = "results-table">
            <MDBDataTable
                striped
                bordered
                hover
                data={data}
            />
          </div>
      </div>
  );
}

export default Results;