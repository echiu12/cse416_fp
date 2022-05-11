const path = require('path')
const mime = require('mime-types')
const Image = require('../models/imageModel')

image = async (req, res) => {
	console.log("image", req.body)
	const id = req.params.id
	console.log("id: ", id)

    let file = null
    if (!id) {
        conosle.log("SENDING")
        res.status(200).send({status: "ERROR", errorMessage: "Missing image id"})
    }
    else if (!(file = await Image.findById(id))) {
        res.status(200).send({status: "ERROR", errorMessage: `No image with id ${id}`})    
    }
    else {
        const mimetype = file.mimetype
        const extension = mime.extension(mimetype)
        const file_path = path.join(__dirname + "/../uploads/" + id + "." + extension)
        res.sendFile(file_path)
    }

}

module.exports = {
	image
}