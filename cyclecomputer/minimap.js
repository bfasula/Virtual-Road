

export function updateMapOL(gpxDataString) {
     // Initialize the map
     if (map === undefined) {
        map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM() // OpenStreetMap as the base layer
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([-0.1, 51.515]), // Center of the map (longitude, latitude)
                zoom: 12 // Initial zoom level
            })
        });
    }
        // Parse the GPX data string into features
        const gpxFormat = new ol.format.GPX();
        const features = gpxFormat.readFeatures(gpxDataString, {
            dataProjection: 'EPSG:4326', // GPX data is typically in WGS84 (EPSG:4326)
            featureProjection: 'EPSG:3857' // OpenLayers uses Web Mercator (EPSG:3857) for display
        });

        // Create a vector source and layer for the GPX data
        const vectorSource = new ol.source.Vector({
            features: features
        });

        const vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue', // Color of the track
                    width: 3 // Width of the track
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)' // Optional fill for areas (if applicable)
                })
            })
        });

        // Add the vector layer to the map
        map.addLayer(vectorLayer);

        // Fit the map view to the extent of the GPX data
        const extent = vectorSource.getExtent();
        map.getView().fit(extent, {
            padding: [50, 50, 50, 50], // Optional padding around the extent
            maxZoom: 15 // Maximum zoom level when fitting
        });
    
}


export function updateMarkerOL(lat, lon) {
    // Add a marker at a specific latitude and longitude
        const markerLonLat = [lon,lat]; // Replace with your desired longitude and latitude
        const markerCoordinates = ol.proj.fromLonLat(markerLonLat);

        // Create a marker feature
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(markerCoordinates)
        });

        // Style the marker (e.g., a red circle with a black outline)
        const markerStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: 'red'
                }),
                stroke: new ol.style.Stroke({
                    color: 'black',
                    width: 2
                })
            })
        });
        if (markerSource !== undefined) {
            markerSource.clear();
        }
    
        // Create a vector source and layer for the marker
         markerSource = new ol.source.Vector({
            features: [markerFeature]
        });
        
        const markerLayer = new ol.layer.Vector({
            //markerLayer = new ol.layer.Vector({
            source: markerSource,
            style: markerStyle
        });
            
        // Add the marker layer to the map
        map.addLayer(markerLayer);
    
      
      // Recenter map to marker
        map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
        map.getView().setZoom(15);
    /*
            map.getView().animate({
                center: markerCoordinates,
                zoom: 14,
                duration: 1000
            });
            */
        
    
}
