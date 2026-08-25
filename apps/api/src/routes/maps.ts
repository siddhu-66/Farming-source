import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import axios from 'axios';
import { createApiError } from '../middleware';

const router = Router();

router.use(authenticate);

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// GET /api/maps/geocode?address=
router.get('/geocode', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { address } = req.query;
    if (!address) throw createApiError(400, 'Address parameter required');

    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: MAPS_API_KEY, region: 'IN' },
    });

    if (data.status !== 'OK') throw createApiError(400, `Geocoding failed: ${data.status}`);

    const result = data.results[0];
    res.json({
      success: true,
      data: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/maps/directions?origin=lat,lng&destination=lat,lng
router.get('/directions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { origin, destination, waypoints } = req.query;
    if (!origin || !destination) throw createApiError(400, 'origin and destination required');

    const { data } = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        waypoints: waypoints || undefined,
        key: MAPS_API_KEY,
        mode: 'driving',
        units: 'metric',
      },
    });

    if (data.status !== 'OK') throw createApiError(400, `Directions failed: ${data.status}`);

    const route = data.routes[0];
    const leg = route.legs[0];

    res.json({
      success: true,
      data: {
        distance: leg.distance,
        duration: leg.duration,
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((s: any) => ({
          instruction: s.html_instructions.replace(/<[^>]*>/g, ''),
          distance: s.distance.text,
          duration: s.duration.text,
        })),
      },
    });
  } catch (err) { next(err); }
});

// GET /api/maps/nearby-farmers?lat=&lng=&radius=km
router.get('/nearby-farmers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    if (!lat || !lng) throw createApiError(400, 'lat and lng required');

    const { supabase } = await import('../config/supabase');
    const radiusInMeters = Number(radius) * 1000;

    // Using an RPC function for PostGIS geospatial query, which is standard for Supabase
    const { data: listings, error } = await supabase
      .rpc('get_nearby_listings', {
        search_lat: Number(lat),
        search_lng: Number(lng),
        search_radius: radiusInMeters,
      })
      .select('*, farmerId:users(id, name, avatar)')
      .eq('status', 'active')
      .limit(50);

    if (error) throw error;

    res.json({ success: true, data: { listings, count: listings?.length || 0 } });
  } catch (err) { next(err); }
});

// GET /api/maps/key — Return public API key for frontend
router.get('/key', async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { key: process.env.GOOGLE_MAPS_API_KEY } });
});

export default router;
