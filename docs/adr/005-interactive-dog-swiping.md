# ADR 005 — Interactive Dog Swiping

**Status:** Accepted

## Context

Pawpote needs an interactive interface allowing users to discover dog profiles and express interest through swipe gestures.

Before connecting this feature to the backend, we want to validate the user experience, animations, and interaction patterns independently.

## Decision

We implement a reusable `SwipeDeck` component using:

- React Native Gesture Handler for touch gestures.
- React Native Reanimated for card movement, rotation, and transitions.
- Expo Blur for the background card blur effect.
- Expo Image for displaying dog photos.
- Local mock data for development and testing.

Swiping right represents a like, while swiping left represents a dislike.

Users can also trigger these actions using dedicated buttons.

The next dog card remains blurred until a swipe is confirmed, then becomes visible as the current card exits.

The swipe interface is temporarily integrated into the Explore screen.

## Consequences

### Benefits

- Swipe interactions can be developed and tested without backend dependencies.
- The component can be reused in the future discovery interface.
- Animations and UI can evolve independently from business logic.
- Mock data allows rapid iteration.

### Limitations

- Likes and dislikes are not persisted.
- Dog profiles currently use mock data and placeholder images.
- Matching logic is not implemented.
- A brief image flicker may occur when transitioning between cards.

## Future Work

- Add an `onSwipe` callback.
- Connect dog profiles to the backend API.
- Persist likes and dislikes in PostgreSQL.
- Implement matching logic.
- Integrate Cloudflare R2 for dog photos.
- Improve card transitions and eliminate image flickering.
- Apply the final Pawpote visual identity.

## Validation

- Manual swipe testing on mobile.
- Like and dislike button testing.
- Card transition and blur testing.
- TypeScript validation using `npx tsc --noEmit`.