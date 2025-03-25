import { getSafeName } from '../utils/funcs';

export type Feature = {
    name: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    name_jp: string;
};

export const EmptyFeature: Feature = {
    name: '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    name_jp: '',
};

export enum LocationCategory {
    Visited,
    Bookmarked
}

const getSaveCode = (type: LocationCategory): string => {
    switch (type) {
        case LocationCategory.Bookmarked: return 'bk';
        case LocationCategory.Visited:
        default: return 'vl';
    }
};

export const addLocation = (locationCategory: LocationCategory, feature: Feature, setLocations: React.Dispatch<React.SetStateAction<string[]>>): void => {
    localStorage.setItem(`saved_${getSaveCode(locationCategory)}_` + getSafeName(feature.name), getSafeName(feature.name));
    setLocations(vistedLocations => [ ...vistedLocations, getSafeName(feature.name) ]);
};

export const removeLocation = (locationCategory: LocationCategory, feature: Feature, setLocations: React.Dispatch<React.SetStateAction<string[]>>): void => {
    localStorage.removeItem(`saved_${getSaveCode(locationCategory)}_` + getSafeName(feature.name));
    setLocations(locations => locations.filter((name) => name !== getSafeName(feature.name)));
};

export const getLocations = (locationCategory: LocationCategory): string[] => {
    const returnItems: string[] = [];
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.includes(`saved_${getSaveCode(locationCategory)}_`)) {
            const item = localStorage.getItem(key);
            if (item) {
                returnItems.push(item);
            }
        }
    });
    return returnItems;
};

export const resetLocations = (): void => {
    localStorage.clear();
};

export const recordLocations = (locationCategory: LocationCategory, locations: string[]): void => {
    locations.forEach(location => {
        localStorage.setItem(`saved_${getSaveCode(locationCategory)}_${location}`, location)
    })
};

export const hasLocation = (feature: Feature, locations: string[]): boolean =>
    locations.includes(getSafeName(feature.name));
