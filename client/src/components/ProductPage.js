import React, {useEffect, useState} from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Alert } from '@mui/material';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import qs from 'qs';
import { GlobalStoreContext } from '../store'
import { useContext } from "react";


export default function ProductPage() {
	const { store } = useContext(GlobalStoreContext);
	const history = useHistory();

	const pathname = window.location.pathname;
    const productId = pathname.split("/").pop();

	const [productName, setProductName] = useState("");
	const [productNum, setProductNum] = useState("");
	const [condition, setCondition] = useState("");
	const [description, setDescription] = useState("");
	const [seller, setSeller] = useState("");
	const [cost, setCost] = useState(0);
	const [shippingService, setShippingService] = useState("");
	const [itemImage0, setItemImage0] = useState(null);
	const [itemImages, setItemImages] = useState([]);
	const [cartAlert, setCartAlert] = useState("");
	const [shippingAlert, setShippingAlert] = useState("");
	const [shippingPrice, setShippingPrice] = useState(null);

	/* GET PRODUCTS BY USER ID */
    useEffect(() => {
        async function fetchData() {
            try{
                // getListingProductsForUser
                const urlGetProduct = 'http://localhost:4000/api/product/getProduct';
				// getShippingPrice
				const urlGetShippingPrice = 'http://localhost:4000/api/product/getShippingPrice';
                // POST 
				const options = {
					headers: { 'content-type': 'application/x-www-form-urlencoded' }
				};
                const data = qs.stringify({ '_id': productId });
				
				const requestProduct = axios.post(urlGetProduct, data, options);
				const requestShippingPrice = axios.post(urlGetShippingPrice, data, options);
				axios.all([requestProduct, requestShippingPrice]).then(axios.spread((...responses) => {
					const currProduct = responses[0].data.product;
					const shippingPrice = responses[1];
					// console.log("PRICE: ", shippingPrice.data.status);
					if(shippingPrice.data.status === "ERROR") {
						setCost(currProduct.price);
						// setShippingAlert("(shipping not included)");
					}
					else {
						setCost(currProduct.price);
						setShippingPrice(shippingPrice.data.shippingPrice);
						setShippingService(shippingPrice.data.shippingService);
						// setShippingAlert("(shipping included)");
					}
					
					setProductName(currProduct.name);
					setProductNum(currProduct._id);
					setDescription(currProduct.description);
					setCondition(currProduct.condition);
					setSeller(currProduct.sellerUsername);
					setItemImage0(currProduct.images[0]);
					setItemImages(currProduct.images);
				}));
            }
            catch{
            }
        }
        fetchData()
    },[]);

	/* IMAGES ON CLICK */
    const handleImage = (event) => {
        setItemImage0(itemImages[event.target.id]);
    };

	// ADD TO CART BUTTON
    const handleAddToCart = async function() {
        const url = 'http://localhost:4000/api/purchase/addToCart';
        // POST 
        const data = { '_id': productId };
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(data),
            url
        };
        axios(options).then(function(result){
			if(result.data.status === "OK") {
				history.push("/cart")
			}
			else {
				if(result.data.errorMessage === "Unauthorized") {
					store.setOpenLoginModal();
				}
				else {
					setCartAlert(<Alert severity="error">{result.data.errorMessage}! </Alert>);
				}
			}
		});
    };



	let showImages = 
        <div style={{ width: '40%', margin: '3% 0 0 3%', display: 'grid', gridTemplateColumns: 'repeat(4, 10vw)' }}>
            {itemImages.map((index, indexNum) => (
                index? 
                    <div key={indexNum} style={{cursor: "pointer", marginBottom: '20px' }}>
                        <img id={indexNum} src={`data:${index.mimetype};base64,${Buffer.from(index.data).toString('base64')}`} alt="" 
                        onClick={handleImage} title={index.title} width="100px" height="100px" style={{ borderRadius: '10%', border: "black 2px" }} ></img>
                    </div>:<div key={indexNum}></div>
            ))}
        </div>;

	
	const handleViewProfile = (seller) => {
		let json = {
			username: seller
		}
		console.log(json);
		store.getProfile(json);
	}
	
    return (
		<Box style={{ position: 'absolute', marginLeft: '10%', marginRight: '10%', marginTop: '60px', width: '79%', minHeight: '450px'}}>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 40vw)' }}>
				{/* LEFT IMAGES & DESCRIPTION */}
				<div>
					{/* THE MAIN IMAGE */}
					{itemImage0? <img src={`data:${itemImage0.mimetype};base64,${Buffer.from(itemImage0.data).toString('base64')}`} width="600px" height="400px" alt="" style={{ borderRadius: '10%' }} ></img>
						:<img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg" width="600px" height="600px" alt="" style={{ borderRadius: '10%' }} ></img>}
					{/* THE 8 IMAGES */}
					{showImages}
					{/* DESCRIPTION */}
					<div style={{ fontFamily: 'Quicksand', fontWeight: '500', fontSize: '40px', color: 'black' }}>
						<u> Description </u>
					</div>
					<div style={{ paddingBottom: '50px', paddingTop: '10px', fontFamily: 'Quicksand', fontSize: '20px', color: 'black' }}>
						{description}
					</div>
				</div>
				{/* RIGHT ABOUT THE ITEM */}
				<div style={{margin: '0 0 0 20%'}}> 
					<div style={{ fontFamily: 'Quicksand', fontWeight: 'bold', fontSize: '50px', color: 'black' }}>
                    	{productName}
					</div>
					<div style={{ paddingTop: '40px', textDecoration: 'none', fontFamily: 'Quicksand', fontSize: '20px', color: 'black' }}>
                    	Product #: {productNum}
					</div>
					<div style={{ paddingTop: '30px', textDecoration: 'none', fontFamily: 'Quicksand', fontSize: '20px', color: 'black' }}>
                    	Condition: {condition}
					</div>
					<div style={{ paddingTop: '30px', textDecoration: 'none', fontFamily: 'Quicksand', fontSize: '20px', color: 'black' }}>
                    	Seller: <div onClick={() => { handleViewProfile(seller) }} style={{ display: 'inline-block', cursor: 'pointer', color: '#879ED9'}}>{seller}</div>
					</div>
					
					<div style={{ paddingTop: '60px', textDecoration: 'none', fontFamily: 'Quicksand', fontWeight: 'bold', fontSize: '45px', color: 'black', textAlign: 'right' }}>
						{cost} Algo 
					</div>
					<div style={{ paddingBottom: '30px', fontSize: '20px', textAlign: 'right' }}>
						{shippingPrice? "Shipping Price: $":"Shipping not included"}{shippingPrice}
					</div>
					<Button onClick={handleAddToCart} className="add-to-cart-button" style={{ background: 'black', color: 'white', width: '32vw', height: '50px', borderRadius: '10px', fontFamily: 'Quicksand', fontSize: '20px', fontWeight: 'bold' }}>
						Add to Cart
					</Button>
					{cartAlert}
					<div style={{ paddingTop: '40px', fontFamily: 'Quicksand', fontWeight: '500', fontSize: '25px', color: 'black' }}>
                    	<u> Return &#38; Refund Policy </u>
					</div>
					<div style={{ paddingTop: '10px', fontFamily: 'Quicksand', fontSize: '20px', color: 'black', textAlign: 'right' }}>
						60 days returns
						seller pays for return shipping
					</div>
					<div style={{ paddingTop: '40px', fontFamily: 'Quicksand', fontWeight: '500', fontSize: '25px', color: 'black' }}>
                    	<u> Shipping Info </u>
					</div>
					<div style={{ paddingTop: '10px', paddingBottom: '80px', fontFamily: 'Quicksand', fontSize: '20px', color: 'black', textAlign: 'right' }}>
						{shippingService} Shipping through USPS. Shipping costs varies based on location
					</div>
				</div>
			</div>
            <LoginModal />
            <RegisterModal />
        </Box>  
    )
}


