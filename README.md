# Demo I-Vectors

[![Vorpal cli app](https://img.shields.io/badge/cli--app-vorpal-ff69b4.svg)](http://vorpal.js.org/)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)


This package is a demo for sound detection based on i-vectors.

## Contents
* [Installation and start](#installation-and-start)
* [Why `touch input`](#why-touch-input-)
* [How to use](#how-to-use)

## Installation and start
```sh
npm install
touch input
npm start
```

## Why `touch input` ?
Input holds the input sounds that you want to classify.
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

## How to use
This is a vorpal app : just type help and you will see !  
*You must launch learn before trying to start any detection,
you don't have to learn every time you start the app*
