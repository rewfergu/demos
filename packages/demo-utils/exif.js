import ExifReader from 'exifreader';

export async function extractGps(file) {
  try {
    const buffer = await file.arrayBuffer();
    const tags = ExifReader.load(buffer, { expanded: true });

    if (tags.gps && tags.gps.Latitude != null && tags.gps.Longitude != null) {
      return {
        lat: tags.gps.Latitude,
        lng: tags.gps.Longitude,
      };
    }
    return null;
  } catch {
    return null;
  }
}
