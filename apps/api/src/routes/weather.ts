import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { getCurrentWeather, getWeatherForecast, getWeatherByCity, getSoilData } from '../services/weather';
import { getWeatherSummary } from '../controllers/topbar.controller';
import { createApiError } from '../middleware';

const router = Router();

router.use(authenticate);

// GET /api/weather/summary (UTNB Widget)
router.get('/summary', getWeatherSummary);

// GET /api/weather/current?lat=&lon= OR ?city=
router.get('/current', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lat, lon, city } = req.query;
    let weather;

    if (city) {
      weather = await getWeatherByCity(city as string);
    } else if (lat && lon) {
      weather = await getCurrentWeather(Number(lat), Number(lon));
    } else {
      throw createApiError(400, 'Provide lat/lon or city parameter');
    }

    res.json({ success: true, data: { weather } });
  } catch (err) { next(err); }
});

// GET /api/weather/forecast?lat=&lon=
router.get('/forecast', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) throw createApiError(400, 'lat and lon are required');

    const forecast = await getWeatherForecast(Number(lat), Number(lon));
    res.json({ success: true, data: { forecast } });
  } catch (err) { next(err); }
});

// GET /api/weather/soil?polyid=
router.get('/soil', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { polyid } = req.query;
    if (!polyid) throw createApiError(400, 'polyid is required');

    const soilData = await getSoilData(polyid as string);
    res.json({ success: true, data: { soilData } });
  } catch (err) { next(err); }
});

export default router;
