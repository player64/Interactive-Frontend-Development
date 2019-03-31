import '../styles/index.scss';

const loadGoogleMapsApi = require('load-google-maps-api');

loadGoogleMapsApi(
    {
        key: 'AIzaSyACc7KrutzJRAbkiTOAMuxM568LrJ8XOjE',
        libraries: ['places']
    }
).then((googleMaps) => {

    //document.querySelector('.map')
    // document selectors
    const selectors = {
        map: document.getElementById('map'),
        autocomplete: document.getElementById('autocomplete'),
        moreBtn: document.getElementById('more')
    };

    // map & autocomplete definition
    let map;
    let autocomplete;
    let places;
    let getNextPage = null;
    const markers = [];
    const hostnameRegexp = new RegExp('^https?://.+?/');

    // load more results on click
    $('#more').click(() =>{
        selectors.moreBtn.disabled = true;
        if (getNextPage) getNextPage();
    });

    function initMap() {
        map = new googleMaps.Map(selectors.map, {
            center: {
                lat: 40.7484405,
                lng: -73.9944191
            },
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            streetViewControl: false,
            zoom: 12
        });

        autocomplete = new googleMaps.places.Autocomplete(selectors.autocomplete, {
            types: ['(cities)']
        });

        places = new googleMaps.places.PlacesService(map);
        autocomplete.addListener('place_changed', onPlaceChanged);
    }

    const onPlaceChanged = () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            // set the map position
            map.panTo(place.geometry.location);
            map.setZoom(15);
            // $('#map').css('opacity', 1);
            $('body').addClass('showMap');
            search();
        } else {
            document.getElementById('autocomplete').placeholder = 'Enter a city';
        }
    };

    const search = () => {
        // search configuration
        const search = {
            bounds: map.getBounds(),
            types: ['lodging']
        };

        places.nearbySearch(search, function(results, status, pagination)  {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // add more results if any
                selectors.moreBtn.disabled = !pagination.hasNextPage;
                getNextPage = pagination.hasNextPage && function() {
                    pagination.nextPage();
                };
                console.log(results);
            }
        });
    };

    // fire the app
    initMap();


}).catch(function (error) {
    console.error(error);
});