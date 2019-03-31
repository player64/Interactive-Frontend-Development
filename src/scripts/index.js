import '../styles/index.scss';

const loadGoogleMapsApi = require('load-google-maps-api');

loadGoogleMapsApi(
    {
        key: '',
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
    let selectedPlaceType = null;
    let placeMarker = null;
    let visibleMap = false;

    // place type definition
    const placeType = {
        bars: {
            types: ['food', 'restaurant', 'bar'],
            icon: '/public/1x/map-restaurant.png'
        },
        hotels: {
            types: ['lodging'],
            icon: '/public/1x/map-hotels.png'
        },
        attr: {
            types: ['museum', 'art_gallery', 'aquarium', 'stadium'],
            icon: '/public/1x/map-attractions.png'
        }
    };
    let markers = [];
    const hostnameRegexp = new RegExp('^https?://.+?/');

    // load more results on click
    $('#more').click(() =>{
        selectors.moreBtn.disabled = true;
        if (getNextPage) getNextPage();
    });

    // app navigation
    $('.appNav button').click(function() {
        const _this = $(this);
        const parentList = _this.parent().parent();
        const parentLi = _this.parent();
        const target = _this.attr('data-target');

        if (parentLi.hasClass('active') || !(target in placeType)) {
            return false;
        }

        selectedPlaceType = placeType[target].types;
        placeMarker = placeType[target].icon;

        if (visibleMap) {
            clearMarkers();
            search();
        }

        parentList.find('li').removeClass('active');
        parentLi.addClass('active');

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
            visibleMap = true;
            clearMarkers();
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
        // check is types empty
        if (!selectedPlaceType) {
            selectedPlaceType =  placeType['hotels'].types;
        }

        if (!placeMarker) {
            placeMarker = placeType['hotels'].icon;
        }
        // search configuration
        const search = {
            bounds: map.getBounds(),
            types: selectedPlaceType
        };

        places.nearbySearch(search, function(results, status, pagination)  {
            if (status === googleMaps.places.PlacesServiceStatus.OK) {
                let key = (markers.length) ? markers.length : 0;
                let c = 0;
                results.forEach((item) => {
                    markers[key] = new googleMaps.Marker({
                        position: item.geometry.location,
                        animation: googleMaps.Animation.DROP,
                        icon: placeMarker
                    });
                    setTimeout(dropMarker(key), c  * 100);
                    key+=1;
                    c+=1;
                });
                // add more results if any
                selectors.moreBtn.disabled = !pagination.hasNextPage;
                getNextPage = pagination.hasNextPage && function() {
                    pagination.nextPage();
                };
            }
        });
    };

    const clearMarkers = () => {
        for (let i = 0; i < markers.length; i++) {
            if (markers[i]) {
                markers[i].setMap(null);
            }
        }
        markers = [];
    };

    const dropMarker = (key) => {
        return () => {
            markers[key].setMap(map);
        };
    };

    // fire the app
    initMap();


}).catch(function (error) {
    console.error(error);
});