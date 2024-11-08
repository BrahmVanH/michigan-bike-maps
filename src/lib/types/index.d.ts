

export interface FeatureCollection extends GeoJsonObject {
	type: 'FeatureCollection';
	features: Feature[];
}

export interface Feature extends GeoJsonObject {
	type: 'Feature';
	geometry: Geometry | null;
	properties: Properties;
	id?: string;
}

export interface GeometryCollection extends GeoJsonObject {
	type: 'GeometryCollection';
	geometries: Geometry[];
}

export interface Geometry extends GeoJsonObject {
	type: GeometryType;
  coordinates: Position[] | Position[][] | Position[][][];

}


export interface Point extends Geometry {
  type: 'Point';
  coordinates: Position;
}

export interface RouteMapProps {
	geojsonRoute: Feature<LineString>;
	mapStyle?: string;
	initialView?: {
		center: [number, number];
		zoom: number;
	};
}
