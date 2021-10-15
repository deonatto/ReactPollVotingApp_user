import '../App.css';
import React, {useEffect, useState} from 'react'; 
import Axios from 'axios'; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import { Button } from 'antd';
import { MDBDataTable} from 'mdbreact';
import { useParams, useHistory } from 'react-router-dom';
import NavBar from './navBar';


const Vote = () =>{
    const params = useParams()
    const[pollList,setPollList] = useState("");
    const[status,setStatus] = useState("");
    let history = useHistory(); 

    // useEffect to get poll options
    useEffect(()=>{
      async function getOption(){
        try{
            const id = params.id;
            const response = await Axios.post("http://localhost:5000/options",{
                id: id
            },{
              headers:{"x-access-token": localStorage.getItem("user")}
            });
            if(!response.data.auth){
              history.push('/login');
            }else{
              setPollList(response.data.list.map(col =>{
                return {
                    name: col.option_name,
                    vote: <Button type="primary" onClick = {() =>vote(col.id)}>Vote</Button>
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
      getOption();
        
        
    },[]);



  async function vote (option_id){
    try{
      const id = params.id;
      const response = await Axios.post("http://localhost:5000/vote",{
          id: id,
          option_id: option_id
      },{
        headers:{"x-access-token": localStorage.getItem("user")}
      });
      if(response.data.err){
          setStatus(response.data.err);
      }else{
          setStatus(response.data.message);
      }

    }catch(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        setStatus('An error ocurred');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        setStatus('An error ocurred');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        setStatus('An error ocurred');
      }
      console.log(error.config);
    }

  }
  
  const data = {
    columns: [
      {
        label: 'Name',
        field: 'name',
        sort: 'asc'
      },
      {
        label: 'Vote',
        field: 'vote',
        sort: 'asc'
      }
    ],
    rows: pollList
  };

  return (
      <div className = "main-home-container">
          <NavBar/>
          <div className = "vote-message-container">
                <h4> {status}</h4>
          </div>  
          <div className = "votes-table">
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

export default Vote;