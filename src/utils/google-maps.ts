export const googleMaps = (latitude: number, longitude: number) => {
  window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')
}
