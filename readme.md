# app-engine
Webinate's App-Engine is a browser based editor that allows you to easily build complex
web applications. The engine is built to be highly customizable, and opens itself up to modification
through the use of server & client side plugins.

The goal of the application is to greatly simplify the creation, deployment and management of
interactive web apps.

* version 0.0.1

## Requirements

* Webinate Users
* Webinate Modepress
* NodeJS v4 and above
* Gulp (installation & building)
* Typescript

## Github Structure

The engine is broken down into 3 separate projects. Each is explained below.

* /server - The engine backend is actually a plugin for a separate piece of software called Modepress.
Modepress, is created by Webinate and is used as its simple content management system (much like Wordpress except written in Node).
The fildes within server, when compiled will be outputted into a dist folder. That folder is then copied to
the Modepress plugins directory and allows for the Engine to make its backend calls.

* /client - The client folder represents the front-end (browser) based code. This is also compiled into
a dist folder. This folder needs can be moved anywhere on a public directory of a web server. The files
can be served with Apache or Nginx, but its backend API calls must be made to to the modepress plugin.

* /admin-plugin - The admin plugin folder is a client side plugin that can be added to the modepress
client side plugins. This is used for administrators so they can interact with some of the more private
Engine settings.

## Installation

Coming soon

## Plugins

* [Basics](https://github.com/MKHenson/en-basics) - Basics gives the engine frequently used behaviours
which help you cut down on your own having to write your own basic logic scripts