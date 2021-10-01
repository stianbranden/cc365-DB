const mongoose = require('mongoose')
const {MONGODBURI, MONGODBNAME} = process.env
const {logStd, logSys, logErr} = require('./logger')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODBURI + MONGODBNAME , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    

    logSys(`MongoDB Connected: ${conn.connection.name}@${conn.connection.host} on port ${conn.connection.port}`)
  } catch (err) {
    logErr(err)
    process.exit(1)
  }
}

module.exports = connectDB;