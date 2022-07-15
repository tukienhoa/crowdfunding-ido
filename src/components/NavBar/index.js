import React, { useState, useEffect } from 'react';
import { Nav, Navbar, Container, Button, Form, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';

import {getCookie} from '../../utils/cookie';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../NavBar/NavBar.css';

const NavBar = ({isLoggedIn}) => {

    const handleLogOut = () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "privateKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "publicKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "balance=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        window.location.href = "/";
    }

    const connectWallet = () => {
        alert('asd');
    }

    // Nav bar for not logged in user
    const MyNav = (
        <div className="mystarter-nav">
            <button className="connect-mm-btn" onClick={connectWallet}>Connect Wallet</button>
        </div>
    )

    // Nav bar for logged in user
    const LoggedInNav = (
        <div className="mystarter-nav">
            <Button variant="warning" className="nav-balance-btn">Balance: {getCookie("balance")}</Button>
            <DropdownButton variant="success" align="end" title={getCookie("publicKey").substring(0, 20) + '...'} id="dropdown-menu-align-end">
                {/* <Dropdown.Item onClick={() => handleViewWallet()}>My Wallet</Dropdown.Item> */}
                {/* <Dropdown.Divider /> */}
                <Dropdown.Item>Log Out</Dropdown.Item>
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
                {isLoggedIn === false ? MyNav : LoggedInNav}
            </Navbar.Collapse>
        </Container>
        </Navbar>
    )
}

export default NavBar;