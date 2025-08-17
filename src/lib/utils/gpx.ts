import * as gpxConfig from '$lib/config/gpx';
import type { Feature, Geometry, LineString } from 'geojson';
import { convertGpxStringToGeoJson, getGeoJsonRouteCenter } from './geojson';


/**
 * Validates an uploaded GPX file by checking its filename and content.
 * 
 * This function performs the following steps:
 * 1. Validates the file name using strict GPX filename rules (must end with .gpx or.gpx.gz).
 * 2. If the filename is valid, validates the file content for GPX structure, XML correctness, required attributes, 
 * coordinate data, security threats, and file size limits.
 * 3. Returns a result object indicating success or failure, with error details or the GPX content.
 * 
 * @param file - The uploaded file to validate.
 * @returns A promise that resolves to an object containing:
 * - `success`: boolean indicating if the file is valid.
 * - `content`: the GPX file content if valid.
 * - `error`: error message if validation fails.
 */
export async function validateUploadedGpxFile(file: File) {
  // console.log(`Validating GPX file: ${file.name}`);
  const nameIsValid = isValidGpxFileRegex(file.name);
  if (!nameIsValid) {
    // console.error('❌ GPX validation failed: Error: GPX file name not valid');
    return { success: false, content: "", error: "Error: GPX file name not valid" };
  }
  const result = await validateGpxContent(file);

  if (result.isValid) {
    return { success: true, content: result.content ?? "", error: "" };
  } else {
    // console.error('❌ GPX validation failed:', result.error);
    return { success: false, content: "", error: result.error };
  }
}


/**
 * Rock solid validation for GPX file content
 * Handles both .gpx and .gpx.gz files
 * @param {File} file - The file to validate (already filename-validated)
 * @returns {Promise<{isValid: boolean, error?: string, content?: string}>}
 */
async function validateGpxContent(file: File) {
  try {

    // Extract content - decompress .gz files, read plain text for .gpx
    let gpxContent = await extractCompressedGpxContent(file);

    if (!gpxContent || typeof gpxContent !== 'string') {
      return {
        isValid: false,
        error: 'File content is empty or invalid'
      };
    }

    gpxContent = gpxContent.trim();
    if (gpxContent.length < 50) {
      return {
        isValid: false,
        error: 'File content is too short to be a valid GPX file'
      };
    }

    // XML Structure validation - should return undefined
    const xmlInvalid = testXmlDeclarationRegex(gpxContent);

    if (xmlInvalid) {
      return { ...xmlInvalid };
    }
    // GPX Structure validation - should return undefined
    const gpxAttrsInvalid = validateGpxAttribute(gpxContent);


    if (gpxAttrsInvalid) {
      return { ...gpxAttrsInvalid };
    }

    // Parse XML to validate structure and extract data
    const parsedXml = await parseGpxXml(gpxContent);

    if (!(parsedXml instanceof Document) || !parsedXml.documentElement) {
      return { ...(parsedXml as { isValid: boolean; error: string }) }
    }

    const gpxRoot = parsedXml.documentElement;

    if (gpxRoot.tagName.toLowerCase() !== 'gpx') {
      return {
        isValid: false,
        error: 'Root element must be <gpx>'
      };
    }
    // Validate parsed gpx content, should return undefined
    const parsedGpxInvalid = validateParsedGpxContent(parsedXml);

    if (parsedGpxInvalid) {
      return { ...(parsedGpxInvalid as { isValid: boolean; error: string }) }

    }

    // Security: scan for potentially malicious content, should return undefined
    const isNotSecure = validateSecure(gpxContent);

    if (isNotSecure) {
      return { ...(isNotSecure as { isValid: boolean; error: string }) }
    }

    // Prevent excessive memory usage from huge files, should return undefined
    const fileTooLarge = validateFileSize(gpxContent);

    if (fileTooLarge) {
      return { ...(fileTooLarge as { isValid: boolean; error: string }) }
    }

    return {
      isValid: true,
      content: gpxContent
    };

  } catch (error: any) {
    return {
      isValid: false,
      error: `Unexpected error during validation: ${error.message}`
    };
  }
}
/**
 * Alternative regex-based validation (more concise but equally strict)
 * 
 * @param {string} filename - The filename to validate
 * @returns {boolean} - true if valid .gpx or .gpx.gz file, false otherwise
 */
function isValidGpxFileRegex(filename: string) {
  if (!filename || typeof filename !== 'string') {
    return false;
  }

  // Extremely strict regex for .gpx or .gpx.gz:
  // ^[a-zA-Z0-9._\-\s]+\.gpx(\.gz)?$
  // - Must start with valid characters for basename
  // - Must end with exactly .gpx or .gpx.gz
  // - No other dots allowed except for the extensions
  const strictPattern = /^[a-zA-Z0-9._\-\s]+\.gpx(\.gz)?$/i;

  return strictPattern.test(filename.trim()) &&
    !filename.includes('/') &&
    !filename.includes('\\') &&
    !filename.includes('..') &&
    !/[<>:"|?*\x00-\x1f]/.test(filename);
}

// Example usage and tests
function testValidation() {
  const validFiles = [
    // .gpx files
    'mytrack.gpx',
    'track_2024.gpx',
    'my-awesome-ride.gpx',
    'Track 1.gpx',
    'file123.gpx',
    // .gpx.gz files
    'mytrack.gpx.gz',
    'track_2024.gpx.gz',
    'my-awesome-ride.gpx.gz',
    'Track 1.gpx.gz',
    'file123.gpx.gz'
  ];

  const invalidFiles = [
    'file.gz',                     // Missing .gpx
    'file.gpx.bak',               // Extra extension on .gpx
    'file.gpx.bak.gz',            // Extra extension between .gpx and .gz
    'file.txt.gpx',               // Extra extension before .gpx
    'file.txt.gpx.gz',            // Extra extension before .gpx
    '.gpx',                       // No basename
    '.gpx.gz',                    // No basename
    'file.GPX.GZ.backup',         // Extra extension after
    'file.gpx.gz.tmp',            // Extra extension after
    'file.gpx.tar.gz',           // Wrong compression format
    '',                           // Empty
    'file/path.gpx',             // Path separator
    'file\\path.gpx.gz',         // Path separator
    '../file.gpx',               // Path traversal
    'file<>.gpx.gz',             // Invalid characters
    'file.kml',                  // Wrong file type
    'file.xml',                  // Wrong file type
    null,                        // Null
    undefined                    // Undefined
  ];

}

/**
 * Extremely strict validation for .gpx and .gpx.gz files only
 * Rejects any file that doesn't end with exactly .gpx or .gpx.gz
 * Not in use for its length, testing efficacy of regex based validation with isValidGpxRegex() function below
 * 
 * @param {string} filename - The filename to validate
 * @returns {boolean} - true if valid .gpx or .gpx.gz file, false otherwise
 */
function isValidGpxFile(filename: string) {
  if (!filename || typeof filename !== 'string') {
    return false;
  }

  const normalizedFilename = filename.trim().toLowerCase();
  if (normalizedFilename.length < 6) {
    return false;
  }

  const extCheck = checkGpxExtension(normalizedFilename);
  if (!extCheck.valid) {
    return false;
  }

  if (!isValidBasename(extCheck.basename)) {
    return false;
  }

  if (!isSecureFilename(normalizedFilename, filename)) {
    return false;
  }

  return true;
}

function checkGpxExtension(normalizedFilename: string) {
  const isGpx = normalizedFilename.endsWith('.gpx');
  const isGpxGz = normalizedFilename.endsWith('.gpx.gz');
  if (!isGpx && !isGpxGz) {
    return { valid: false, basename: '' };
  }
  if (normalizedFilename === '.gpx' || normalizedFilename === '.gpx.gz') {
    return { valid: false, basename: '' };
  }
  const parts = normalizedFilename.split('.');
  if (isGpx && parts.length !== 2) {
    return { valid: false, basename: '' };
  }
  if (isGpxGz && parts.length !== 3) {
    return { valid: false, basename: '' };
  }
  const basename = parts[0];
  const firstExt = parts[1];
  const secondExt = parts[2];
  if (!basename || basename.length === 0) {
    return { valid: false, basename: '' };
  }
  if (firstExt !== 'gpx') {
    return { valid: false, basename: '' };
  }
  if (isGpxGz && secondExt !== 'gz') {
    return { valid: false, basename: '' };
  }
  return { valid: true, basename };
}

function isValidBasename(basename: string) {
  const validBasenamePattern = /^[a-zA-Z0-9._\-\s]+$/;
  return validBasenamePattern.test(basename);
}

function isSecureFilename(normalizedFilename: string, filename: string) {
  if (
    normalizedFilename.includes('/') ||
    normalizedFilename.includes('\\') ||
    normalizedFilename.includes('..')
  ) {
    return false;
  }
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(filename)) {
    return false;
  }
  return true;
}


// Example integration with form processing
async function processFilesWithValidation(files: File[]) {
  if (!files || files.length === 0) {
    return { success: false, error: 'No files selected' };
  }

  const file = files[0];

  // First: filename validation
  if (!isValidGpxFile(file.name)) {
    return { success: false, error: 'Invalid filename - must be .gpx or .gpx.gz' };
  }

  // Second: content validation
  const contentValidation = await validateGpxContent(file);

  if (!contentValidation.isValid) {
    return { success: false, error: contentValidation.error };
  }

  return {
    success: true,
    content: contentValidation.content,
    filename: file.name
  };
}

/**
 * Decompresses a gzipped file using the browser's built-in decompression
 */
async function decompressGzFile(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(arrayBuffer));
        controller.close();
      }
    });

    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    const response = new Response(decompressedStream);
    const decompressedText = await response.text();

    return decompressedText;
  } catch (error: any) {
    throw new Error(`Failed to decompress .gpx.gz file: ${error.message}`);
  }
}



/**
 * Validate file size, max file size 50mb decompressed
 */
function validateFileSize(gpxContent: string) {
  if (gpxContent.length > gpxConfig.maxSize) {
    return {
      isValid: false,
      error: 'GPX content is too large (exceeds 50MB)'
    };
  }
}




/**
 * Check gpx data for security threats
 */

function validateSecure(gpxContent: string) {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i, // event handlers
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(gpxContent)) {
      return {
        isValid: false,
        error: 'File contains potentially malicious content'
      };
    }
  }
}

/**
 * Validate parsed gpx xml content contains actual GPX data, should return undefined if valid
 */
function validateParsedGpxContent(parsedXml: Document) {

  // Validate basic GPX elements are present, should return undefined
  const gpxInvalid = validateBasicGpx(parsedXml);

  if (gpxInvalid) {
    return { ...(gpxInvalid as { isValid: boolean; error: string }) }

  }


  // Validate coordinate data in track/route points, should return undefined
  const trackRoutePointCoordsInvalid = validateTrackRoutePointCoordinates(parsedXml);

  if (trackRoutePointCoordsInvalid) {
    return { ...(trackRoutePointCoordsInvalid as { isValid: boolean; error: string }) }

  }

  // Validate waypoint coordinates, should return undefined
  const waypointCoordsInvalid = validateWaypointCoordinates(parsedXml);

  if (waypointCoordsInvalid) {
    return { ...(waypointCoordsInvalid as { isValid: boolean; error: string }) }

  }
}

/**
 * Validate waypoint coordinates in parsed gpx data 
 */
function validateWaypointCoordinates(parsedXmlContent: Document) {
  const waypointElements = parsedXmlContent.querySelectorAll('wpt');

  for (const waypoint of waypointElements) {
    const lat = parseFloat(waypoint.getAttribute('lat') ?? "NaN");
    const lon = parseFloat(waypoint.getAttribute('lon') ?? "NaN");

    if (isNaN(lat) || isNaN(lon)) {
      return {
        isValid: false,
        error: 'Invalid coordinate data in waypoints'
      };
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return {
        isValid: false,
        error: 'Waypoint coordinates out of valid range'
      };
    }
  }
}


/**
 * Validate track and route point coordinate data. Arbitrary string value "NaN" fallback
 * for missing point attributes to catch in next typecheck
 */
function validateTrackRoutePointCoordinates(parsedXmlContent: Document) {
  const trackPoints = parsedXmlContent.querySelectorAll('trkpt, rtept');
  for (const point of trackPoints) {
    const lat = parseFloat(point.getAttribute('lat') ?? "NaN");
    const lon = parseFloat(point.getAttribute('lon') ?? "NaN");

    if (isNaN(lat) || isNaN(lon)) {
      return {
        isValid: false,
        error: 'Invalid coordinate data in track/route points'
      };
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return {
        isValid: false,
        error: 'Coordinates out of valid range (lat: -90 to 90, lon: -180 to 180)'
      };
    }
  }
}


/** 
 * Validate basic GPX data elements are present
 */
function validateBasicGpx(parsedXmlContent: Document) {
  const waypoints = parsedXmlContent.querySelectorAll('wpt');
  const routes = parsedXmlContent.querySelectorAll('rte');
  const tracks = parsedXmlContent.querySelectorAll('trk');

  if (waypoints.length === 0 && routes.length === 0 && tracks.length === 0) {
    return {
      isValid: false,
      error: 'GPX file must contain at least one waypoint, route, or track'
    };
  }
}


/**
 * Parse validated gpx xml into gpx documentElement
 */
async function parseGpxXml(gpxXmlContent: string) {
  try {
    const parser = new DOMParser();
    const parsedXml = parser.parseFromString(gpxXmlContent, 'text/xml');

    const parseError = parsedXml.querySelector('parsererror');
    if (parseError) {
      return {
        isValid: false,
        error: `XML parsing error: ${parseError.textContent}`
      };
    }
    return parsedXml;

  } catch (error: any) {
    return {
      isValid: false,
      error: `XML parsing failed: ${error.message}`
    };
  }
}
/**
 * Validate GPX related attributes
 */
function validateGpxAttribute(content: string) {
  if (!content.includes('</gpx>')) {
    return {
      isValid: false,
      error: 'Missing closing GPX tag'
    };
  }

  // Required GPX attributes
  const versionRegex = /version\s*=\s*["']1\.[0-1]["']/i;
  if (!versionRegex.test(content)) {
    return {
      isValid: false,
      error: 'Missing or invalid GPX version (must be 1.0 or 1.1)'
    };
  }

  const creatorRegex = /creator\s*=\s*["'][^"']+["']/i;
  if (!creatorRegex.test(content)) {
    return {
      isValid: false,
      error: 'Missing creator attribute in GPX root element'
    };
  }


}

/**
 * Check for xml declaration, included or return false
 */
function testXmlDeclarationRegex(content: string) {
  const xmlDeclarationRegex = /^\s*<\?xml\s+version\s*=\s*["']1\.[0-9]["']/i;
  if (!xmlDeclarationRegex.test(content)) {
    return {
      isValid: false,
      error: 'Missing or invalid XML declaration'
    };
  }
}

/**
 * Extract file content - Checks for gzipped gpx file, decompresses and returns file text or just returns file text
 */
async function extractCompressedGpxContent(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.gpx.gz')) {
    try {
      return await decompressGzFile(file);
    } catch (error: any) {
      return {
        isValid: false,
        error: `Decompression failed: ${error.message}`
      };
    }
  } else {
    try {
      return await file.text();
    } catch (error: any) {
      return {
        isValid: false,
        error: `Failed to read file content: ${error.message}`
      };
    }
  }

}


export async function getGpxRouteAndCenterFromString(gpxString: string) {
  try {
    const featureCollection = await convertGpxStringToGeoJson(gpxString);

    const routeFeature = featureCollection.features.find(
      (feature: Feature<Geometry>) => feature.geometry.type === 'LineString'
    ) as Feature<LineString>;

    if (!routeFeature) {
      throw new Error('No valid route found in GPX file');
    }

    const routeCoordinates = routeFeature.geometry.coordinates;

    if (!routeCoordinates) {
      throw new Error('No route coordinates found in GeoJSON file');
    }
    // const geoJsonRouteData = convertToGeoJson(gpxRouteData);
    // const routeCenter = getRouteCenter(gpxRouteData);

    const routeCenter = getGeoJsonRouteCenter(routeCoordinates);
    
    // downloadGeoJSONasSVG(geoJsonRouteData, "my-map.svg");

    return { routeFeature, routeCenter };
  } catch (err: any) {
    // console.error('Error in getting gpx route and center from gpx string: ', err);
    throw new Error(`Error in getting gpx route and center from gpx string: ${err}`);
  }
}