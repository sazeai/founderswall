/**
 * Returns a random rotation value between -7 and 7 degrees
 */
export function getRandomRotation(): number {
  return Math.random() * 14 - 7
}

/**
 * Returns a random position for pins
 */
export function getPinPosition(corner: "top-left" | "top-right" | "random" = "random"): { top: string; left: string } {
  if (corner === "top-left") {
    return {
      top: "-5px",
      left: "10px",
    }
  } else if (corner === "top-right") {
    return {
      top: "-5px",
      left: "calc(100% - 10px)",
    }
  } else {
    // Random position along the top
    return {
      top: "-5px",
      left: `${Math.random() * 80 + 10}%`,
    }
  }
}
