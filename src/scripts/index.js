import '../styles/index.scss';

const loadGoogleMapsApi = require('load-google-maps-api');

loadGoogleMapsApi(
    {
        key: 'Your API key', //
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
    let placeFound = false;
    let infos = [];

    // place type definition
    const iconPath = '/Interactive-Frontend-Development/public/SVG';
    // const iconPath = '/public/SVG';
    const placeType = {
        bars: {
            types: ['food', 'restaurant', 'bar'],
            icon: {
                url: `${iconPath}/map-restaurant.svg`,
                scaledSize: new googleMaps.Size(35, 35),
            }
        },
        hotels: {
            types: ['lodging'],
            icon: {
                url: `${iconPath}/map-hotels.svg`,
                scaledSize: new googleMaps.Size(35, 35),
            }
        },
        attr: {
            types: ['museum', 'art_gallery', 'aquarium', 'stadium'],
            icon: {
                url: `${iconPath}/map-attractions.svg`,
                scaledSize: new googleMaps.Size(35, 35),
            }
        }
    };
    let markers = [];
    const hostnameRegexp = new RegExp('^https?://.+?/');

    // load more results on click
    $('#more').click(() => {
        selectors.moreBtn.disabled = true;
        if (getNextPage) getNextPage();
    });

    // app navigation
    $('.appNav button').click(function () {
        const _this = $(this);
        const parentList = _this.parent().parent();
        const parentLi = _this.parent();
        const target = _this.attr('data-target');

        if (parentLi.hasClass('active') || !(target in placeType)) {
            return false;
        }

        selectedPlaceType = placeType[target].types;
        placeMarker = placeType[target].icon;

        if (placeFound) {
            clearMarkers();
            clearResults();
            search();
        }

        parentList.find('li').removeClass('active');
        parentLi.addClass('active');
    });

    function initMap() {
        const mapStyle = {
            styles: [{"elementType": "geometry", "stylers": [{"color": "#ebe3cd"}]}, {
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#523735"}]
            }, {
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#f5f1e6"}]
            }, {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#c9b2a6"}]
            }, {
                "featureType": "administrative.land_parcel",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#dcd2be"}]
            }, {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#ae9e90"}]
            }, {
                "featureType": "landscape.natural",
                "elementType": "geometry",
                "stylers": [{"color": "#dfd2ae"}]
            }, {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{"color": "#dfd2ae"}]
            }, {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#93817c"}]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#a5b076"}]
            }, {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#447530"}]
            }, {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f1e6"}]
            }, {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [{"color": "#fdfcf8"}]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{"color": "#f8c967"}]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#e9bc62"}]
            }, {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry",
                "stylers": [{"color": "#e98d58"}]
            }, {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#db8555"}]
            }, {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#806b63"}]
            }, {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [{"color": "#dfd2ae"}]
            }, {
                "featureType": "transit.line",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#8f7d77"}]
            }, {
                "featureType": "transit.line",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#ebe3cd"}]
            }, {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [{"color": "#dfd2ae"}]
            }, {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#b9d3c2"}]
            }, {"featureType": "water", "elementType": "labels.text.fill", "stylers": [{"color": "#92998d"}]}]
        };

        map = new googleMaps.Map(selectors.map, mapStyle,
            {
                center: {
                    lat: 53.1976208,
                    lng: 16.6152481
                },
                mapTypeControl: false,
                panControl: false,
                zoomControl: false,
                streetViewControl: false,
                zoom: 5
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
            placeFound = true;
            clearMarkers();
            clearResults();
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
        // set default value if empty
        if (!selectedPlaceType) {
            selectedPlaceType = placeType['hotels'].types;
        }

        if (!placeMarker) {
            placeMarker = placeType['hotels'].icon;
        }
        // search configuration
        const search = {
            bounds: map.getBounds(),
            types: selectedPlaceType
        };

        places.nearbySearch(search, function (results, status, pagination) {
            if (status === googleMaps.places.PlacesServiceStatus.OK) {
                let key = (markers.length) ? markers.length : 0;
                let c = 0;
                results.forEach((result) => {
                    // add marker to the map

                    markers[key] = new googleMaps.Marker({
                        position: result.geometry.location,
                        animation: googleMaps.Animation.DROP,
                        icon: placeMarker
                    });

                    // call function to drop the marker
                    setTimeout(dropMarker(key), c * 100);


                    // add result navigation
                    addResult(result, key);

                    // add marker info
                    showInfoWindow(markers[key], key, result.place_id);

                    key += 1;
                    c += 1;
                });
                // add more results if any
                selectors.moreBtn.disabled = !pagination.hasNextPage;
                getNextPage = pagination.hasNextPage && function () {
                    pagination.nextPage();
                };
            } else {
                $('#resultsNav').append(`<div class="noResult error-message">No results found</div>`);
            }
        });
    };

    // build result navigation
    const addResult = (result, key) => {
        // create result as clickable button
        const button = document.createElement('div');
        button.classList.add('result');

        // add clickable event
        button.onclick = () => {
            googleMaps.event.trigger(markers[key], 'click');
        };

        // create button content
        let btnContent;

        btnContent = `<div class="ico">
                         <img src="${result.icon}" />
                        </div>`;

        btnContent += `<div class="resultContent">`;
        btnContent += `<h6 class="resultName">${result.name}</h6>`;
        if (placeRating(result.rating)) {
            btnContent += `<div class="rating">`;
            btnContent += `Rating ${placeRating(result.rating)}`;
            btnContent += `</div>`;
        }
        btnContent += `</div>`;
        button.innerHTML = btnContent;
        $('#resultsNav').append(button);
    };

    const placeRating = (rating) => {
        if (!rating) return false;
        let out = '';

        for (let i = 0; i < 5; i++) {
            out += (rating < (i + 0.5)) ? '&#10025;' : '&#10029;';
        }

        return out;
    };

    // Get the place details. Show the information in an info window,
    const showInfoWindow = (marker, key, placeID) => {
        // const marker = this;
        const windowInfo = new googleMaps.InfoWindow({
            maxWidth: 250,
        });

        googleMaps.event.addListener(marker, 'click', () => {
            places.getDetails({placeId: placeID},
                (place, status) => {
                    if (status !== googleMaps.places.PlacesServiceStatus.OK) {
                        return false;
                    }
                    closeInfoWindow();
                    highlightNavigation(key);
                    infos[0] = windowInfo;
                    windowInfo.setContent(buildInfoContent(place));
                    windowInfo.open(marker.getMap(), marker);
                });
        });
    };

    const highlightNavigation = (key) => {
        const navItems = $('#resultsNav').find('.result');

        // check is empty
        if (!navItems.length) return false;

        navItems.removeClass('active');

        navItems.each(function (i) {
            if (i === key) {
                const _this = $(this);
                const scrollContainer = $('#resultsNav').parent();

                _this.addClass('active');

                // calculate top position
                const topPos = _this.position().top;

                // apply the scroll
                scrollContainer.animate({
                    scrollTop: scrollContainer.scrollTop() + topPos
                }, 300);

                return true;
            }
        });
    };

    // build info content
    const buildInfoContent = (place) => {
        let infoContent = `<div class="infoWindow">`;
        infoContent += `<div class="title">`;
        infoContent += `<img src="${place.icon}" alt="${place.name}" />`;
        infoContent += `<h6>${place.name}</h6>`;
        infoContent += '</div>';

        infoContent += `<table>`;
        infoContent += `<tr><th>Address</th><td>${place.vicinity}</td></tr>`;

        if (place.international_phone_number) {
            const phone = place.international_phone_number;
            infoContent += `<tr><th>Phone</th><td><a href="tel:${phone}">${phone}</a></td></tr>`;
        }

        if (place.rating) {
            infoContent += `<tr><th>Rating</th><td>${placeRating(place.rating)}</td></tr>`;
        }

        if (place.website) {
            let website = hostnameRegexp.exec(place.website);
            if (website === null) {
                website = 'http://' + place.website + '/';
            }
            infoContent += `<tr><th></th><td><a href="${website}" target="_blank">Visit website</a></td></tr>`;
        }

        infoContent += `</table>`;
        infoContent += '</div>';

        return infoContent;
    };

    // close the other info windows
    const closeInfoWindow = () => {
        if (!infos.length) return false;
        infos[0].set('marker', null);
        infos[0].close();
        infos.length = 0;
    };


    // clear map from markers
    const clearMarkers = () => {
        for (let i = 0; i < markers.length; i++) {
            if (markers[i]) {
                markers[i].setMap(null);
            }
        }
        markers = [];
    };


    // clear the navigation
    const clearResults = () => {
        $('#resultsNav').html('');
    };

    const dropMarker = (key) => {
        return () => {
            markers[key].setMap(map);
        };
    };

    // load the picture by using UNPLASH API
    const loadBgPicture = () => {
        // defined destinations
        const destinations = [
            'Bangkok',
            'London',
            'Paris',
            'Dubai',
            'Berlin',
            'Singapore',
            'New York',
            'Kuala Lumpur',
            'Tokyo',
            'Istanbul',
            'Miami',
            'Budapest',
            'Alicante',
            'Valletta',
            'Seoul',
            'Antalya',
            'Phuket',
            'Hong Kong',
            'Milan',
            'Mallorca',
            'Barcelona',
            'Dublin',
            'Warsaw',
            'Prague',
            'Moscow',
            'Dubrovnik',
            'Lisbon',
            'Rome',
            'Buenos Aires',
            'Rio de Janeiro',
            'Honolulu',
            'Las Vegas',
            'Pattaya',
            'Osaka',
            'Bali'
        ];

        const placeKey = getRandomArray(destinations);

        const choosenPlace = {
            encoded: encodeURI(destinations[placeKey]).toLowerCase(),
            title: destinations[placeKey]
        };

        const apiKey = 'Your API key';
        let apiUrl = `https://api.unsplash.com/search/photos/?client_id=${apiKey}&orientation=landscape`;
        apiUrl += `&query=${choosenPlace.encoded}`;
        $.ajax({
            type: 'GET',
            url: apiUrl,
            async: true,
            success: (response) => {
                const place = response.results[getRandomArray(response.results)];
                let infoContent = `<div class="photoDescription">`;
                infoContent += `<h2>${choosenPlace.title}</h2>`;
                infoContent += (place.description) ? `<p>${place.description}</p>` : '';
                infoContent += '</div>';

                const body = $('body');
                body.append(infoContent);
                const img = `<img src="${place.urls.full}" alt="${place.alt_description}" class="bgImg">`;

                $(img).one('load', () => {
                    body.prepend(img);
                    body.removeClass('loading');
                });


            },
        });
    };

    const getRandomArray = (array) => {
        return Math.floor(Math.random() * Math.floor(array.length));
    };

    loadBgPicture();

    // fire the app
    initMap();


}).catch(function (error) {
    console.error(error);
    $('main.searchApp').append('<div class="error-message">There was a problem with load google maps. Error information you find in console</div>');
});
