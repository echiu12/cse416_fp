import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'
import {
    Cart,
    Checkout,
    HomeScreen,
    Listings,
    ListItem,
    NavigationBar,
    Orders,
    ProductPage,
    ProfileScreen,
    ViewProfile,
    ViewMyProfile,
    Wallet,
    EditItem,
	ThankyouPage
} from './components'
/*
    This is our application's top-level component and entry-point
    for our application.
    
    @author Eric Grunblatt
*/
export default function App() {

    return (
        <BrowserRouter>
            <AuthContextProvider>
                <GlobalStoreContextProvider>              
                    <NavigationBar />
                    <Switch>
                        <Route path="/" exact component={HomeScreen} />
                        <Route path="/editprofile" exact component={ProfileScreen} />
                        <Route path="/wallet" exact component={Wallet} />
                        <Route path="/orders" exact component={Orders} />
                        <Route path="/listings" exact component={Listings} />
                        <Route path="/cart" exact component={Cart} />
                        <Route path="/listitem" exact component={ListItem} />
                        <Route path="/edititem/:id" exact component={EditItem} />
                        <Route path="/checkout" exact component={Checkout} />
                        <Route path="/product/:id" exact component={ProductPage} />
						<Route path="/viewprofile" exact component={ViewProfile} />
                        <Route path="/myprofile" exact component={ViewMyProfile} />
						<Route path="/thankyou" exact component={ThankyouPage} />
                    </Switch>   
                </GlobalStoreContextProvider>
            </AuthContextProvider>
        </BrowserRouter>
    );
}
