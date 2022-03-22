import React from "react";
import { useHistory } from "react-router-dom";

export default function HomeProduct() {
    const history = useHistory();

    return (
        <div className="home-product">
            <div onClick={() => {history.push("/product")}} className="home-product-picture" style={{ cursor: 'pointer', margin: '2vw 0px 0px 2vw', width: '15vw', height: '15vw', border: 'black 1px solid', borderRadius: '10px', boxShadow: '0px 2px 5px 2px rgba(0, 0, 0, 0.2)' }}>

            </div>
            <div onClick={() => {history.push("/product")}} className="home-product-information" style={{ cursor: 'pointer', margin: '0px 0px 0px 2vw', width: '15vw', height: '8vw', background: '#B1B1B1', border: 'grey 1px solid', borderRadius: '10px', boxShadow: '0px 2px 5px 2px rgba(0, 0, 0, 0.2)' }}>
                <div className="product-name" style={{ margin: '0px 0.5px 0px 0.5vw', fontFamily: 'Quicksand', fontSize: '2.25vw'}}>
                    Chair Chair 
                </div>
                <div className="product-price" style={{ marginBottom: '50px', fontFamily: 'Quicksand', fontSize: '1.75vw' }}>
                    <div style={{ display: 'inline-block', margin: '0px 0.5vw 0px 0.5vw'}}>
                        500
                    </div>
                    <div style={{ display: 'inline-block' }}>Algo</div>
                </div>
            </div>
        </div>
    )
}