const express = require('express');
const app = express();
const cors = require('express');
const connectDB = require('./config/Database');
connectDB.dbconnect();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin:"http://localhost:5173",
    methods:['GET','POST','PUT','PATCH'],
    credentials:true
}));

const userRoute = require('./Routes/userRoute');
app.use('/',userRoute)
app.listen(3008,()=>console.log('App running on port 3008'));