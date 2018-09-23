
const express = require('express');
const bodyparser = require('body-parser');
const imagesearch = require('image-search-results')
const downloader = require('image-downloader');

const app = express();

app.use(bodyparser.json());
app.listen(3000);

app.post('/shot', async (req,res) => {
    const { images } = req.body;
    let urls = [];

    for(let img of images){
        let url = await imagesearch.google({query:img});
        let options = {
            url: url[0].url,
            dest: './images'
        }
        console.log(img)

       let {filename,image} = await downloader.image(options)
        
        urls.push(url[0].url)
    }

    res.send(urls)
})