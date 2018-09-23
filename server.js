
const express = require('express');
const bodyparser = require('body-parser');
const imagesearch = require('image-search-results')
const downloader = require('image-downloader');
const tmp = require('tmp');
const archiver = require('archiver');
const fs = require('fs');
const cors = require('cors');


const app = express();

app.use(bodyparser.json());
app.use(cors())
app.listen(3000);

app.post('/shot', async (req,res) => {
    let archive = archiver('zip')
    let output = fs.createWriteStream(__dirname + 'target.zip');
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
      

    console.log(req.body)
    const { images } = req.body;
    let urls = [];
    let dir = tmp.dirSync();

    for(let img of images){
        
        let url = await imagesearch.google({query:img});
        let options = {
            url: url[0].url,
            dest: dir.name
        }
        console.log(img)

       let {filename,image} = await downloader.image(options)
        
        urls.push(url[0].url)
    }

    archive.pipe(output);
    archive.directory(dir.name,false)
    archive.finalize();
    res.download(__dirname + '/downloads/txt.txt','txt.txt');
    res.send('sent')
    console.log(dir.name);
})