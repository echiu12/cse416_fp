const constants = require('./constants.json')
const {Product, ProductState} = require('../models/productModel')
const User = require('../models/userModel')
const { coingateClient } = require('../handlers/purchaseHandler')
const { calculatePriceOfReserved, reserveCartProducts } = require('./helpers/purchaseControllerHelper')
const dotenv = require('dotenv')
const Cart = require('../models/cartModel')
const {Order, OrderState} = require('../models/orderModel')
const {Purchase, PurchaseState} = require('../models/purchaseModel')

dotenv.config()


addToCart = async (req, res) => {
	console.log("addToCart", req.body)
	const userId = req.userId
	const _id = req.body._id

	let json = {}
	let user = null
	let product = null
	try {
		if (!userId) {
			throw constants.error.didNotGetUserId
		}
		else if (!_id) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.missingRequiredField}
		}
		else if (! (user = await User.findById(userId))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.userDoesNotExist}
		}
		else if (! (product = await Product.findById(_id))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.productDoesNotExist}
		}
		else if (product.sellerUsername === user.username) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.userOwnsThisItem}
		}
		else {
			const cart = new Cart({buyerUsername: user.username, productId: _id})
			try {
				await cart.save()
				json = {status: constants.status.OK}
			} catch (err) {
				if (err.name === "MongoServerError" && err.code === 11000) {
					json = {status: constants.status.ERROR, errorMessage: constants.purchase.cartAlreadyIncludesProduct}
				}
				else {
					json = {status: constants.status.ERROR, errorMessage: "errorCode=" + err.code}
				}
			}
		}
		console.log("RESPONSE: ", json)
		res.status(200).json(json)
	}
	catch (err) {
		console.log(err)
		res.status(500).send(constants.status.FATAL_ERROR)
	}
}

removeFromCart = async (req, res) => {
	console.log("removeFromCart", req.body)
	const userId = req.userId
	const _id = req.body._id

	let json = {}
	let user = null
	let cartItem = null
	try {
		if (!userId) {
			throw constants.error.didNotGetUserId
		}
		else if (!_id) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.missingRequiredField}
		}
		else if (! (user = await User.findById(userId))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.userDoesNotExist}
		}
		else if (! (await Product.findById(_id))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.productDoesNotExist}
		}
		else if (! (cartItem = await Cart.findOneAndRemove({buyerUsername: user.username, productId: _id}))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.cartItemDoesNotExist}
		}
		else {
			json = {status: constants.status.OK}
		}
		console.log("RESPONSE: ", json)
		res.status(200).json(json)
	}
	catch (err) {
		console.log(err)
		res.status(500).send(constants.status.FATAL_ERROR)
	}
}

//TODO
purchaseFromCart = async (req, res) => {
	console.log("purchaseFromCart", req.body)
	const userId = req.userId
	
	let json = {}
	let user = null
	let cartItems = null
	let reservedProductIds = []
	let failedToReserveIds = []
	try {
		if (!userId) {
			throw constants.error.didNotGetUserId
		}
		else if (! (user = await User.findById(userId))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.userDoesNotExist}
		}
		else if (! (cartItems = await Cart.find({buyerUsername: user.username}))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.cartIsEmpty}
		}
		else if (cartItems.length === 0) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.cartIsEmpty}
		}
		else if (! ({reservedProductIds, failedToReserveIds} = await reserveCartProducts(user.username))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.failedToReserveCartProducts}
		}
		else {

			// TODO: Mark shopping cart items as "reserved"

			const price_amount = await calculatePriceOfReserved(user.username)

			// TODO: Check price is not over 25 BTC

			const price_currency = 'BTC'
			const receive_currency = 'BTC'

			const invoice = {
				price_amount: price_amount,
				price_currency: price_currency,
				receive_currency: receive_currency,
			}

			console.log("SENDING TO COINGATE: ", invoice)

			const order = await coingateClient.createOrder(invoice)
			json = order
			console.log("REDIRECT: ", json)
			res.redirect(order.payment_url)
		}
		// console.log("RESPONSE: ", json)
		// res.status(200).json(json)
	} catch (err) {
		console.log(err)
		// console.log(err.response.response.data)
		res.status(500).send(constants.status.FATAL_ERROR)
	}
}

// TODO
purchaseCallback = async (req, res) => {
	console.log("purchaseCallback", req.body)
	
}

// TODO - Remove when done
purchaseFromCartTest = async (req, res) => {
	console.log("purchaseFromCartTest", req.body)
	const userId = req.userId
	
	let json = {}
	let user = null
	let reservedProducts = []
	let failedToReserve = []
	let purchase = null
	try {
		if (!userId) {
			throw constants.error.didNotGetUserId
		}
		else if (! (user = await User.findById(userId))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.userDoesNotExist}
		}
		else if (! (cartItems = await Cart.find({buyerUsername: user.username}))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.couldNotGetCartItems}
		}
		else if (! ({reservedProductIds, failedToReserveIds} = await reserveCartProducts(user.username))) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.failedToReserveCartProducts}
		}
		else if (reservedProductIds.length === 0) {
			json = {status: constants.status.ERROR, errorMessage: constants.purchase.noProductsWereReserved}
		}
		else {
			const price = await calculatePriceOfReserved(user.username)
			
			// TODO: create invoice
			
			// TODO: send invoice
			
			// FOR TESTING: 
			const thirdPartyOrderId = Math.floor(1 + Math.random() * 1000)
			const token = Math.floor(1 + Math.random() * 1000)
			// const token = 123
			console.log(reservedProductIds)
			const purchase = new Purchase({
				buyerUsername: user.username,
				thirdPartyOrderId: thirdPartyOrderId,
				token: token,
				productIds: reservedProductIds,
			})
			purchase.save()

			const invoice = `http://localhost:4000/api/purchase/purchaseCallbackTest/${thirdPartyOrderId}/${token}`
			
			json = {
				status: constants.status.OK, 
				reservedProducts: reservedProducts, 
				failedToReserve: failedToReserve,
				price: price, 
				invoice: invoice
			}
		}
		console.log("RESPONSE: ", json)
		res.status(200).json(json)
	} catch (err) {
		console.log(err)
		// console.log(err.response.response.data)
		res.status(500).send(constants.status.FATAL_ERROR)
	}
}

// TODO
purchaseCallbackTest = async (req, res) => {
	console.log("purchaseCallbackTest", req.body)
	const order_id = req.params.order_id
	const token = req.params.token
	
	console.log("ORDER_ID: ", order_id)
	console.log("TOKEN: ", token)

	let json = {}
	let purchase = null
	try {
		if (! (purchase = await Purchase.findOne({ thirdPartyOrderId: order_id }))) {
			json = {status: constants.status.ERROR, errorMessage: "purchase entry doesn't exist"}
		}
		else if (purchase.token !== token) {
			json = {status: constants.status.ERROR, errorMessage: "purchase token incorrect"}
		}
		else {
			console.log("PURCHASE: ", purchase)
			for(const productId of purchase.productIds) {
				const order = await Order.findOneAndUpdate(
					{productId: productId}, 
					{state: OrderState.SUCCESSFUL}
				)
				const product = await Product.findOneAndUpdate(
					{productId: productId}, 
					{state: ProductState.SOLD}
				)
			}

			purchase.state = PurchaseState.SUCCESSFUL
			await purchase.save()
		}
		res.status(200).send({status: constants.status.OK})
	} catch (err) {
		console.log(err)
		res.status(500).send(constants.status.FATAL_ERROR)
	}
}

module.exports = {
	addToCart,
	removeFromCart,
	purchaseFromCart,
	purchaseCallback,

	purchaseFromCartTest,
	purchaseCallbackTest,
}