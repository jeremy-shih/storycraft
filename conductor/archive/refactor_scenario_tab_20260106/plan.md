# Plan: Refactor Scenario Tab Edit Experience

Refactor the editing experience for Characters, Props, and Settings in the Scenario tab to improve discoverability and usability.

## Phase 1: Shared Hooks and Components

- [x] Task: Create `useScenarioItemEditor` hook to manage edit state (Red/Green/Refactor) 71d2cd6
- [x] Task: Create shared `ScenarioImageActions` component for Regenerate/Upload (Red/Green/Refactor)
- [x] Task: Create shared `ScenarioFormActions` component for Save/Cancel/Delete (Red/Green/Refactor)
- [~] Task: Conductor - User Manual Verification 'Shared Hooks and Components' (Protocol in workflow.md)

## Phase 2: Character Card Refactor

- [x] Task: Implement Edit Mode in `CharacterCard` using shared components (Red/Green/Refactor)
- [x] Task: Integrate `useScenarioItemEditor` into `CharacterCard` (Red/Green/Refactor)
- [ ] Task: Conductor - User Manual Verification 'Character Card Refactor' (Protocol in workflow.md)

## Phase 3: Prop Card Refactor

- [x] Task: Implement Edit Mode in `PropCard` using shared components (Red/Green/Refactor)
- [x] Task: Integrate `useScenarioItemEditor` into `PropCard` (Red/Green/Refactor)
- [ ] Task: Conductor - User Manual Verification 'Prop Card Refactor' (Protocol in workflow.md)

## Phase 4: Setting Card Refactor

- [x] Task: Implement Edit Mode in `SettingCard` using shared components (Red/Green/Refactor)
- [x] Task: Integrate `useScenarioItemEditor` into `SettingCard` (Red/Green/Refactor)
- [ ] Task: Conductor - User Manual Verification 'Setting Card Refactor' (Protocol in workflow.md)

## Phase 5: Cleanup and Final Polishing

- [x] Task: Remove deprecated inline editing logic and styles (Red/Green/Refactor)
- [x] Task: Final UI polish and responsive check across all cards (Red/Green/Refactor)
- [x] Task: Debug and fix "Save" button not persisting changes (Red/Green/Refactor)
- [x] Task: Fix Regenerate action to use edited description (Red/Green/Refactor)

## Phase 6: Refactor Server Actions

- [x] Task: Refactor `modify-scenario.ts` to decouple image operations from scenario updates (Red/Green/Refactor)
- [x] Task: Export `updateScenarioText` as a server action (Red/Green/Refactor)

## Phase 7: Implement Save Confirmation Modal

- [x] Task: Create `ScenarioUpdateConfirmationDialog` component (Red/Green/Refactor)
- [x] Task: Integrate dialog into `useScenarioItemEditor` save flow (Red/Green/Refactor)
- [x] Task: Conductor - User Manual Verification 'Server Actions and Save Modal' (Protocol in workflow.md)
