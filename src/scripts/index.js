import '../styles/index.scss';
const loadGoogleMapsApi = require('load-google-maps-api');

/*
    npm package through npm
    https://www.npmjs.com/package/load-google-maps-api#usage
 */
loadGoogleMapsApi(
    {
        key: '',
        libraries: ['places']
    }
).then(function (googleMaps) {
    const map = new googleMaps.Map(document.querySelector('.map'), {
        center: {
            lat: 40.7484405,
            lng: -73.9944191
        },
        zoom: 12
    });
    const countryRestrict = {'country': 'us'};
    const autocomplete = new googleMaps.places.Autocomplete(
        /** @type {!HTMLInputElement} */ (
            document.getElementById('autocomplete')), {
            types: ['(cities)'],
            componentRestrictions: countryRestrict
        });
    const places = new google.maps.places.PlacesService(map);
    autocomplete.addListener('place_changed', onPlaceChanged);

    const onPlaceChanged = () => {
      console.log('fired on place changed');
    };
}).catch(function (error) {
    console.error(error);
});