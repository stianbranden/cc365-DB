const mongoose = require('mongoose')
const {MONGODBURI, MONGODBNAME} = process.env

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODBURI + MONGODBNAME , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    

    console.log(`MongoDB Connected: ${conn.connection.name}@${conn.connection.host} on port ${conn.connection.port}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = connectDB;