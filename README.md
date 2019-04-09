# Travel guide
The application allows users to search for their next holiday destination. 
It's helping find in selected destination:
* Tourist attractions
* Accommodation
* Bars and restaurants

## UX
The project is built in the minimal layout on start a user needs to type into the type field the destination which it uses google autocomplete API so suggested results are appearing automatically and filter the results during typing. After selecting the destination the results are appearing in a readable way after clicking the element on the result navigation or on the map it's showing the place information such as address, website, rating, phone number. User can filter the results.

[The wireframe](https://xd.adobe.com/view/cff591a8-68c9-4de2-64fb-f9895b978a5c-b9c4/)

### Features
The project is using: 
* Google autocomplete for destination search suggestion
* Google maps for display a map and 
* Google places for display results and their details
* Unsplash API for pulling the background image from random location defined in JS array

### Features to implement
Display all results on the map currently the app allows displaying the results from one category only. The background isn't scaling very well on mobile.

## Technologies used
* HTML5
* ES6 Support via [babel (v7)](https://babeljs.io/)
    * The project uses babel for compiling ES7 to ES5
* [Google Maps](https://developers.google.com/places/web-service/intro) 
     * The project uses google maps for displaying the map, Google places and Google autocomplete
* [JQuery](https://jquery.com/)
    * The project uses jquery for DOM manipulation and AJAX calls
* [SCSS](https://sass-lang.com/)
    * The project uses SCSS Preprocessors for compiling to CSS
* [Webpack](https://webpack.js.org/)
    * The project uses webpack for bundling the assets
* [Unsplash API](https://unsplash.com/developers)
    * The project uses Unsplash API for pulling the background images
+ AdobeXD [wireframe](https://xd.adobe.com/view/cff591a8-68c9-4de2-64fb-f9895b978a5c-b9c4/)

## Testing
* The website has been passed [HTML validation](https://validator.w3.org/nu/?doc=https%3A%2F%2Fplayer64.github.io%2FInteractive-Frontend-Development%2F)
* The website has been passed [CSS validation](https://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Fplayer64.github.io%2FInteractive-Frontend-Development%2F&profile=css3svg&usermedium=all&warning=1&vextwarning=)
* The website has been tested on various screen sizes

No ideal scaling the background image on small screens.

## Deployment
The application is deployed to [GitHub pages](https://player64.github.io/Interactive-Frontend-Development/index.html) on subtree branch

### Source files
Source files are in src folder

### Compiled files
Compiled files are in build folder

### Installation
`npm install`

### Start Dev Server
`npm start`

### Build production version
When you run npm run build we use the mini-css-extract-plugin to move the css to a separate file. The css file gets included in the head of the index.html.

`npm run build`


## Credits
* Webpack [boilerplate](https://github.com/wbkd/webpack-starter)
* [Unsplash](https://unsplash.com) Free stock images





