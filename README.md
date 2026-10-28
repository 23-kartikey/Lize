# Lize — modular Expo/React Native source

This folder contains the refactored source for the current offline Android app. It keeps the existing features:

- Instagram-inspired `lize` wordmark
- 24-hour grid based on the phone's local clock
- Automatic crossed-out style for completed hours
- Tap an hour to mark it **Wasted** or **Not wasted**
- Wasted-time and classification summaries
- Local persistence by date using AsyncStorage

## How to copy these files into your existing project

1. Stop Expo with `Ctrl+C`.
2. Copy the `App.tsx` from this folder into the root of your existing Expo project, replacing the current `App.tsx`.
3. Copy the complete `src` folder from this package into the root of your existing project. Merge with an existing `src` folder if you already have other files; do not delete unrelated files.
4. From the folder containing your app's `package.json`, install the storage dependency if you have not already installed it:

   ```powershell
   npx expo install @react-native-async-storage/async-storage
   ```

5. Start Expo:

   ```powershell
   npx expo start -c
   ```

## File overview

- `App.tsx` — app entry point
- `src/screens/HomeScreen.tsx` — assembles the main screen
- `src/components/BrandHeader.tsx` — app wordmark
- `src/components/TimeSummary.tsx` — date, elapsed/remaining time, and waste summary
- `src/components/HourGrid.tsx` — tappable 24-hour grid and status styling
- `src/components/HourClassificationModal.tsx` — popup for classifying an hour
- `src/components/HourLegend.tsx` — grid legend
- `src/hooks/useClock.ts` — current time updates and foreground refresh
- `src/hooks/useHourMarks.ts` — load/save marks locally by date
- `src/constants/theme.ts` — shared colors
- `src/types/hour.ts` — TypeScript types
- `src/utils/time.ts` — date and time formatting utilities

## Notes

- No Spring Boot backend is needed for this version.
- Hour classifications are saved on this device; AsyncStorage is not encrypted storage.
- Each marked slot counts as 60 minutes, even if the hour is in the future. This is manual classification, not automatic app usage tracking.
