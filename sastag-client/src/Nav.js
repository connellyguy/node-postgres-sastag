import React from 'react';
// eslint-disable-next-line
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/analytics-sidebar.css';
import './index.css';
import { Menu } from 'react-feather'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';


class SiteNavbar extends React.Component {
    render() {
        return (
            <Navbar bg="light" sticky="top" variant="light" className="border-bottom shadow-sm">
            	<Nav className="mr-auto">
            		<Nav.Item id="menu-button">
                        <Menu color="#007BFF" size={24} className="nav mt-2 mr-3" alt="sidebar icon" onClick={() => this.props.showSidebar()}/>
                    </Nav.Item>
                    <Nav.Item>
                        <span className="navbar-brand mb-0 h1" ><a href="/">Who's IT?</a></span>
                    </Nav.Item>
                </Nav>
                <Nav>
                    <Nav.Item>
                    	<Button href="#" variant="outline-primary">Login/Sign Up</Button>
                    </Nav.Item>
                    <Dropdown as={NavItem} alignRight={true}>
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
}

class SiteSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedItem: null,
        };
    }

    render() {
        return (
            <React.Fragment>
            <Nav className={"px-0 bg-light col-sm-3 col-lg-2 sidebar" + (this.props.visible ? " active" : "")} id="sidebar">
                <div className="sidebar-sticky">
                    <div className="sidebar-header mx-4">
                        <h3 className="text-muted">Analytics Dashboard</h3>
                    </div>
                </div>
            </Nav>
            <Overlay visible={this.props.visible} onClick={() => this.props.hideSidebar()} />
            </React.Fragment>
        );
    }
}

function Overlay(props) {
    return (
        <div className={"overlay" + (props.visible ? " active" : "")} onClick={() => props.onClick()} ></div>
    );
}

class SiteNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
        };
    }

    setActive() {
        this.setState({
            active: true,
        })
    }

    setInactive() {
        this.setState({
            active: false,
        })
    }

    render() {
        return (
            <React.Fragment>
                <SiteNavbar showSidebar={() => this.setActive()}/>
                <SiteSidebar hideSidebar={() => this.setInactive()} visible={this.state.active}/>
            </React.Fragment>
        );
    }
}

export default SiteNav;