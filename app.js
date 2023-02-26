const express = require('express');
const app = express();
let ejs = require('ejs');
const { response } = require('express');
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://admin-jony:jony123@cluster0.r9kc6df.mongodb.net/medUserDB');
app.use('/public/images/',express.static('./public/mages'));

const cohere = require('cohere-ai');
cohere.init('WNtKqookZ0Pq7w9sZDnxo3ROUgtvbcmkiEdt2E2H');
const readline = require('readline');
const { log } = require('console');

const multer = require('multer');
const cors = require('cors');
app.use(cors()); // Allows incoming requests from any IP



const accountSid = "AC56b3633b0c8014e56d4cf25a925ea04a";
const authToken = "2d17ea2dba9b3fe589d5472b43d0cb2b";
const client = require('twilio')(accountSid, authToken);



const storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, __dirname + '/uploads');
  },
  // Sets file(s) to be saved in uploads folder in same directory
  filename: function (req, file, callback) {
      callback(null, file.originalname);
  }
  // Sets saved filename(s) to be original filename(s)
})

// Set saved storage options:
const upload = multer({ storage: storage });







var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'cyborg.div@gmail.com',
      pass: 'ozjjbmxozwpuxlde'
    }
  });
 


//////patient schema
const userschema = {
    fullName: String,
    userName:String,
    registration:String,
    email:String,
    phoneNumber:String,
    date:Date,
    Password: String,
    gender:String,
    patientordoctor:String,
    communities:String
  };
const User = new mongoose.model("User", userschema);

//feedschema
const feedschema = {
  name:String,
  title:String,
  body:String
};

const Feed = new mongoose.model("Feed", feedschema);



app.get("/doctor-register", function(req, res) {
    res.render('doctorpage');
});

app.get("/patient-register", function(req, res) {
    res.render('patientpage');
});

app.get("/login",function(req, res){
    res.render("logindocweb");
});
app.get("/user/wrongcred", function(req,res){
  res.render("WrongCredentials");
});
app.get("/forgotpass", function(req, res){
  res.render("forgetpass");
});
app.get("/", function(req, res){
  res.render("index");
});

app.get("/upload",function(req,res){
  res.render("upload");
})
app.get("/compose", function(req, res){
  res.render("compose");
})
app.get("/notification",function(req, res){
  client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: 'Hi!\nThe Doctor is live on the community',
         to: 'whatsapp:+918697596706'
       })
      .then(message => console.log(message.sid));

      res.send("The notification has been sent to the users");
})



///////////////CUSTOM EXPRESS ROUTES////////////////
app.get("/patient/:userName/home",function(req,res){
    User.findOne({fullName:req.params.userName},function(err,foundUser){
      if (foundUser.communities ==='Yes') {    
        res.render("covid.ejs",{userName:req.params.userName});
      } else {
        res.render('community.ejs',{userName:req.params.userName});
      }
    })
    
});

app.get("/doctor/:userName/home",function(req,res){
    res.render('communitydr.ejs',{userName:req.params.userName});
});
app.get("/:userName/bot", function(req,res){
  res.render('bot',{userName:req.params.userName});
});
app.get("/:userName/feed",function(req,res){
  Feed.find(function(err,result){
    console.log(result);
    res.render('feed',{userName:req.params.userName,posts:result});
  });
  
});




app.post("/patient-register",function(req,res){
    const newUser = new User({
        fullName: req.body.fullName,
        userName:req.body.userName,
        email:req.body.email,
        phoneNumber:req.body.phoneNumber,
        date:req.body.date,
        Password: req.body.Password,
        patientordoctor:"patient",
        gender:req.body.gender,
        communities:"no"
      });

      const fname = req.body.fullName;

      newUser.save(function(err){
        if(!err){
          res.redirect("/patient/"+fname+"/home");
        } else {
          res.send(err);
        }
      });
});


app.post("/doctor-register",function(req,res){
    const newDoc = new User({
        fullName: req.body.fullName,
        registration:req.body.registration,
        email:req.body.email,
        phoneNumber:req.body.phoneNumber,
        date:req.body.date,
        Password: req.body.Password,
        patientordoctor:"doctor",
        gender:req.body.gender
      });

      const fname = req.body.fullName;

      newDoc.save(function(err){
        if(!err){
          res.redirect("/doctor/"+fname+"/home");
        } else {
          res.send(err);
        }
      });
});


app.post("/login",function(req, res){
    const email = req.body.email;
    const Password = req.body.Password;
  
    User.findOne({email:email},function(err,foundUser){
        if(err){
        console.log(err);
        }
        else{
        if(foundUser){
            if(foundUser.Password === Password){
            console.log("match");
            res.redirect("/"+foundUser.patientordoctor+"/"+foundUser.fullName+"/home");
            }
            else{
                res.redirect("/user/wrongcred");
            }
        }
        else{
            res.redirect("/user/wrongcred");
        }
        
        }
    });      
    
});

app.post("/forgotpass", function(req,res){
    const email = req.body.email;

    User.findOne({email:email},function(err,foundUser){
        if(err){
        console.log(err);
        }
        else{
        if(foundUser){
            var mailOptions = {
                from: 'cyborg.div@gmail.com',
                to: email,
                subject: 'ForgotPass Email',
                text: 'Your Registered Password is '+foundUser.Password
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });

              res.send("Your Password is sent to your registered email")
        
        }
        else{
            res.send("You are not registered, Please make sure to signup first");
        }
        
        }
    });
})
app.post("/sendQuery", function(req, res){
  var mailOptions = {
    from: 'cyborg.div@gmail.com',
    to: 'cyborg.div@gmail.com',
    subject: 'Query of'+req.body.name,
    text: 'Name of the client --> '+req.body.name + 
    '\nPhone Number --> '+req.body.phoneNumber +
    '\nEmail of the client -->'+req.body.email+
    '\nQuery of the client --> '+req.body.query
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error); 
      res.send("The Query is not sent due to technical reasons");
    } else {
      console.log('Email sent: ' + info.response);
      res.render("querySuccess");
    }
  });
});

app.post("/bot", function(req,res){

const cohere = require('cohere-ai');
cohere.init('WNtKqookZ0Pq7w9sZDnxo3ROUgtvbcmkiEdt2E2H');
const readline = require('readline');



require('dotenv').config()
const { Configuration, OpenAIApi } = require("openai");
  
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
  
// Define an array to store COVID-19 affected patients
const covidCommunity = [];
  
  const height = req.body.height;
  const weight = req.body.weight;
  const symptoms = req.body.symptoms;
  const email = req.body.email;

  const BMI = calculateBMI(height, weight);

  async function getProbableDiseases(symptoms) {
      
    const response = await cohere.generate(
      {
      model:"command-xlarge-nightly",
      max_tokens:100,  
      temperature:0.9,  
      prompt:"give me 5 disease name with symptoms like "+symptoms,}
    );
    console.log("you can have the following diseases")
    console.log(response['body']['generations'][0]['text'])
    res.render('diseases',{probableDiseases : response['body']['generations'][0]['text']});
    
  }

  if (req.body.is_covid_symptoms_present === 'yes') {
    
    User.findOne({email:email},function(err,foundUser){
      if(err){
      console.log(err);
      }
      else{
      if(foundUser){
          const user_id = foundUser._id;
          console.log(user_id);

      
      User.findByIdAndUpdate(user_id, { communities: 'Yes' },
                            function (err, docs) {
      if (err){
          console.log(err)
      }
      else{
          console.log("Updated User : ", docs);
      }
    });

    }}});
    res.render("covidAdd");
  
  } else {
    getProbableDiseases(symptoms);
  }
  
  function calculateBMI(height, weight) {
    const heightMeters = height / 100;
    return weight / (heightMeters * heightMeters);
  }
  
});

app.post("/upload", upload.array("files"), (req, res) => {
  // Sets multer to intercept files named "files" on uploaded form data
      console.log(req.body); // Logs form body values
      console.log(req.files); // Logs any files
      res.json({ message: "File(s) uploaded successfully" });
  
  });

app.post("/compose", function(req, res){

const newFeed = new Feed({
  name:req.body.name,
  title : req.body.postTitle,
  body : req.body.postBody
})

newFeed.save(function(err){
  if(!err){
    console.log("successfully saved");
    res.redirect("/:userName/feed");
  }
  else{
    console.log(err);
  }
})


});  


app.listen(3000, function() {
    console.log("port started on http://localhost:3000");
});
