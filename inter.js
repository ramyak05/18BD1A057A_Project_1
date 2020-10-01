var express= require("express");
var app=express();

//body-parser middleware  
const bodyParser=require('body-parser'); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let server= require('./server');
let middleware = require('./middleware');

const MongoClient= require('mongodb').MongoClient;
const url='mongodb://localhost:127.0.0.1:27017/';
const dbName='hospital';

let db
MongoClient.connect(url,{
    useUnifiedTopology: true},(err,client)=>{                   //useUnifiedTopology: constructor enabling
    if(err)
    return log.console(err);
    db=client.db(dbName);
    console.log(`Connected MongoDB: ${url}`);
   console.log(`Database: ${dbName}`);
});

//fetch hospital data
app.get('/getHospitalData',middleware.checkToken,(req,res)=>{    
    console.log("Fetching Hospital Data");
    db.collection('hospital').find().toArray().then(result=> res.json(result));  
});

//fetch ventilators data
app.get('/getVentilatorData',middleware.checkToken,(req,res)=>{    
    console.log("Fetching Ventilators Data");
    db.collection('ventilators').find().toArray().then(result=> res.json(result));  
});

//fetch ventilators by status
app.post('/searchStatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;     //industry standard
    console.log(status);
    db.collection('ventilators').find({status:status}).toArray().then(result=> res.json(result));  
});

//fetch ventilators by Hospital Name
app.post('/searchHospitalName',middleware.checkToken,(req,res)=>{
    //var name=req.query.name;
    var name=req.body.name;
    console.log(name);
    db.collection('ventilators').find({'Name': new RegExp(name,'i')}).toArray().then(result=> res.json(result));   
});

//search hospital
app.post('/searchHospital',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    db.collection('hospital').find({'Name': new RegExp(name,'i')}).toArray().then(result=> res.json(result));   
});

//update ventilator
app.put('/updateventilator',middleware.checkToken,(req,res)=>{
     var vId=req.body.vId;
     var id= {vId: vId};
     console.log(id);
     var status= {$set: {status:req.body.status} };
     db.collection('ventilators').updateOne(id,status,function(err,result){
         if(err)
         return log.console(err);
         res.json('1 document updated');
     });
});

//add ventilator
app.put('/addventilator',middleware.checkToken,(req,res)=>{
    var vId= req.body.vId;
    var HId= req.body.HId;
    var status= req.body.status;
    var Name= req.body.Name;
    var item={HId:HId, vId : vId, status : status, Name : Name};
    console.log(item);
    db.collection('ventilators').insertOne(item,function(err,result){
           if(err)
           return log.console(err);
           res.json('Added ventilator');
    });
});

//delete ventilator by ID
app.delete('/deleteventilator',middleware.checkToken,(req,res)=>{
    var vId= {vId: req.body.vId};
    console.log(vId);
    db.collection('ventilators').deleteOne(vId,function(err,result){
        if(err)
        return log.console(err);
        res.json('Deleted ventilator');
    });
});

var port = 3000;                       
app.listen(port);
console.log('Listening on http://localhost:' + port);