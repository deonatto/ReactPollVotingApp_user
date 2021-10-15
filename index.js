require('dotenv').config();
const express = require('express');
const app = express(); 
const { makeDb } = require('mysql-async-simple');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');


//method inbuilt in express to recognize the incoming Request Object as a JSON Object
app.use(express.json());

//determines which origins are allowed to access server resources over CORS
app.use(cors(
    {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
));


//connect to DB
const connection = mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

const db = makeDb();
db.connect(connection);

//middleware to check authorization and redirect (no need of jwt payload)
const verifyLogin = (req,res,next) =>{
    const token = req.headers["x-access-token"]; 
    if(token === "null" || !token){
        res.json({auth: false});
    }else{
        jwt.verify(token, process.env.JWT_SECRET, (err)=>{
            if(err){
                return res.status(401).json();
            }else{
                next();
            }
        });
    } 
};

//in post method returns undefined when token doesn`t exits. 
//middleware for authorization to pass payload of jwt to next middleware.
const verify = (req,res,next) =>{
    const token = req.headers['x-access-token']; 
    if(token === "null" || !token){
        res.json({auth:false});
    }else{
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
            if(err){
                console.log(err);
                return res.status(401).json();
            }else{
                res.locals.id = decoded.id;
                next();
            }
        });
    }
};

app.get('/verifyLogin', verifyLogin, (req,res)=>{
    res.json({auth: true}); 
});


//check if user exits and create session
app.post('/login', async(req,res)=>{
    try{
        const username = req.body.username; 
        const password = req.body.password;
        const result = await db.query(connection,
            "SELECT * FROM users WHERE email=?",
            [username]);
        if(result.length > 0){
            const passwordIsValid = bcrypt.compareSync(
                password,
                result[0].password
            );
            if(passwordIsValid  && result[0].role_id === 2){
                const id = result[0].id;
                const token = jwt.sign({id: id}, process.env.JWT_SECRET,{expiresIn: "120m"} );
                res.json({token: token});
            }else{
                res.json({message: "Wrong username/password"})
            }
            
        }else{
            res.json({message: "Wrong username/password"})
        }

    }catch(err){
        console.log(err);
        res.status(400).json({err: "An error ocurred"});
    } 

});


//update user
app.post('/update',async(req,res) =>{
    try{
        const fname = req.body.fName;
        const lname = req.body.lName;
        const email = req.body.email;
        const updated_at = new Date();
        const id = req.body.id;
        const response = await db.query(connection,"UPDATE users SET fname=?,lname=?,email=?,updated_at=? WHERE id=?",
        [fname,lname,email,updated_at,id]);
        if(response){
            res.json({message: "User updated"});
        }
    }catch(err){
        console.log(err);
        res.json({err: "An error ocurred, and user was not updated"})
    }
});

//get profile

app.get('/profile', verify ,async (req,res)=>{
    try{
        const id = res.locals.id;
        
        const response = await db.query(connection,
            "SELECT * FROM users WHERE id=?",
            [id]);

        res.json({
            auth:true,
            id: id,
            fname: response[0].fname, 
            lname: response[0].lname,
            email: response[0].email,
            id_num: response[0].id_num
        })
    }catch(err){
        console.log(err);
        res.status(400).json({err: "Profile can´t be fetch"});
    }
     
    
});

//update password
app.post('/pass',verify ,async (req,res) =>{
    try{
        const id = res.locals.id;
        const getPassword = await db.query(connection,"SELECT * FROM users WHERE id=?",
        [id]);
        
        const password = req.body.password; 

        const passwordIsValid = bcrypt.compareSync(
            password,
            getPassword[0].password
        );
        
        if(passwordIsValid){
            const hashed_newPassword = bcrypt.hashSync(req.body.new_password, 8);
            await db.query(connection,"UPDATE users SET password=? WHERE id=?",
            [hashed_newPassword,id]);
            
            res.json(
                {
                    auth: true,
                    message: "Password updated"
                }
            );
            
        }else{
            res.json({
                auth: true,
                message: "Wrong password"});
        }
        
         
        
    }catch(err){
        console.log(err);
        res.status(400).json({err: "Password can´t be updated"});
    }
    
});

//create list for table
app.get('/polls',verify, async (req,res)=>{
    try{
        const response = await db.query(connection,"SELECT id,poll_name,poll_desc,active FROM polls");
        if(response){
            res.json(
                {
                    auth: true, 
                    list: response
                }
            );
        }
    }catch(err){
        console.log(err);
    }

});

// get poll options of poll 

app.post('/results',verify ,async(req,res)=>{
    try{
        const id = req.body.id;
        const result = await db.query(connection,"SELECT id, option_name FROM poll_options WHERE poll_id=?",[id])
        const options = [];
        for(let i=0; i< result.length;i++){
            
            const result1 = await db.query(connection,"SELECT * FROM votes WHERE poll_id=? AND poll_option_id=?",[id,result[i].id])
            options.push(
                {
                    poll_name: result[i].option_name,
                    votes: result1.length
                }
            ) 
        }
        res.json(
            {
                auth: true,
                list:options
            });

    }catch(err){
        console.log(err);
    }
    
})
    
    
app.post('/options',verifyLogin, async (req,res)=>{
    try{
        const id = req.body.id; 
        const result = await db.query(connection,
            "SELECT id, option_name FROM poll_options WHERE poll_id=?",
            [id]);
        if(result){
            res.json(
                {
                    auth: true, 
                    list: result
                }
            );
        }
    }catch(err){
        console.log(err);
    }
    
});

app.post('/vote',verify, async (req,res)=>{
    try{
        
        const poll_id = req.body.id; 
        const user_id = res.locals.id;
        const option_id = req.body.option_id;
        const hash = Math.random().toString(36).substring(2,22);
        const created = new Date();
        const updated = new Date();
        const result = await db.query(connection,"Select * FROM votes WHERE poll_id = ? AND user_id = ?" , 
        [poll_id, user_id]);
        if(result.length > 0){
            res.json({message: "You already Voted"});
        }else{
            const result1 = await db.query(connection,
                "INSERT INTO votes (poll_id,poll_option_id,user_id,vote_hash, created_at ,updated_at) VALUES (?,?,?,?,?,?)",
                [poll_id,option_id,user_id,hash,created,updated]);
            if(result1){
                res.json({message: "Vote saved"});
            }
        }

    }catch(err){
        console.log(err);
        res.json({err: "An error ocurred"});
    }
    
});

app.listen(5000, () =>{
    console.log("running on port 5000");
}); 

/*

app.post('/document', async (req,res)=>{
    try{
        const id = req.session.user[0].id_type;
        const result = await db.query(connection,
            "SELECT * FROM id_types WHERE id=?",
            [id]);
        if(result){
            res.send(result);
        }
            
    }catch(err){
        console.log(err);
        res.send({err: "An error ocurred"});
    }
     
    
});
*/