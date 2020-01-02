const express = require('express');
const bodyParser = require("body-parser");
const ejs = require ('ejs');
const Nexmo = require ("nexmo");
const socketio = require('socket.io');

//Init nexmo
const nexmo =new Nexmo({
  apiKey:"2aaae003",
  apiSecret: "Vd5ozcXjaPtjraO1"
},
{debug:true});





//Init app
const app = express();

//Template engine setup
app.set('view engine',"html");
app.engine('html', ejs.renderFile);


// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}))

// Public folder setup
app.use(express.static(__dirname +"/public"));

//Render index html
app.get('/', (req, res) => {
  res.render('index');
});

//Catch form input
app.post('/',(req, res) =>{
  // res.send(req.body);
  // console.log(req.body);
  const number = req.body.number;
  const text = req.body.text;

  nexmo.message.sendSms(
    '13312478149', number, text, {type: "unicode" },
    (err, responseData) => {
      if(err){
        console.log(err);
      } else{
        console.dir(responseData);

        //Get data from response
        const data = {
          id: responseData.messages[0]['message-id'],
          number:responseData.messages[0]['to']
          }

        //Emit to the client
        io.emit('smsStatus', data);

      }
    }
  )

});

app.get('/response', (req, res) => {

  res.send('Response processed');
  console.log(res);    
});

//Server
const port = process.env.port || 3100;
const server = app.listen(port, () => console.log(`server started on port ${port}`));

//Connect to socket.io
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("Connected");
  io.on("disconnect", ()=> {
    console.log("Disconnected");
  })
})
