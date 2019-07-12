import React from 'react';
// eslint-disable-next-line
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/analytics-sidebar.css';
import './index.css';
import {Menu, Grid, ArrowLeft, GitMerge, PlusSquare, MinusSquare} from 'react-feather';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Form from 'react-bootstrap/Form';
import TimeFrameContext from './timeFrameContext';


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

function GetFeatherObject(props) {
    switch (props.feathername) {
        case 'Grid':
            return <Grid size={props.size || 18} color={props.color || "currentColor"} className="feather" />

        case 'GitMerge':
            return <GitMerge size={props.size || 18} color={props.color || "currentColor"} className="feather" />

        case 'PlusSquare':
            return <PlusSquare size={props.size || 18} color={props.color || "currentColor"} className="feather" />

        case 'MinusSquare':
            return <MinusSquare size={props.size || 18} color={props.color || "currentColor"} className="feather" />

        default:
            return null;

    }

}

function SidebarLink(props) {
    return (
        <Nav.Item as="li">
            <Nav.Link href={props.endpoint}><GetFeatherObject feathername={props.feathername} /> {props.linkText}</Nav.Link>
        </Nav.Item>
    );
}

class SiteSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedItem: null,
            playersExpanded: false,
        };
    }

    togglePlayers() {
        if (this.state.playersExpanded) {
            this.collapsePlayers();
        } else {
            this.expandPlayers();
        }
    }

    expandPlayers (){
        this.setState({
            playersExpanded: true,
        });
    }


    collapsePlayers () {
        this.setState({
            playersExpanded: false,
        });
    }


    render() {
        return (
            <React.Fragment>
            <Nav className={"px-0 bg-light col-sm-3 col-lg-2 sidebar" + (this.props.visible ? " active" : "")} id="sidebar">
                <div className="sidebar-sticky">
                    <div id="dismiss">
                        <ArrowLeft color="#007BFF" size={24} onClick={() => this.props.hideSidebar()} />
                    </div>
                    <div className="sidebar-header mx-4">
                        <h3 className="text-muted">Analytics Dashboard</h3>
                    </div>
                    <Nav as="ul" className="flex-column">
                        <Nav.Item as="li" className="mt-4 mx-3">
                            <Form>
                                <Form.Row className="mb-3">
                                    <TimeFrameContext />
                                </Form.Row>
                            </Form>
                        </Nav.Item>
                        <SidebarLink feathername="Grid" endpoint="#" linkText="Dashboard" />
                        <SidebarLink feathername="GitMerge" endpoint="#" linkText="Network" />
                        <Nav.Item as="li" onClick={() => this.togglePlayers()}>
                            <Nav.Link><GetFeatherObject feathername={(this.state.playersExpanded ? "MinusSquare" : "PlusSquare")} /> Players</Nav.Link>
                        </Nav.Item>
                    </Nav>
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