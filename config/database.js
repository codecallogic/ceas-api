const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_ATLAS_CLUSTER, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

const db = mongoose.connection

db.on('connected', function(){
  console.log(`Connected to mongoDB at ${db.host} : ${db.port} : database ${db.name}`)
})