# SAS Tag 

A simple webapp for tracking who is IT and tag history for an office game of tag

## Description

When two friends began a game of tag on the SAS campus, we had no idea the team phenomenon it would become. We hope the T.A.G. Initiative will never die

## Getting Started

### Dependencies

Ubuntu (developed on a Raspberry Pi 1B+)

apt-get

node.js

npm (node package manager)

pm2 (process manager -- only necessary if planning to run always-on)

PostgreSQL

### Installing

After cloning the repo, run the following commands in the deployment folder:
```
sudo apt-get install npm
sudo npm i -g nodemon
npm i
```

This will install all the necessary dependencies based on the package.json file

PostgreSQL database details coming later...

Requires a .env file for configuration. Details coming later...

## Author
Joshua Connelly

## Version History
```
Date        Author          Description
08Apr2019   Josh Connelly   Initial commit

10Apr2019   Josh Connelly   Added modal tag window and message functionality

20May2019   Josh Connelly   Added html email template for tag alerts
```
