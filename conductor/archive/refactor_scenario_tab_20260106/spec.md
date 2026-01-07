# Specification: Refactor Scenario Tab Edit Experience

## 1. Overview

The current inline editing experience for Characters, Props, and Settings in the Scenario Tab is confusing and lacks discoverability for key actions (image regeneration, upload, delete). The goal is to refactor this interaction into a clear "Edit Mode" where the item transforms into a form, with explicit Save/Cancel actions and better-placed image management controls.

## 2. Functional Requirements

### 2.1. Edit Mode Activation

- Each Character, Prop, and Setting card will have a distinct "Edit" button (e.g., a pencil icon or "Edit" text) visible in its "View Mode".
- Clicking "Edit" transforms the card (in-place) into an "Edit Mode" form.
- While in Edit Mode, the user cannot edit other items (optional constraint to reduce complexity, or allow multiple open edits if state permits - _Decision: Single active edit mode per item recommended for clarity, but independent editing is acceptable if scoped correctly._).

### 2.2. Edit Mode Layout (Form)

- **Inputs:** The name and description fields become editable text inputs/textareas.
- **Image Section:**
    - The current image is displayed.
    - **Action Buttons:** "Regenerate" and "Upload" buttons are placed **directly below** the image.
- **Footer Actions:**
    - **Save:** A primary button (bottom-right) to commit changes.
    - **Cancel:** A secondary button (next to Save) to discard changes and revert to View Mode.
    - **Delete:** A destructive button (red, bottom-left of the footer) to remove the item entirely.

### 2.3. Data Persistence

- **Save Action:** Clicking "Save" triggers the API call to update the item.
    - Show a loading state on the Save button during the request.
    - On success, return the card to View Mode with updated data.
    - On error, display a toast notification and keep the card in Edit Mode.
- **Cancel Action:** Clicking "Cancel" reverts all local changes (including text edits) and returns the card to View Mode.
- **Delete Action:** Clicking "Delete" prompts for confirmation (optional but recommended) and then triggers the API to remove the item.

### 2.4. Image Management

- **Regenerate:** Triggers the image generation flow. The new image replaces the preview in the form (potentially requiring a "Save" to confirm, or auto-saving the image link depending on existing backend logic. _Assumption: Image updates might be auto-saved or require the final 'Save'. We will align with the explicit 'Save' model: changing the image updates the form state, 'Save' persists it._).
- **Upload:** Opens a file picker. Selected image replaces the preview in the form state.

## 3. User Interface (UI) Design

- **View Mode:** Clean display of Image, Name, Description. "Edit" button visible.
- **Edit Mode:**
    - Card expands if necessary to fit form controls.
    - Visual distinction (e.g., border highlight or shadow) to indicate active editing.
    - **Buttons:**
        - Regenerate/Upload: Standard secondary/outline buttons below image. Use design system variables.
        - Delete: Destructive (red) variant from design system.
        - Save: Primary variant from design system.
        - Cancel: Ghost or Outline variant from design system.

## 4. Non-Functional Requirements

- **Responsiveness:** Layout must adapt to mobile/tablet screens (stacking buttons if needed).
- **Performance:** Transition between View/Edit modes should be instant.
- **Accessibility:** All form inputs and buttons must have proper aria-labels and focus states.

## 5. Out of Scope

- Bulk editing of multiple items.
- Drag-and-drop reordering (unless already present and unaffected).
- Changing the underlying AI model for generation.
