# Demo i-Vectors

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

This package is a demo for sound detection based on i-vectors.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)
* [Electron-prebuilt](https://github.com/electron-userland/electron-prebuilt)([Electron Website](http://http://electron.atom.io/))

## Contents
* [Installation and start](#installation-and-start)
* [How to use](#how-to-use)

## Installation and start
```sh
git clone https://github.com/Waxo/demo-ivectors
npm install
bower install
npm start
```
## How to use
`input` holds the input sounds that you want to classify.
Each folder contains sounds for the given cluster.

Example : 
```sh
input
├── Breathing
├── Cough
├── Dishes
├── DoorClapping
├── DoorOpening
├── ElectricalShaver
├── FemaleCry
├── FemaleScream
├── GlassBreaking
├── HairDryer
├── HandClapping
├── Keys
├── Laugh
├── MaleScream
├── Paper
├── Sneeze
├── Water
└── Yawn
```

Inside `public/img` you can put the images you want for each cluster. The image
name must match exactly the name of the repository inside input.

Example : `Breathing.jpg` or `Breathing.png`
