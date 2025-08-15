// import L, { GridLayer, type GridLayerOptions, LatLng, Point, Bounds } from 'leaflet';

// export interface EdgeBufferTube {
//   start: LatLng;
//   end: LatLng;
//   widthPx?: number;
// }

// export interface EdgeBufferOptions extends GridLayerOptions {
//   edgeBufferTiles?: number | null;
//   tube?: EdgeBufferTube;
// }

// // Save previous method for extension
// const previousGetTiledPixelBounds = GridLayer.prototype._getTiledPixelBounds;

// GridLayer.include({
//   _getTiledPixelBounds: function (
//     this: GridLayer & { options: EdgeBufferOptions; _map: L.Map; _tiles: any; _addTile: Function },
//     center: LatLng,
//     zoom: number,
//     tileZoom: number
//   ) {
//     let pixelBounds = previousGetTiledPixelBounds.call(this, center, zoom, tileZoom);

//     const edgeBufferTiles = this.options.edgeBufferTiles || 1;
//     if (edgeBufferTiles > 0) {
//       const pixelEdgeBuffer = this.getTileSize().multiplyBy(edgeBufferTiles);
//       if (pixelEdgeBuffer && pixelBounds.min.subtract) {
//         pixelBounds = new Bounds(
//           pixelBounds.min.subtract(pixelEdgeBuffer),
//           pixelBounds.max.add(pixelEdgeBuffer)
//         );
//       }
//     }

//     // Preload tiles in a corridor (tube) between two points if 'tube' option is set
//     if (this.options.tube && this._map) {
//       const tileSize = this.getTileSize();
//       const zoom = this._map.getZoom();
//       const start = this.options.tube.start;
//       const end = this.options.tube.end;
//       const widthPx = this.options.tube.widthPx || tileSize.x;

//       // Convert start/end to pixel coordinates
//       const p1 = this._map.project(start, zoom);
//       const p2 = this._map.project(end, zoom);

//       // Calculate direction vector and perpendicular
//       const dx = p2.x - p1.x;
//       const dy = p2.y - p1.y;
//       const len = Math.sqrt(dx * dx + dy * dy);

//       if (len === 0) return pixelBounds;

//       const nx = -dy / len;
//       const ny = dx / len;

//       // For each step along the line, buffer by widthPx/2 perpendicular
//       const steps = Math.ceil(len / tileSize.x);
//       const tilesToLoad = new Set<string>();
//       for (let i = 0; i <= steps; i++) {
//         const t = i / steps;
//         const cx = p1.x + dx * t;
//         const cy = p1.y + dy * t;
//         // For each step, get a rectangle perpendicular to the line
//         for (let w = -widthPx / 2; w <= widthPx / 2; w += tileSize.x / 2) {
//           const px = cx + nx * w;
//           const py = cy + ny * w;
//           const tileX = Math.floor(px / tileSize.x);
//           const tileY = Math.floor(py / tileSize.y);
//           tilesToLoad.add(`${zoom}:${tileX}:${tileY}`);
//         }
//       }
//       // Optionally, request tiles here (if you want to force load)
//       if (this._tiles && typeof this._addTile === 'function') {
//         tilesToLoad.forEach((key) => {
//           const parts = key.split(':');
//           const z = parseInt(parts[0]);
//           const x = parseInt(parts[1]);
//           const y = parseInt(parts[2]);
//           if (!this._tiles[`${z}:${x}:${y}`]) {
//             this._addTile({ x, y, z, scaleBy: function () { } });
//           }
//         });
//       }
//     }
//     return pixelBounds;
//   }
// });

// export { }; // For module scoping
