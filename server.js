
const express = require('express');
const bodyparser = require('body-parser');
const imagesearch = require('image-search-results')
const downloader = require('image-downloader');
const tmp = require('tmp');
const archiver = require('archiver');
const fs = require('fs');
const cors = require('cors');
const {resolve} = require('path');
const port = process.env.PORT || 3000;


const app = express();

app.use(bodyparser.json());
app.use(cors())

app.get('/', (req, res) => {
    res.sendFile(resolve('index.html'));
});

app.post('/shot', async(req,res) => {
    console.log(req.body)
    let archive = archiver('zip')
    let output = fs.createWriteStream(__dirname + '/images.zip');
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });
      output.on('end', function() {
        console.log('Data has been drained');
      });
       
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          // log warning
        } else {
          // throw error
          throw err;
        }
      });

      archive.on('error', function(err) {
        throw err;
      });
      
      
    
    let { image , amount } = req.body;
    console.log(image)
    console.log(amount)
    let query = {query: image}
    let urls = [];
    let dir = tmp.dirSync();
    console.log(dir.name)
    
    let url = await imagesearch.google(query);

    for(let i = 0; i< parseInt(amount); i++){
        
        
        console.log(url)
        let options = {
            url: url[i].url,
            dest: dir.name
            
        }
        

       let {filename,image} = await downloader.image(options)
       console.log('downloaded')
        
       await urls.push(url[0].url)
    }

    await archive.pipe(output);
    await archive.directory(dir.name,false)
    await archive.finalize();
    res.sendStatus('200');
  console.log('done')
})

app.get('/shots', (req, res) => {
  res.download('images.zip');
})

app.listen(port);