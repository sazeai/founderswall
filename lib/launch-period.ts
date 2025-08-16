// Utility to calculate the current launch period window (start and end)
// Launch periods: Mon 8am UTC–Thu 8am UTC, Thu 8am UTC–Mon 8am UTC

export function getCurrentLaunchPeriod(now: Date = new Date()) {
  // Get UTC day and hour
  const day = now.getUTCDay() // 0=Sun, 1=Mon, ... 6=Sat
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()

  // Find the most recent Mon or Thu 8am UTC
  // 1 = Mon, 4 = Thu
  let start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 0, 0))
  // If before 8am today, back up to yesterday
  if (hour < 8 || (hour === 8 && minute === 0 && now.getUTCSeconds() === 0)) {
    start.setUTCDate(start.getUTCDate() - 1)
  }

  // Find the most recent Mon or Thu
  while (![1, 4].includes(start.getUTCDay())) {
    start.setUTCDate(start.getUTCDate() - 1)
  }

  // End is next Mon or Thu 8am UTC after start
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + (start.getUTCDay() === 1 ? 3 : 4))

  return { start, end }
}
