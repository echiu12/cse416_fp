const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const UserSchema = new Schema(
	{
		firstName:			{type: String, required: true},
		lastName:			{type: String, required: true},
		username:			{type: String, required: true, index:{ unique: true}},
		email:				{type: String, required: true, index:{ unique: true}},
		passwordHash: 		{type: String, required: true},
		phoneNumber: 		{type: String, required: true},
		addressFirstLine: 	{type: String, required: true},
		addressSecondLine: 	{type: String, default: ""},
		city: 				{type: String, required: true},
		state: 				{type: String, required: true},
		zipcode: 			{type: String, required: true},
		profileImageId: 	{type: ObjectId, default: null},
		wallets: 			{type:[Object], default:[]}
	},
	{ timestamps: true },
)

const User = mongoose.model('User', UserSchema)

User.on('index', error => {
	if (error) {
		console.log(error)
	}
})

module.exports = User
