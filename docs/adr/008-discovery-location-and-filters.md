# ADR 008 — Discovery location and filters

## Context

Discovery has the dog's date of birth, sex and breed size. The owner's profile already has fields for latitude and longitude. Some existing profiles, including demo profiles, have no coordinates.

## Decision

- Ask for foreground location the first time an account opens Match on a device. When the permission is granted, save the current coordinates on that account's profile. Refresh the position when opening the filters with location enabled or when turning the switch on. Changes made in the filters take effect on Apply.
- Store applied filter preferences per account on the device using AsyncStorage. The app stores the filter selections and search radius there. Coordinates are saved on the server.
- Apply size, age and sex filters to unrated dogs before pagination. Size comes from the breed catalogue. Multiple selections within the same group are alternatives. Different groups are combined.
- A radius compares the saved owner locations in kilometres. Dogs with unknown locations are excluded when a radius is applied. The first permission grant enables distance badges and leaves the radius unset until the user applies it. Discovery responses include distances and omit profile coordinates.
- Switching location off disables nearby search and hides distance badges. The last explicitly saved position stays on the profile.
- When the other owner has no GPS position, discovery can use a home area derived from an address selected in onboarding. The app and server snap the address to a grid of 0.005° before storage. The radius uses the centre of that area and the displayed distance is approximate. Existing addresses entered by hand have no home area.

## Consequences

Discovery stays available if the user declines location access. An existing auth account without an owner profile gets a profile when it first saves its position. Migration `0005` stores the optional home area separately from GPS coordinates. A filtered list can be empty while other unrated dogs remain.
