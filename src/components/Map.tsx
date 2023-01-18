/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import css from './Map.module.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layer } from 'leaflet';
import { Button } from './Button';
import { getMapSettings, MapType } from '../control/MapControl';
import { addLocation, EmptyFeature, Feature, getLocations, hasLocation, LocationCategory, removeLocation } from '../control/MapStateControl';

export const Map: React.FC = () => {
    const [mapSettings, SetMapSettings] = useState(getMapSettings(MapType.Japan));
    const [vistedLocations, setVisitedLocations] = useState(getLocations(LocationCategory.Visited));
    const [bookmarkedLocations, setBookmarkedLocations] = useState(getLocations(LocationCategory.Bookmarked));

    const [currentFeature, setCurrentFeature] = useState<Feature>(EmptyFeature);
    const [switchClicked, setSwitchClicked] = useState(false);
    const [langaugeSwitched, setLangaugeSwitched] = useState(false);

    const geoJsonLayer = useRef<any>(null);

    const getFeatureName = (feature: any): string => langaugeSwitched ? feature.name_ja : feature.name;
    const hasVisitedCurrentFeature = hasLocation(currentFeature, vistedLocations);
    const hasBookmarkedCurrentFeature = hasLocation(currentFeature, bookmarkedLocations);

    useEffect(() => {
        if (geoJsonLayer.current) {
            geoJsonLayer.current.clearLayers().addData(mapSettings.features).setStyle(style);
        }
    }, [mapSettings]);

    const onFeature = ( feature: any, layer: Layer ): void => {
        layer.on('click', () => {
            setCurrentFeature(feature.properties);
        });
    };

    const style = (feature: any): any => {
        const isVisited = hasLocation(feature.properties, vistedLocations);
        const isBookMarked = hasLocation(feature.properties, bookmarkedLocations);
        const isHighlighted = feature.properties.name === currentFeature.name;
        const mapStyle = {
            fillColor: isVisited ? 'red' : isBookMarked ? 'gold' : isHighlighted ? 'pink' : 'white',
            weight: 1,
            opacity: 1,
            color: isVisited || isBookMarked ? 'white' : 'red',
            dashArray: '3',
            fillOpacity: isHighlighted ? 0.6 : isVisited || isBookMarked ? 0.7 : 0.5,
        };

        return mapStyle;
    };

    const handleVisit = (): void => {
        if (hasVisitedCurrentFeature) {
            removeLocation(LocationCategory.Visited, currentFeature, setVisitedLocations);
        } else {
            addLocation(LocationCategory.Visited, currentFeature, setVisitedLocations);
            if (hasBookmarkedCurrentFeature) {
                removeLocation(LocationCategory.Bookmarked, currentFeature, setBookmarkedLocations);
            }
        }
    };

    const handleBookmark = (): void => {
        hasBookmarkedCurrentFeature
            ? removeLocation(LocationCategory.Bookmarked, currentFeature, setBookmarkedLocations)
            : addLocation(LocationCategory.Bookmarked, currentFeature, setBookmarkedLocations);
    };

    return (<>
        <MapContainer className={css.mapContainer} center={mapSettings.position} zoom={5} >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
                ref={geoJsonLayer}
                data={mapSettings.features}
                onEachFeature={onFeature}
                style={style}
            />
        </MapContainer>
        {currentFeature.name.length > 0 && <div className={css.featureControl}>
            <div className={css.featureName}>
                {getFeatureName(currentFeature)}
            </div>
            <div className={css.buttonBar}>
                <Button
                    className={hasVisitedCurrentFeature ? `${css.buttonRed} ${css.buttonCancel}` : css.buttonRed}
                    label={langaugeSwitched ? '行った' : 'Went'}
                    onClick={handleVisit} />
                {!hasVisitedCurrentFeature && <Button
                    className={hasBookmarkedCurrentFeature ? `${css.buttonYellow} ${css.buttonCancel}` : css.buttonYellow}
                    label={langaugeSwitched ? '行きたい' : 'Wanna'}
                    onClick={handleBookmark} />}
            </div>
        </div>}
        <div className={css.generalControl}>
            <Button
                className={switchClicked ? css.buttonRed : css.buttonGreen}
                label={switchClicked ? (langaugeSwitched ? '日本' : 'Japan') : (langaugeSwitched ? '世界' : 'World')}
                onClick={() => {
                    setSwitchClicked(!switchClicked);
                    SetMapSettings(getMapSettings(!switchClicked ? MapType.World : MapType.Japan));
                    setCurrentFeature(EmptyFeature);
                }} />
            <Button
                className={css.buttonBlue}
                label={langaugeSwitched ? 'English' : '日本語'}
                onClick={() => {
                    setLangaugeSwitched(!langaugeSwitched);
                }} />
        </div>
    </>);
};

