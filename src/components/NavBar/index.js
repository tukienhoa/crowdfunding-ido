import React, { useState } from 'react';
import { Nav, Navbar, Container, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import {ethers} from 'ethers';

import {getCookie} from '../../utils/cookie';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../NavBar/NavBar.css';

const NavBar = () => {

    const [account, setAccount] = useState(getCookie("account"));
    const [balance, setBalance] = useState(getCookie("balance"));

    const [loginStatus, setLoginStatus] = useState(getCookie("account") ? true : false);

    const handleLogOut = () => {
        document.cookie = "account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "balance=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        window.location.href = "/";
    }

    const updateAccountInfo = (address) => {
        window.ethereum.request({ 
            method: "eth_getBalance", 
            params: [address, "latest"] 
        })
        .then((balance) => {
            setAccount(address);
            setBalance(ethers.utils.formatEther(balance));

            document.cookie = `account=${address}; max-age=86400; path=/;`;
            document.cookie = `balance=${ethers.utils.formatEther(balance)}; max-age=86400; path=/;`;
        });
    }

    const connectWallet = () => {
        if (window.ethereum) {
            // Get account
            window.ethereum.request({method:'eth_requestAccounts'})
            .then(res => {
                updateAccountInfo(res[0]);
                setLoginStatus(true);
            })
        }
        else {
            alert("Please install metamask extension");
        }
    }

    // Handle account changed
    window.ethereum.on('accountsChanged', (accounts) => {
        if (loginStatus) {
            updateAccountInfo(accounts[0]);
        }
    });

    // Nav bar for not logged in user
    const MyNav = (
        <div className="mystarter-nav">
            <button className="connect-mm-btn" onClick={connectWallet}>Connect Wallet</button>
        </div>
    )

    // Nav bar for logged in user
    const LoggedInNav = (
        <div className="mystarter-nav">
            <Button variant="warning" className="nav-balance-btn">{balance} ETH</Button>
            <DropdownButton variant="success" align="end" 
                            title={account.substring(0, 5) + '...' + account.substring(account.length - 4, account.length)} 
                            id="dropdown-menu-align-end">
                {/* <Dropdown.Item onClick={() => handleViewWallet()}>My Wallet</Dropdown.Item> */}
                {/* <Dropdown.Divider /> */}
                <Dropdown.Item onClick={handleLogOut}>Log Out</Dropdown.Item>
            </DropdownButton>
        </div>
    )

    return (
        <Navbar className="nav-bar">
        <Container fluid>
            <Navbar.Brand href="/" className="app-title">MyStarter</Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
                <Nav
                    className="me-auto my-2 my-lg-0"
                    style={{ maxHeight: '100px' }}
                    navbarScroll
                />
                {getCookie("account") ? LoggedInNav : MyNav}
            </Navbar.Collapse>
        </Container>
        </Navbar>
    )
}

export default NavBar;