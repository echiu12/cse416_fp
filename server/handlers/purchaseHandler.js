const dotenv = require('dotenv')
const { client, testClient, Client, Config } = require('coingate-v2');
const { Purchase, PurchaseState } = require('../models/purchaseModel')
const { Product, ProductState } = require('../models/productModel')
const sdk = require('api')('@wyre-hub/v4#2vj9qg38l33twf3q');

dotenv.config()

// COINGATE CLIENT
const coingateClient = testClient(process.env.COINGATE_AUTH);

generateInvoiceDescription = async (purchase) => {
    try {
        return await purchase.productIds.reduce(async (memo, productId) => {
            const product = await Product.findById(productId)
            const description = await memo;
            if (description === "") {
                return `${product.name}`
            }
            else {
                return (await memo) + `, ${product.name}`
            }
        }, "")
    }
    catch (err) {
        return ""
    }
}

createPurchase = async (user, price_amount, price_currency, receive_currency) => {
	let purchase = null
	try {
		purchase = new Purchase({
			buyerUsername: user.username,
			productIds: reservedProductIds,
			price: price_amount,
		})

        console.log(`CALLBACK URL: ${process.env.COINGATE_CALLBACK_URL}`)

        const invoiceDescription = await generateInvoiceDescription(purchase)

		const invoice = await coingateClient.createOrder({
			order_id: purchase._id,
			price_amount: price_amount,
			price_currency: price_currency,
			receive_currency: receive_currency,
			title: `Cryptorium OrderId#${purchase._id}`,
			description: invoiceDescription,
			callback_url: process.env.COINGATE_CALLBACK_URL,
			cancel_url: "https://cryptorium.herokuapp.com",
			success_url: "https://cryptorium.herokuapp.com/thankyou",
			purchaser_email: user.email,
		})
		
		console.log("INVOICE: ", invoice)
		
		const {
			payment_url,
			token,
		} = invoice
		
		purchase.thirdPartyOrderId = invoice.id
		purchase.token = token
		purchase.invoice = payment_url
		purchase.save()
	} catch (err) {
		console.log(err)
		console.log(err.response.response.data)
		purchase = null
	}
	return purchase
}

getConversion = async (from, to) => {
    try {
        console.log("FROM: ", from)
        console.log("TO: ", to)
        const exchangeRates = await sdk.GetExchangeRates()
        console.log("EXCHANGE RATES: ", exchangeRates)
        return exchangeRates[from+to]
    }
    catch(err) {
        console.log(err)
        return 1
    }
}

module.exports = {
	coingateClient,
	createPurchase,
    getConversion,
}