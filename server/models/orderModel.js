const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const OrderState = {
	PENDING: "PENDING",
	SUCCESSFUL: "SUCCESSFUL",
	FAILED: "FAILED"
}

const OrderSchema = new Schema(
	{
		buyerUsername: {type: String, required: true},
		productId: {type: ObjectId, required: true},
		state: {type: String, default: OrderState.PENDING}
	},
	{ timestamps: true },
)

OrderSchema.index({
	productId: 1,
}, {
	unique: true,
})

const Order = mongoose.model('Order', OrderSchema)

Order.on('index', error => {
	if (error) {
		console.log(error)
	}
})

module.exports = {
	Order: Order,
	OrderState: OrderState,
}
