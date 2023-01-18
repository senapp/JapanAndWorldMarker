/* eslint-disable @typescript-eslint/no-explicit-any */
import * as japan from '../../resources/japan.json';
import * as world from '../../resources/worldMid.json';

const JapanPosition = [37.881604, 136.075311];
const WorldPosition = [0, 0];

const JapanFeatures: any = japan;
const WorldFeatures: any = world;

export type MapSettings = {
    mapType: MapType;
    features: any;
    position: number[];
};

export enum MapType {
    Japan,
    World
}

export const getMapSettings = (mapType: MapType): MapSettings => {
    switch(mapType) {
        case MapType.World: return { mapType, features: WorldFeatures, position: WorldPosition };
        case MapType.Japan:
        default: return { mapType, features: JapanFeatures, position: JapanPosition };
    }
};