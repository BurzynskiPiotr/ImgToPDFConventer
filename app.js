// declared all imports
const express = require('express');
const app = express();
const fs = require("fs"); // to read files and create them
const multer = require('multer'); // allows to upload files to the server
const {TesseractWorker} = require('tesseract.js'); // read images
const worker =  new TesseractWorker();// analize the image

// Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads") // call back 
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});  //specify the file name and position
const upload = multer({storage: storage}).single("avatar"); // checking storage after upload 

app.set("view engine", "ejs");
app.use(express.static("public"));

// Routes

app.get("/", (req, res) => {
    res.render("index");
}); // sending response to render index page

app.post("/upload", (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
           if(err) return console.log('This is your error', err);

           worker
           .recognize(data, "eng", {tessjs_create_pdf: '1'}) 
           .progress(progress => {
               console.log(progress);
           })            
           .then(result => {
              /* res.send(result.text); -- to print text from file*/
              res.redirect('/download')
           })
           .finally(() => worker.terminate());
        });
    });
});

app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});

//Start Up server
const PORT = 5000 || process.env.PORT; //recognize port 
app.listen(PORT, ()=> console.log(`Hey I'm running on port ${PORT}`));


