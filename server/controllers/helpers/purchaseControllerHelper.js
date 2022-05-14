const {Product, ProductState} = require("../../models/productModel")
const Cart = require("../../models/cartModel")
const { Order, OrderState } = require("../../models/orderModel")
const { Purchase, PurchaseState } = require("../../models/purchaseModel")
const User = require("../../models/userModel")
const axios = require('axios')
const xml2js = require('xml2js')
const constants = require('../constants.json')

calculatePriceOfReserved = async (reservedProductIds) => {
    const price = await reservedProductIds.reduce(async (memo, productId) => {
        const order = await Order.findOne({productId: productId, state: OrderState.PENDING})
        const product = await Product.findById(productId)
        console.log("ORDER: ", order)
        console.log("PRODUCT: ", product)
        return (await memo) + product.price + order.shippingPrice
    }, 0)

	// const reservations = await Order.find({ buyerUsername: username, state: OrderState.PENDING })
    // const price = await reservations.reduce(async (memo, reservation) => {
    //     const product = await Product.findById(reservation.productId)
    //     console.log("GOT PRODUCT: ", product)
    //     return (await memo) + product.price + reservation.shippingPrice
    // }, 0)
	console.log("CALCULATED PRICE: ", price)
	return price
}

calculateShippingPrice = async (buyerUsername, productId) => {
    if (!(buyer = await User.findOne({ username: buyerUsername }))) {
        throw `failed to find buyer with username ${buyerUsername}`
    }
    else if (!(product = await Product.findOne({ _id: productId }))) {
        throw `no product with productId ${_id}`
    }
    else if (!(seller = await User.findOne({ username: product.sellerUsername }))) {
        throw `failed to find seller with username ${product.sellerUsername}`
    }
    else {
        let zipDestination=buyer.zipcode;
        let zipOrigination=seller.zipcode;
        let boxWeight=product.boxWeight;
        let boxWidth=product.boxWidth;
        let boxLength=product.boxLength;
        let boxHeight=product.boxHeight;
        var xml =`<RateV4Request USERID="726CRYPT0533">
        <Revision></Revision>
        <Package ID="0">
        <Service>PRIORITY</Service>
        <ZipOrigination>${zipOrigination}</ZipOrigination>
        <ZipDestination>${zipDestination}</ZipDestination>
        <Pounds>${boxWeight}</Pounds>
        <Ounces>0</Ounces>
        <Container></Container>
        <Width>${boxWidth}</Width>
        <Length>${boxLength}</Length>
        <Height>${boxHeight}</Height>
        <Girth></Girth>
        <Machinable>TRUE</Machinable>
        </Package>
        </RateV4Request>`;
        
        let response = await axios.get('https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4&XML=' + xml, {
            headers: {
                'Content-Type': 'application/xml',
            },
        })
        
        if (!(response)) {
            throw `failed to get shipping api response`
        }
        else {
            let parser=new xml2js.Parser();
            const result = await new Promise((resolve, reject) => {
                parser.parseString(response.data, (err, result) => {
                    if (err) {
                        reject(err)
                    }
                    else if (result.Error) {
                        reject(result.Error.Description)
                    }
                    else if (result["RateV4Response"]["Package"][0]["Error"]) {
                        reject(result["RateV4Response"]["Package"][0]["Error"][0].Description)
                    }
                    else {
                        let detail = result["RateV4Response"]["Package"][0]["Postage"][0];
                        let price=detail["Rate"][0];
                        let service=detail["MailService"][0];
                        let index=service.indexOf("&");
                        if (index!=-1){
                            service=service.substring(0,index);
                        }
                        let algo=1.35692;
                        console.log("PRICE: ", price*algo)
                        console.log("SERVICE: ", service)
                        resolve({price: price*algo, service: service})
                    }
                })
            })
            console.log("CALCULATE SHIPPING PRICE RESULT: ", result)
            return result;
        }
    }
}

// TODO
reserveCartProducts = async (username, callback) => {
	let reservedProductIds = []
	let failedToReserveIds = []
	const cartItems = await Cart.find({buyerUsername: username})
	const cartProductIds = cartItems.map((cartItem) => cartItem.productId)
	for (const productId of cartProductIds) {
		let order = null;
		try {
			if (await Order.findOne({productId: productId})) {
				failedToReserveIds.push(productId)
			}
			else {
                const {price, service} = await calculateShippingPrice(username, productId)
                console.log("PRICE: ", price)
                console.log("SERVICE: ", service)
                const reservation = new Order({
                    buyerUsername: username, 
                    productId: productId,
                    shippingPrice: price,
                })
                await reservation.save()
                console.log("SAVED RESERVATION")
                reservedProductIds.push(productId)
                console.log("PUSHING RESERVATION")
                await Cart.findOneAndRemove({buyerUsername: username, productId: productId})
                await Product.findOneAndUpdate({_id: productId}, {
                    state: ProductState.RESERVED, 
                    reserverUsername: username,
                })
                console.log("COMPLETED")
			}
		} catch (err) {
            console.log("ERROR RESERVING: ", err)
			failedToReserveIds.push(productId)
		}
	}
    console.log("RESERVED PRODUCT IDS: ", reservedProductIds)
	return {reservedProductIds, failedToReserveIds}
}

unreserveProducts = async (username, reservedProductIds) => {
	await Promise.all(reservedProductIds.map(async (productId) => {
		try {
			await Order.findOneAndRemove({buyerUsername: username, productId: productId})
			const cartItem = new Cart({
				buyerUsername: username,
				productId: productId,
			})
			await cartItem.save()
			await Product.findOneAndUpdate({_id: productId}, {
				state: ProductState.LISTED, 
				reserverUsername: null,
			})
		} catch (err) {
            console.log("ERROR: ", err)
			console.log(`FAILED TO UNRESERVE PRODUCTID ${productId} FOR USERNAME ${username}`)
		}
	}))
}

handlePurchaseCallbackPaidStatus = async (req) => {
    const {
        id, 
        order_id, 
        status, 
        pay_amount, 
        pay_currency, 
        price_currency, 
        receive_currency, 
        receive_amount,
        created_at,
        token,
        underpaid_amount,
        overpaid_amount,
        is_refundable,
    } = req.body
    try {
        if (! (purchase = await Purchase.findById(order_id))) {
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
				console.log("ORDER: ", order)
				const product = await Product.findOneAndUpdate(
					{_id: productId}, 
					{state: ProductState.SOLD, buyerUsername: order.buyerUsername, dateSold: Date.now()}
				)
				console.log("PRODUCT: ", product)
			}

			purchase.state = PurchaseState.SUCCESSFUL
			await purchase.save()
		}
    } catch (error) {
        console.log(error)
    }
}

handlePurchaseCallbackCanceledStatus = async (req) => {
    const {
        id, 
        order_id, 
        status, 
        pay_amount, 
        pay_currency, 
        price_currency, 
        receive_currency, 
        receive_amount,
        created_at,
        token,
        underpaid_amount,
        overpaid_amount,
        is_refundable,
    } = req.body
    try {
        if (! (purchase = await Purchase.findById(order_id))) {
			json = {status: constants.status.ERROR, errorMessage: "purchase entry doesn't exist"}
		}
		else if (purchase.token !== token) {
			json = {status: constants.status.ERROR, errorMessage: "purchase token incorrect"}
		}
		else {
			console.log("PURCHASE: ", purchase)
			for(const productId of purchase.productIds) {
				const order = await Order.findOneAndRemove(
					{productId: productId}
				)
				console.log("ORDER: ", order)
				const product = await Product.findOneAndUpdate(
					{_id: productId}, 
					{state: ProductState.LISTED, buyerUsername: null, dateSold: null, reserverUsername: null}
				)
				console.log("PRODUCT: ", product)
                const cart = new Cart({buyerUsername: purchase.buyerUsername, productId: productId})
                cart.save()
			}

			purchase.state = PurchaseState.FAILED
			await purchase.save()
		}
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
	calculatePriceOfReserved,
	reserveCartProducts,
	unreserveProducts,
    handlePurchaseCallbackPaidStatus,
    handlePurchaseCallbackCanceledStatus,
}
