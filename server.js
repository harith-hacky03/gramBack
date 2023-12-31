const express=require('express')

const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })



// Middleware

const app=express()
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

const sql=mysql.createConnection({
    host:'mys.cjkowvxrkmpy.eu-north-1.rds.amazonaws.com',
    user:'admin',
    password:'admin123',
    database:'gram',
    port:'3306'
})

sql.connect(err=>{
    if(err)
    {
        console.log('connect error')
        console.log(err)
    }
    console.log('Database Connected')
})

const resul={"assets": [{"assetId": null, "base64": null, "duration": null, "exif": null, "height": 1024, "rotation": null, "type": "image", "uri": "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FHelloWorld-f715dde3-4174-47b5-8d92-ef9aba3f62d6/ImagePicker/cb8206e9-67da-483f-835c-f763e60a8123.jpeg", "width": 732}], "canceled": false, "cancelled": false}
app.post("/upload", upload.single(resul), (req, res) => {
    console.log("Body: ", req.body);
    console.log("File: ", req.file);
    res.send("File successfully uploaded.");
});


app.post('/addUser',(req,res)=>{
    let username=req.body.user_name
    let password=req.body.password
    let profile=req.body.profile
    let sql_query=`INSERT INTO user_auth(user_name,user_pass,profile_pic) VALUES("${username}","${password}","${profile}");`
     sql.query(sql_query,(err,data)=>{
        if(err) res.send(err)
        else res.send('User inserted')
    })
})

app.post("/upload", upload.single('profile'), (req, res) => {
    console.log("Body: ", req.body);
    console.log("File: ", req.file);
    res.send("File successfully uploaded.");
});



app.get('/getD',async(req,res)=>{
   let sql_query="SELECT profile_pic FROM user_auth WHERE user_id=40"
   sql.query(sql_query,(err,data)=>{
    if(err) console.log(err)
    else res.send(data)
   })


})



app.get('/addFrnd', async (req, res) => {
    try {
        // Get current user_id
        let cur_user_id = await getUserID("Yaadhav");
        // Get friend_id
        let frnd_id = await getUserID("Jannesh");

        console.log(cur_user_id);

        // Insert into user_frnd table
        let fin_query = `INSERT INTO user_frnd VALUES(${cur_user_id},${frnd_id});`;
        await queryAsync(fin_query);

        res.send("Friends are added");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/getFrndsDetails',async(req,res)=>{

try{
    var arryy=await getFrnds()
    for(const element of arryy)
    {
    try{
        const arry=await frndPosts(element.user_id)
        //console.log(arry[0].user_name)
        for(const el of arry)
        {
            res.write(`<h1>${el.user_name}</h1>`)
            res.write(`<img src=${el.post_img} />`)
            res.write(`<h2>${el.post_cap}</h2>`)
        
        }
        res.end()
        }
        catch(err)
        {
    
        }
    }
}
catch(err)
{
    console.log("This is error")
    console.log(err)
}
    
    
})




function frndPosts(user_id)
{
    return new Promise((resolve,reject)=>{
        let que=`SELECT user_auth.user_name,posts.post_img,posts.post_cap FROM posts INNER JOIN user_auth WHERE posts.user_id=user_auth.user_id AND posts.user_id=${user_id}`
        sql.query(que,(err,data)=>{
            if(err)
            {
                reject(err)
            }
            else
            {
                resolve(data)
            }
        })

    })
}



app.get('/uploadPost',async(req,res)=>{
    try{
    await uploadPost()
    res.send('Post uploaded')
    }
    catch(err)
    {
        console.log(err)
    }
})

function uploadPost()
{
    return new Promise((resolve,reject)=>{
        let user_id=3
        let img="https://thumbs.dreamstime.com/z/manager-unlocking-cloud-access-to-remote-worker-hand-network-connect-male-zero-hours-contractor-freelance-58169368.jpg"
        let cap='its Jannesh only to Yaadhav'
        let qu=`INSERT INTO posts VALUES(${user_id},"${img}","${cap}");`
        sql.query(qu,(err,data)=>{
            if(err)
            {
                reject(err)
            }
            else{
                resolve(data)
            }
        })
    })
}

async function  getFrnds()
{
    return new Promise(async(resolve,reject)=>{
        let quer=`SELECT user_auth.user_id FROM user_frnd INNER JOIN user_auth WHERE user_frnd.frnd_id=user_auth.user_id AND user_frnd.cur_user_id=1;` //needs change
        sql.query(quer,async(err,data)=>{
            if(err){
            reject("Error")
            }
            else 
            {
               
               
                resolve(data)
               
            }
        })
    })
    
}


function getUserID(username) {
    return new Promise((resolve, reject) => {
        let sql_query = `SELECT user_id FROM user_auth WHERE user_name="${username}"`;
        sql.query(sql_query, (err, data) => {
            if (err) {
                reject(err);
            } else if (data.length > 0) {
                resolve(data[0].user_id);
            } else {
                reject("User not found");
            }
        });
    });
}

function queryAsync(query) {
    return new Promise((resolve, reject) => {
        sql.query(query, (err, data) => {
            if (err) {
                reject(err);
            } else {
                
                resolve(data);
            }
        });
    });
}


app.listen(8000,()=>console.log('Server Started'))