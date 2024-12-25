const mongoose = require('mongoose')
const Local_Url = 'mongodb://127.0.0.1:27017/AdmissionPortal'
const live_url = 'mongodb+srv://monu1999june:monu1234@cluster0.m4jdf.mongodb.net/AdmissionPortal?retryWrites=true&w=majority&appName=Cluster0'

const connectDb = () => {
    return mongoose.connect(live_url)
        .then(() => {
            console.log('Connnection Succesful')
        })
        .catch((error) => {
            console.log(error)
        })

}


module.exports = connectDb