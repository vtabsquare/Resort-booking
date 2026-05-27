/**
 * Calculates or retrieves the correct room price based on the active season.
 * @param {Object} room - The room object
 * @param {Number} seasonalMultiplier - The active multiplier setting (0.9 for Low, 1.0 for Standard, 1.15 for Peak)
 * @returns {Number} - The room price for the active season
 */
export const getRoomPriceForActiveSeason = (room, seasonalMultiplier) => {
  if (!room) return 0;
  if (seasonalMultiplier === 0.9) {
    return Number(room.priceLow) || Math.round(Number(room.price) * 0.9);
  } else if (seasonalMultiplier === 1.15) {
    return Number(room.pricePeak) || Math.round(Number(room.price) * 1.15);
  } else {
    return Number(room.price) || 0;
  }
};
