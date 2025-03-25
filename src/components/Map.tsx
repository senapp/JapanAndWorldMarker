/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import css from './Map.module.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layer } from 'leaflet';
import { Button } from './Button';
import { getMapSettings, MapType } from '../control/MapControl';
import { addLocation, EmptyFeature, Feature, getLocations, hasLocation, LocationCategory, recordLocations, removeLocation, resetLocations } from '../control/MapStateControl';

export const Map: React.FC = () => {
    const [mapSettings, SetMapSettings] = useState(getMapSettings(MapType.Japan));
    const [vistedLocations, setVisitedLocations] = useState(getLocations(LocationCategory.Visited));
    const [bookmarkedLocations, setBookmarkedLocations] = useState(getLocations(LocationCategory.Bookmarked));

    const [currentFeature, setCurrentFeature] = useState<Feature>(EmptyFeature);
    const [switchClicked, setSwitchClicked] = useState(false);
    const [langaugeSwitched, setLangaugeSwitched] = useState(false);

    const geoJsonLayer = useRef<any>(null);
    const inputRef = useRef<any>(null);

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

    const importDataButton = (): void => {
        let element = document.getElementById("import_file");
        if (!element) {
            return;
            //Error
        }

        if (element.getAttribute('listener') !== 'true') {
            element.setAttribute('listener', 'true');
            element.addEventListener('change', (event) => {
                const file = (event.target as HTMLInputElement).files![0];
                importDataHandler(file);
              });
        }

        element.click();
    }

    const importDataHandler = (file: File): void => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            try {
                const listOfString = (reader.result as string).split("\n");
                const listOfBookmarked = listOfString.splice(1, listOfString.indexOf('---VISITED---') - 1);
                const listOfVisited = listOfString.splice(listOfString.indexOf('---VISITED---') + 1);

                resetLocations();
                recordLocations(LocationCategory.Bookmarked, listOfBookmarked);
                recordLocations(LocationCategory.Visited, listOfVisited);
                setVisitedLocations(listOfVisited);
                setBookmarkedLocations(listOfBookmarked);
                inputRef.current.value = "";
            } catch (e) {
                console.log(e)
                inputRef.current.value = "";
            }
        }, false);
        if (file.name.endsWith(".marker")) {
            reader.readAsText(file);
        } else {
            inputRef.current.value = "";
        }
    }

    const exportData = (): void => {
        let bookmarked = ['---BOOKMARKED---', ...getLocations(LocationCategory.Bookmarked)];
        let visited = ['---VISITED---', ...getLocations(LocationCategory.Visited)];
        const list = [...bookmarked, ...visited];
        const result = list.join('\n');

        downloadContentAsFile(result, "exported_data.marker")
    }

    const downloadContentAsFile = (data: string, fileNameWithExtension: string) => {
        const blob = new Blob([data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = fileNameWithExtension;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);
    }

    return (<>
        <MapContainer className={css.mapContainer} center={mapSettings.position} zoom={5} >
            <TileLayer attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'} url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} />
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
        <div className={css.generalControlTop}>
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
        <div className={css.generalControlBottom}>
            <Button
                className={css.buttonGreen}
                label={!langaugeSwitched ? 'Export' : 'エクスポート'}
                onClick={() => {
                    exportData();
                }} />
            <Button
                className={css.buttonYellow}
                label={!langaugeSwitched ? 'Import' : 'インポート'}
                onClick={() => {
                    importDataButton();
                }} />
            <input type="file" ref={inputRef} accept='.marker' id="import_file"  className={css.hiddenUpload} />
        </div>
    </>);
};

