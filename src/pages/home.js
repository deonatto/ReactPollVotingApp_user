import '../App.css';
import React, {useEffect, useState} from 'react'; 
import Axios from 'axios'; 
import {useHistory, Link} from 'react-router-dom';
import NavBar from './navBar';
import { MDBJumbotron, MDBContainer, MDBIcon, MDBDataTable} from "mdbreact";


//import { Table} from 'antd';
//import 'antd/dist/antd.css';


function Home(){
    //to work with express session and axios with need to do this
    Axios.defaults.withCredentials = true; 
    let history = useHistory(); 
    const[pollList,setPollList] = useState("");

    const data = {
        columns: [
          {
            label: 'Name',
            field: 'name',
            sort: 'asc',
            width: 150
          },
          {
            label: 'Poll Description',
            field: 'poll_desc',
            sort: 'asc',
            width: 270
          },
          {
            label: 'Active',
            field: 'active',
            sort: 'asc',
            width: 200
          },
          {
            label: 'Vote',
            field: 'vote',
            sort: 'asc',
            width: 100
          },
          {
            label: 'Results',
            field: 'results',
            sort: 'asc',
            width: 150
          }
        ],
        rows: pollList
      };

    //use effect to check if user already login
    useEffect(()=>{
        async function getPolls(){
            try{
                const polls = await Axios.get("http://localhost:5000/polls",{
                    headers:{"x-access-token": localStorage.getItem("user")}
                });
                if(!polls.data.auth){
                    history.push('/login');
                }else{
                    setPollList(polls.data.list.map(col =>{
                        return {
                            name: col.poll_name,
                            poll_desc: col.poll_desc,
                            active: col.active === 1? 'Yes' : 'No',
                            vote: col.active ===1? <Link to = {"/vote/" + col.id}> <MDBIcon icon="vote-yea" className="cyan-text pr-3" size="1x"/> Vote</Link>: '',
                            results: col.active ===0? <Link to = {"/results/" + col.id}> <MDBIcon icon="poll-h" className="cyan-text pr-3"size="1x" /> Results</Link>:''
        
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
        getPolls();
          
    
    },[]);

    return(
        <div className = "main-home-container">
            <NavBar/>
            <div className = "jumbo-container">
                <MDBJumbotron fluid className = "h-25 jumbo-title-container">
                    <MDBContainer>
                        <h3 className="display-4"><MDBIcon icon="poll"/> Polls</h3>
                    </MDBContainer>
                </MDBJumbotron>
            </div>
            <div className = "btable">
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

export default Home;