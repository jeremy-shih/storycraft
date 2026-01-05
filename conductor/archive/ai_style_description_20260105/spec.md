# Specification: AI-Powered Style Description from Reference Image

## Overview

This feature enhances the `StyleSelector` component by automatically generating a textual description of an image's visual style when a user uploads a reference image. It leverages Gemini's multimodal capabilities to analyze artistic elements like lighting, color palette, and composition, prepopulating the custom style description field to improve the quality of subsequent image generations.

## Functional Requirements

1.  **Automatic Style Analysis:**
    - Triggered immediately upon successful upload of a style reference image to GCS.
    - Uses a Gemini model (e.g., Gemini Pro Vision) to analyze the image.
    - **Prompt Constraint:** The AI must focus _only_ on the visual style (lighting, mood, texture, colors, medium) and explicitly ignore the specific subject matter or content of the image.
2.  **UI Integration:**
    - The generated description must overwrite any existing text in the "describe the style in detail" textarea in the `StyleSelector` dialog.
    - While analysis is in progress, the textarea should be disabled and display a "Analyzing visual style..." placeholder or overlay with a loading spinner.
3.  **Manual Overrides:**
    - Users must remain able to manually edit the description after it has been generated.
4.  **Error Handling:**
    - If the AI analysis fails, show a toast notification and keep the existing text (or leave it empty). The UI should revert to an editable state.

## Non-Functional Requirements

- **Latency:** The analysis should ideally complete within a few seconds to maintain a smooth user experience.
- **Prompting:** The system prompt should be tuned to provide concise, descriptive keywords suitable for image generation prompts.

## Acceptance Criteria

- Uploading an image to the "Custom Visual Style" dialog triggers a "Analyzing style..." state.
- The textarea is automatically populated with a description focused on style (e.g., "Cinematic lighting, high contrast, muted earth tones").
- The description does _not_ mention specific objects from the image (e.g., if a cat is uploaded, it shouldn't mention "cat").
- The user can edit the AI-generated text.

## Out of Scope

- Image-to-image generation directly using the reference (this feature only populates the text prompt).
- Multiple reference images.
