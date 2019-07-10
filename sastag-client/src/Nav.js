import React from 'react';
// eslint-disable-next-line
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import SidebarIcon from './sidebar-icon.svg';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

export function SiteNavbar() {
  return (
    <Navbar bg="light" sticky="top" variant="light" className="border-bottom shadow-sm">
    	<Nav className="mr-auto">
    		<Nav.Item id="menu-button">
                <img src={SidebarIcon} className="nav mt-2 mr-3" alt="sidebar icon" />
            </Nav.Item>
            <Nav.Item>
                <span className="navbar-brand mb-0 h1" ><a href="/">Who's IT?</a></span>
            </Nav.Item>
        </Nav>
        <Nav>
            <Nav.Item>
            	<Button href="#" variant="outline-primary">Login/Sign Up</Button>
            </Nav.Item>
            <Dropdown as={NavItem} alignRight="true">
				<Dropdown.Toggle as={NavLink} className="text-primary">Menu</Dropdown.Toggle>
				<Dropdown.Menu>
					<Dropdown.Item>Home</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item>Players</Dropdown.Item>
					<Dropdown.Item>Analytics</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item>Add a Player</Dropdown.Item>
					<Dropdown.Item>Tag a Player</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
        </Nav>
    </Navbar>
  );
}