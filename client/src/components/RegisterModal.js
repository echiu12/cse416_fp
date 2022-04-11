import { useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import AuthContext from '../auth'
import AccountErrorModal from './AccountErrorModal'


/*
    This modal is shown when the user asks to delete a list. Note 
    that before this is shown a list has to be marked for deletion,
    which means its id has to be known so that we can retrieve its
    information and display its name in this modal. If the user presses
    confirm, it will be deleted.
    
    @author Eric Grunblatt
*/
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    border: 'black 2px solid',
    borderRadius: '20px',
    boxShadow: 24,
    textAlign: 'center',
    pt: 2,
    px: 4,
    pb: 3,
  };

function RegisterModal() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [cont, setCont] = useState(false);
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [addressFirst, setAddressFirst] = useState("");
    const [addressSecond, setAddressSecond] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipcode, setZipcode] = useState("");

    let isOpen = false;

    if(store.registerModal) {
        isOpen = true;
    }
    const handleContinue = () => {
        setCont(true);
    }

    const handleBack = () => {
        setCont(false);
    }

    const handleRegister = (event) => {
        store.setCloseRegisterModal();
        event.preventDefault();
        if(password === confirm) {
            auth.registerUser({
                firstName: first,
                lastName: last,
                email: email,
                username: username,
                password: password,
                addressFirstLine: addressFirst,
                addressSecondLine: addressSecond,
                phoneNumber: phoneNumber,
                city: city,
                state: state,
                zipcode: zipcode
            }, store);
        }
        else {
            alert("Passwords must match");
        }
    }

    function handleLogin() {
        store.setOpenLoginModal();
    }

    let list = "";
    if(!cont) {
        list =
        <div>
            <Box>
                <h1 style={{ margin: '100px 0px 0px 0px' }}>Sign Up With</h1>
                <TextField 
                    required
                    name="firstName"
                    id="firstName"
                    label="First Name" 
                    value={first}
                    onChange={(event) => { setFirst(event.target.value) }}
                    style={{ display: 'flex', float: 'left', margin: '15px 15px 0px 0px', width: '242.5px' }}></TextField>
                <TextField 
                    required
                    name="lastName"
                    id="lastName"
                    label="Last Name" 
                    value={last}
                    onChange={(event) => { setLast(event.target.value) }}
                    style={{ display: 'flex', float: 'right', margin: '15px 0px 0px 0px', width: '242.5px' }}></TextField>
                <TextField 
                    required
                    name="email"
                    id="email"
                    label="Email Address" 
                    value={email}
                    onChange={(event) => { setEmail(event.target.value) }}
                    style={{ margin: '15px 0px 0px 0px', float: 'left', width: '500px' }}></TextField>
                <TextField 
                    required
                    name="username"
                    id="username"
                    label="Username"  
                    value={username}
                    onChange={(event) => { setUsername(event.target.value) }}
                    style={{ margin: '15px 0px 0px 0px', float: 'left', width: '500px' }}></TextField>
                <TextField 
                    required
                    type="password"
                    name="password"
                    id="password"
                    label="Password"  
                    value={password}
                    onChange={(event) => { setPassword(event.target.value) }}
                    style={{ margin: '15px 0px 0px 0px', float: 'left', width: '500px' }}></TextField>
                <TextField 
                    required
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    label="Confirm Password"
                    value={confirm} 
                    onChange={(event) => { setConfirm(event.target.value) }}
                    style={{ margin: '15px 0px 0px 0px', float: 'left', width: '500px' }}></TextField>
            </Box>
            <Button onClick={handleContinue} style={{ margin: '15px 0px 0px 0px', color: 'white', background: 'black', width: '150px', height: '40px', fontSize: '8px', borderRadius: '10px' }}><h1>Continue</h1></Button>
        </div>;
    } else {
        list =
        <div>
            <Box>
                <h1 style={{ margin: '100px 0px 0px 0px' }}>Enter Your Shipping Address</h1>
                <TextField 
                    required
                    name="addressFirstLine"
                    id="addressFirstLine"
                    label="Address Line 1" 
                    value={addressFirst} 
                    onChange={(event) => { setAddressFirst(event.target.value) }}
                    style={{ margin: '15px 0px 0px 0px', float: 'left', width: '500px' }}></TextField>
                <TextField 
                    name="addressSecondLine"
                    id="addressSecondLine"
                    label="Address Line 2" 
                    value={addressSecond} 
                    onChange={(event) => { setAddressSecond(event.target.value) }}
                    style={{ margin: '15px 0px 0px 0px', float: 'left', width: '500px' }}></TextField>
                <TextField 
                    required
                    name="city"
                    id="city"
                    label="City" 
                    value={city} 
                    onChange={(event) => { setCity(event.target.value) }}
                    style={{ margin: '15px 0px 0px 0px', float: 'left', width: '500px' }}></TextField>
                <TextField 
                    required
                    name="state"
                    id="state"
                    label="State" 
                    value={state} 
                    onChange={(event) => { setState(event.target.value) }}
                    style={{ display: 'flex', float: 'left', margin: '15px 15px 0px 0px', width: '242.5px' }}></TextField>
                <TextField 
                    required
                    name="zipcode"
                    id="zipcode"
                    label="Zip Code"  
                    value={zipcode} 
                    onChange={(event) => { setZipcode(event.target.value) }}
                    style={{ display: 'flex', float: 'right', margin: '15px 0px 0px 0px', width: '242.5px' }}></TextField>
                <TextField 
                    required
                    name="phoneNumber"
                    id="phoneNumber"
                    label="Phone Number"  
                    value={phoneNumber} 
                    onChange={(event) => { setPhoneNumber(event.target.value) }}
                    style={{ margin: '15px 0px 0px 0px', float: 'left', width: '500px' }}></TextField>
                <Button onClick={handleBack} style={{ margin: '15px 20px 0px 0px', color: 'white', background: 'black', width: '150px', height: '40px', fontSize: '8px', borderRadius: '10px' }}><h1>Back</h1></Button>
                <Button onClick={(event) => { handleRegister(event) }} style={{ cursor: 'pointer', margin: '15px 0px 0px 0px', color: 'white', background: 'black', width: '150px', height: '40px', fontSize: '8px', borderRadius: '10px' }}><h1>Register</h1></Button>
            </Box>
        </div>;
    }

    return (
        <div>
            <Modal
                open={isOpen}
                aria-labelledby="delete-modal">
                <Box 
                    className="modal-dialog"
                    sx={{ ...style, width: 500 }}
                >
                    <h1 onClick={handleLogin} className="login" style={{ cursor: 'pointer', margin: '10px 0px 0px 60px', float: 'left', display: 'inline-block' }}>
                        Login
                    </h1>
                    <hr style={{ margin: '30px 0px 0px 78px', display: 'inline-block', float: 'left', color: 'black', width: '50px', rotate: '90deg', background: '#AEAEAE', border: '#AEAEAE 2px solid', borderRadius: '2px'   }}></hr>
                    <h1 className="register" style={{ margin: '10px 60px 0px 0px', float: 'right', display: 'inline-block' }}>
                        Register
                    </h1>
                    <hr style={{ margin: '40px 0px 0px -140px', display: 'inline-block', float: 'left', width: '250px', background: '#AEAEAE', border: '#AEAEAE 2px solid', borderRadius: '2px 0px 0px 2px' }}></hr>
                    <hr style={{ margin: '-4px -0px 0px 0px', display: 'inline-block', float: 'right', width: '250px', background: '#0038FF', border: '#0038FF 2px solid', borderRadius: '0px 2px 2px 0px' }}></hr>
                    <Box component="form" onSubmit={handleRegister} noValidate>
                        {list}
                    </Box>
                    
                </Box>
            </Modal>
            <AccountErrorModal />
        </div>
    );
}

export default RegisterModal;