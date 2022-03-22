const { upload, createAndSaveImage } = require("../handlers/imageHandler")
const Product = require("../models/productModel")
const User = require('../models/userModel')
const constants = require('./constants.json')
const {productImageMiddleware, updateProductImageFields} = require('./helpers/productControllerHelper')

// TODO
getCatalog = async (req, res) => {
	console.log("getCatalog")
	const search = req.body.search
	const category = req.body.category
	const condition = req.body.condition
	const minPrice = req.body.minPrice
	const maxPrice = req.body.maxPrice
	const sortBy = req.body.sortBy
	
}

// TODO
getProduct = async (req, res) => {
	console.log("getProduct")
	const _id = req.body._id;
	
}

// TODO
getOrderedProductsForUser = async (req, res) => {
	console.log("getOrderedProductsForUser")
	// status: 'OK'
	// products: [{
	// 	_id: ObjectId
	// 	name: String
	// 	cost: Number
	// 	sellerUsername: String
	// 	image: {
	// 		data: Buffer,
	// 		contentType: String
	// 	}
	// 	dateSold: Date
	// 	review: {
	// 		stars: Number
	// 		comment: String
	// 	}
	// }]
}

// TODO
getCartProductsForUser = async (req, res) => {
	console.log("getCartProductsForUser")
	// status: 'OK'
	// products: [{
	// 	_id: ObjectId
	// 	name: String
	// 	cost: Number
	// 	sellerUsername: String
	// 	image: {
	// 		data: Buffer,
	// 		contentType: String
	// 	}
	// }]
}

// TODO
getListingProductsForUser = async (req, res) => {
	console.log("getListingProductsForUser")
	// status: 'OK'
	// products: [{
	// 	_id: ObjectId
	// 	name: String
	// 	cost: Number
	// 	sellerUsername: String
	// 	image: {
	// 		data: Buffer,
	// 		contentType: String
	// 	}
	// 	dateListed: Date
	// }]
}

// TODO
getSellingProductsForUser = async (req, res) => {
	console.log("getSellingProductsForUser")
	// status: 'OK'
	// products: [{
	// 	_id: ObjectId
	// 	name: String
	// 	cost: Number
	// 	sellerUsername: String
	// 	image: {
	// 		data: Buffer,
	// 		contentType: String
	// 	}
	// 	dateSold: Date
	// }]
}

addListingProduct = async (req, res) => {
	productImageMiddleware(req, res, async () => {
		console.log("addListingProduct", req.body)

		const userId = req.userId
		const {name, description, condition, category} = req.body
		const {price, boxLength, boxWidth, boxHeight} = req.body
		const images = req.files

		let json = {}
		let user = null
		try {
			if (!userId) {
				throw "did not get a userId"
			}
			else if (!name || !description || !condition || !category) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.missingRequiredField}
			}
			else if (!price || !boxLength || !boxWidth || !boxHeight) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.missingRequiredField}
			}
			else if (Object.keys(images).length === 0) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.missingImages}
			}
			else if (! (user = await User.findById(userId))) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.userDoesNotExist}
			}
			else {
				// TODO: Calculate shipping price via api
				const shippingPrice = boxLength * boxWidth * boxHeight
		
				let product = new Product({
					name: name,
					description: description,
					condition: condition,
					category: category,
					sellerUsername: user.username,
					price: price,
					shippingPrice: shippingPrice,
					imageIds: []
				})
		
				// ADD IMAGE FILES
				product.imageIds = await updateProductImageFields(images, [...product.imageIds], product._id)

				// SAVE THE 
				await product.save()

				json = {status: constants.status.OK, product: {
					_id: product._id,
					name: product.name,
					description: product.description,
					condition: product.condition,
					category: product.category,
					sellerUsername: user.username,
					price: product.price,
					shippingPrice: product.shippingPrice
				}}
			}
			console.log("RESPONSE: ", json)
			res.status(200).json(json)
		}
		catch (err) {
			console.log(err)
			res.status(500).send(constants.status.FATAL_ERROR)
		}
	})
}

updateListingProduct = async (req, res) => {
	productImageMiddleware(req, res, async () => {
		console.log("updateListingProduct", req.body)

		const userId = req.userId
		const {_id, name, description, condition, category} = req.body
		const {price, boxLength, boxWidth, boxHeight} = req.body
		const images = req.files

		let json = {}
		let user = null
		let product = null
		try {
			if (!userId) {
				throw "did not get a userId"
			}
			else if (!_id || !name || !description || !condition || !category) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.missingRequiredField}
			}
			else if (!price || !boxLength || !boxWidth || !boxHeight) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.missingRequiredField}
			}
			else if (! (user = await User.findById(userId))) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.userDoesNotExist}
			}
			else if (! (product = await Product.findById(_id))) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.productDoesNotExist}
			}
			else if (product.sellerUsername !== user.username) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.youAreNotTheSeller}
			}
			else if (product.dateSold || product.buyerUsername) {
				json = {status: constants.status.ERROR, errorMessage: constants.product.productIsSold}
			}
			else {
				// TODO: Calculate shipping price via api
				const shippingPrice = boxLength * boxWidth * boxHeight
				
				product.name = name
				product.description = description
				product.condition = condition
				product.category = category
				product.price = price
				product.shippingPrice = shippingPrice
		
				// ADD IMAGE FILES
				product.imageIds = await updateProductImageFields(images, [...product.imageIds], _id)

				// SAVE THE 
				await product.save()

				json = {status: constants.status.OK, product: {
					_id: _id,
					name: product.name,
					description: product.description,
					condition: product.condition,
					category: product.category,
					sellerUsername: user.username,
					price: product.price,
					shippingPrice: product.shippingPrice
				}}
			}
			console.log("RESPONSE: ", json)
			res.status(200).json(json)
		}
		catch (err) {
			console.log(err)
			res.status(500).send(constants.status.FATAL_ERROR)
		}
	})
}

// TODO
deleteListingProduct = async (req, res) => {
	console.log("deleteListingProduct")
}

module.exports = {
	getCatalog,
	getProduct,
	getOrderedProductsForUser,
	getCartProductsForUser,
	getListingProductsForUser,
	getSellingProductsForUser,
	addListingProduct,
	updateListingProduct,
	deleteListingProduct
}