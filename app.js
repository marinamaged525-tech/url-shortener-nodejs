const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const Url = require('./models/url')

const port = process.env.PORT || 3000
const app = express()

// View Engine:
app.set('view engine' , 'ejs')

// Middleware:
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Connect to Mongodb:
mongoose.connect(process.env.MONGO_URI)
 .then(result => { 
    app.listen(port , () => {
     console.log(`Server running on port ${port}`)
   })
   })  // listening for requests after connecting to db
 .catch(err => console.log(err))


// Routes:

// 1- Home page to fetch and display all Urls:
app.get('/' , async (req , res) => {
   try {
      const urls = await Url.find().sort({ createdAt: -1}) // it fetches urls from mongoose models
      res.render('index' , {urls}) // passes data to the view(ejs template)

   } catch(err) {
      res.status(500).json({error : 'Server Error Loading Homepage'})
   } 
}) 

// 2- Shorten Logic : creates a new short URL:
app.post('/shorten' , async (req , res) => {
   try {
      const {longUrl} = req.body

      // Generate Short Code:
      const shortUrl = Math.random().toString(36).substring(2,8)

      // Save to Database:
      const url = new Url({longUrl , shortUrl})
      await url.save()

      // Redirects the saved url to homepage:
      res.redirect('/')
   }
   catch(err) {
      res.status(500).send('Error shortening URL')      
   }
})

app.get('/:shortUrl', async (req, res) => {
  try {
    const { shortUrl } = req.params

    const url = await Url.findOne({ shortUrl })

    if (url) {
      return res.redirect(url.longUrl)
    } else {
      return res.status(404).send('Short URL not found')
    }

  } catch (err) {
    res.status(500).send('Server error')
  }
})
