function toRadians(deg) {
  return deg * Math.PI / 180;
}

function toDegrees(rad) {
  return rad * 180 / Math.PI;
}

function calculateQibla() {
  const lat = parseFloat(document.getElementById('latitude').value);
  const lon = parseFloat(document.getElementById('longitude').value);

  if (isNaN(lat) || isNaN(lon)) {
    alert("Please enter valid coordinates.");
    return;
  }

  const kaabaLat = toRadians(21.4225);
  const kaabaLon = toRadians(39.8262);
  const userLat = toRadians(lat);
  const userLon = toRadians(lon);

  const deltaLon = kaabaLon - userLon;
  const x = Math.sin(deltaLon);
  const y = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLon);
  let qiblaDirection = toDegrees(Math.atan2(x, y));
  if (qiblaDirection < 0) qiblaDirection += 360;

  document.getElementById('result').innerText = `🧭 Qibla direction: ${qiblaDirection.toFixed(2)}° from true North`;
  showSunriseSunset(lat, lon);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      document.getElementById('latitude').value = position.coords.latitude.toFixed(6);
      document.getElementById('longitude').value = position.coords.longitude.toFixed(6);
    }, () => alert("Could not get your location."));
  } else {
    alert("Geolocation not supported.");
  }
}

function showSunriseSunset(lat, lon) {
  const times = calculateSunriseSunset(lat, lon, new Date());
  document.getElementById('sunriseSunset').innerText = `🌅 Sunrise: ${times.sunrise} | 🌇 Sunset: ${times.sunset}`;
}

function calculateSunriseSunset(lat, lon, date) {
  const daysSinceYearStart = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const lngHour = lon / 15;

  function computeTime(isSunrise) {
    const t = daysSinceYearStart + ((isSunrise ? 6 : 18) - lngHour) / 24;
    const M = (0.9856 * t) - 3.289;
    let L = M + (1.916 * Math.sin(toRadians(M))) + (0.020 * Math.sin(toRadians(2 * M))) + 282.634;
    L = (L + 360) % 360;

    let RA = toDegrees(Math.atan(0.91764 * Math.tan(toRadians(L))));
    RA = (RA + 360) % 360;
    RA = RA / 15;

    const sinDec = 0.39782 * Math.sin(toRadians(L));
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(toRadians(90.833)) - (sinDec * Math.sin(toRadians(lat)))) / (cosDec * Math.cos(toRadians(lat)));

    if (cosH > 1) return "Never rises";
    if (cosH < -1) return "Never sets";

    let H = isSunrise ? 360 - toDegrees(Math.acos(cosH)) : toDegrees(Math.acos(cosH));
    H = H / 15;

    const T = H + RA - (0.06571 * t) - 6.622;
    const UT = (T - lngHour + 24) % 24;

    const offset = -(new Date().getTimezoneOffset()) / 60;
    const localT = (UT + offset + 24) % 24;
    const hrs = Math.floor(localT);
    const mins = Math.floor((localT - hrs) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  return {
    sunrise: computeTime(true),
    sunset: computeTime(false)
  };
}