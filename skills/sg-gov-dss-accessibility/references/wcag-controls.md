# DSS WCAG-derived control catalog — full text (53 controls)

Embedded from **info.standards.tech.gov.sg** as of **2026-07-16** (catalog pages last
updated 5 March 2026). Families: WP Perceivable (19), WO Operable (18), WU
Understandable (14), WR Robust (2).

Source pages:

- https://info.standards.tech.gov.sg/control-catalog/dss/wp/
- https://info.standards.tech.gov.sg/control-catalog/dss/wo/
- https://info.standards.tech.gov.sg/control-catalog/dss/wu/
- https://info.standards.tech.gov.sg/control-catalog/dss/wr/

Levels come from the two DSS SSP profile pages
(https://info.standards.tech.gov.sg/ssp/dss-others/ and
https://info.standards.tech.gov.sg/ssp/dss-high/):

- **Others** — digital services with fewer than 1 million visits per year (per WOGAA
  statistics). Level 1 = default hygiene ("should-have"; deviation needs agency
  IDSC/CIO/CISO approval documented in a custom SSP). Level 2 = best practice
  ("good-to-have", risk-based adoption).
- **High Impact** — at least 1 million visits per year (per WOGAA). All 53 WCAG-derived
  controls sit at Level 1. No WCAG-derived control is Level 0 in either profile.

**About the WCAG mapping:** the site does **not** print WCAG success criterion numbers.
The "WCAG 2.2 SC" shown for each control below is an **inferred mapping** made while
authoring this skill, based on control titles and wording. It is reliable for
orientation and for using WCAG techniques documents, but it is not an official
GovTech statement — cite the DSS control ID, not the SC number, in compliance
artefacts. Notable divergences from a clean A/AA cut:

- WU-3 (Unusual Words) and WU-4 (Abbreviations) correspond to WCAG **AAA** criteria
  (3.1.3, 3.1.4) — DSS includes them anyway, WU-4 even at Level 1.
- WO-13 merges two SCs: 2.4.7 Focus Visible (AA) and 2.4.11 Focus Not Obscured
  (Minimum) (AA).
- WP-3 spans 1.2.1 and 1.2.3 (both A).
- WU-7 (Consistent Navigation) adds SG-specific requirements beyond SC 3.2.3: nav at
  or near the top, not collapsed into an icon on desktop.
- WCAG 2.2 SCs with no DSS counterpart: 2.4.12/2.4.13 (Focus Not Obscured Enhanced /
  Focus Appearance — AAA), 2.5.7 Dragging Movements (AA — partially covered by WO-14's
  "path-based" wording), 3.3.9 Accessible Authentication (Enhanced) (AAA). 4.1.1
  Parsing was removed in WCAG 2.2 and has no control.

**Terminology:** DSS catalog pages publish a **Rationale** for each control, not the
"Risk Statement" used in the Cybersecurity Control Catalog. Text below is faithful to
the site, including its typos; editorial observations are in bracketed *[Site note:
…]* lines and are ours, not GovTech's.

---

## WP — WCAG: Perceivable

"Controls that ensure users can perceive the content in various forms."

### WP-1: Text Alternatives for Non-Text content

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.1.1 Non-text Content (A)

**Control Statement:** Provide text alternatives for essential non-text content.

**Control Recommendations:** Provide accurate, concise alt text or a relevant textual
description for non-text content (images, charts, media). Implement purely decorative
non-text content in a way that can be ignored by assistive technology.

**Rationale:** Ensures that equivalent information is conveyed to all end users by
allowing assistive technologies to read and communicate essential non-text content.

### WP-2: Captions for Prerecorded Media

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.2.2 Captions (Prerecorded) (A)

**Control Statement:** Provide captions for prerecorded video or audio content.

**Control Recommendations:** Use transcribing or captioning tools to generate captions.
Ensure captions are aligned with audio and are readable. Not required when the content
is a media alternative for text and is clearly labeled as such.

**Rationale:** Ensures that individuals with hearing impairments can access and
understand the material. Captions also help people engage better with content and allow
people to access the content without audio.

### WP-3: Text or Audio Alternatives for Prerecorded Media

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.2.1 Audio-only and Video-only (Prerecorded) (A) + 1.2.3 Audio Description or Media Alternative (Prerecorded) (A)

**Control Statement:** Provide alternatives for all prerecorded audio and video media.

**Control Recommendations:** Provide text transcripts for audio-only content. Provide
text alternatives or audio descriptions for video-only content and synchronised media
(audio and video). Not required when the content is a media alternative for text and is
clearly labeled as such.

**Rationale:** Ensures information conveyed by prerecorded audio and video content is
available to all end users.

### WP-4: Live Captions

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 1.2.4 Captions (Live) (AA)

**Control Statement:** Provide captions for live audio and video content.

**Control Recommendations:** Use automated or live captioning services for content like
livestream and webinars. Ensure that the service or tool is sufficiently accurate.

**Rationale:** Live captions make live audio and video content accessible to end users
who are deaf or hard of hearing.

### WP-5: Audio Description for Prerecorded Video Content

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 1.2.5 Audio Description (Prerecorded) (AA)

**Control Statement:** Provided an audio description for all prerecorded video content.
*[Site note: "Provided" is the site's own typo.]*

**Control Recommendations:** Provide user-selectable audio tracks focusing on critical
visual elements necessary for understanding. This is an extension of wp-3 which
recommends but does not prescribe audio descriptions.

**Rationale:** Ensures that individuals who have visual impairments can better
experience video content. This involves both information conveyed through the audio
track and also descriptions of visual information such as actions, signs and facial
expressions.

### WP-6: Presentation of Info and Relationships

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.3.1 Info and Relationships (A)

**Control Statement:** Present the structure, order and relationships of information on
a page in a way that can be programmatically determined by assistive technology.

**Control Recommendations:** Apply techniques such as correct use of semantic HTML
elements (e.g., headings, lists, tables), text descriptions and where necessary, ARIA
markups. Do not overuse ARIA as it creates clutter and overwhelm end users.

**Rationale:** Ensures that the structure and organisation of content are clear to all
end users, including those who use assistive technologies.

### WP-7: Meaningful Content Order

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.3.2 Meaningful Sequence (A)

**Control Statement:** Ensure that the logical reading order of content can be
programmatically determined by software.

**Control Recommendations:** Ensure code is structured to preserve the logical reading
order of content. Validate with screen reader testing to confirm that end users can
navigate content in a logical sequence.

**Rationale:** Allows assistive technology to present content in the intended reading
order needed to understand the meaning.

### WP-8: Describing Displayed Controls

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.3.3 Sensory Characteristics (A)

**Control Statement:** Do not rely only on sensory characteristics such shape, colour,
size, visual location, orientation, or sound when describing controls.

**Control Recommendations:** Describe controls by name. Avoid using expressions like
"click the blue button" or "Select an option after the beep" when describing or
referring to controls. Instead use clear, obvious and meaningful instructions like
"Click the 'next' button to continue with the survey", "When you have finished filling
in your application form, click 'Submit' to complete your submission"

**Rationale:** Reliance of specific sensory characteristics may make descriptions or
instructions inaccessible to some users with specific disabilities. E.g. Colour and
shape may not perceivable by blind users.

### WP-9: Display Orientation

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 1.3.4 Orientation (AA)

**Control Statement:** Do not restrict content to a single display orientation.

**Control Recommendations:** Avoid locking orientation to a particular view. Ensure
content can adapt to various orientations such as landscape and portrait without layout
or functionality issues. Not required if a specific display orientation is necessary to
provide the content in an accurate and functional manner.

**Rationale:** To ensure that content displays in the orientation (portrait or
landscape) preferred by the end user. Users with dexterity impairments such as those in
wheelchairs may have devices mounted in a particular orientation.

### WP-10: Identify Input Purpose

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.3.5 Identify Input Purpose (AA)

**Control Statement:** Use labels and code to clearly specify the purpose and format of
common inputs.

**Control Recommendations:** Clearly distinguish similar fields such as billing address
and shipping address. Specify the exact format of input fields that may have multiple
valid interpretations such as dates.

**Rationale:** Ensures that both regular end users and users of assistive technology
can clearly discern the purpose of an input function.

### WP-11: Use of Color

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.1 Use of Color (A)

**Control Statement:** Avoid using colour as the only visual means of conveying
information, indicating an action, prompting a response, or distinguishing a visual
element.

**Control Recommendations:** Use a mix of shape (icons, symbols), colour and text for
essential content such as error messages.

**Rationale:** Using multiple modes in addition to colour, ensures that crucial
information and state changes are well communicated to end users, especially those with
colour vision deficiencies.

### WP-12: Audio Control

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.2 Audio Control (A)

**Control Statement:** Providing options to pause, stop or adjust the volume of audio
that automatically plays for more than 3 seconds.

**Control Recommendations:** Only play sounds on user request or provide the user with
functions to pause, stop or adjust the volume near the beginning of the digital service
so it is easily and quickly discovered.

**Rationale:** To prevent unexpected or disruptive audio from affecting users'
experience, particularly those with cognitive or hearing impairments. Background audio
also interferes with narration by screen reading software.

### WP-13: Minimum Contrast

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.3 Contrast (Minimum) (AA)

**Control Statement:** Ensure a minimum contrast ratio of 4.5:1 between text and its
background. Large text (at least 18 point or 14 point bold) can have a reduced contrast
ratio of at least 3:1.

**Control Recommendations:** Use tools like WebAIM's Contrast Checker or Oobee to
verify that text and images of text meet the minimum contrast ratio. Not required for
a) Text that is decorative, conveys no meaningful information b) Part of a component in
an inactive state

**Rationale:** Adequate contrast between text and background is essential for good
readability and usability, especially for end users with low vision or colour vision
deficiencies.

### WP-14: Text Scaling

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.4 Resize Text (AA)

**Control Statement:** Ensure text can be scaled up to 200% without loss of content or
functionality.

**Control Recommendations:** Use relative units like REM. Ensure at least one one
browser or platform text scaling mechanism can be used. This includes zoom (of the
entire page's content), magnification, and text-only resizing. Test to confirm that no
content is clipped, truncated, or obscured after resizing. This excludes captions and
images of text.

**Rationale:** Resizable text makes digital content accessible to a wide range of end
users with different visual capabilities, particularly those without access to screen
magnification tools.

### WP-15: Images of Text

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.5 Images of Text (AA)

**Control Statement:** Use text instead of images of text.

**Control Recommendations:** Avoid using images of text except when essential, such as
for logos. Where text in images are necessary, ensure that alternative text or captions
provide the same information.

**Rationale:** Text in images are not accessible, especially for end users with visual
impairments or reading disabilities. Users cannot adjust the size or font for better
readability and the text is not readable by common screen reader technology.

### WP-16: Content Reflow

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.10 Reflow (AA)

**Control Statement:** Enable lines of text and content to reflow across different
viewports.

**Control Recommendations:** Use responsive design frameworks like CSS Flexbox or Grid
and test on a variety of devices to confirm that content remains legible and usable
without excessive scrolling even when text is resized. Not required for content that
requires two-dimensional layout for understanding or functionality, such as maps,
complex data tables or data visualisations.

**Rationale:** Enabling reflowing of content allows users who rely on large fonts,
including those using devices with smaller screens to be able to view and navigate
digital content without scrolling horizontally even when text size is increased.

### WP-17: Non-text Contrast

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.11 Non-text Contrast (AA)

**Control Statement:** Ensure a minimum contrast ratio of 3:1 between colours of user
interface components and graphical objects that convey important information, and their
respective backgrounds.

**Control Recommendations:** Use tools like WebAIM's Contrast Checker to test contrast.
Focus on elements critical for interaction, such as buttons and form inputs.

**Rationale:** Sufficient contrast helps end users better perceive and identify
non-text user interface components and key graphical objects, improving usability.

### WP-18: Text Spacing

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.12 Text Spacing (AA)

**Control Statement:** Ensure that text implemented using markup languages can be
adjusted to the following text style properties with no loss of content or
functionality: a) Line height to 1.5 times the font size b) Paragraph spacing to 2
times the font size c) Letter spacing to 0.12 times the font size d) Word spacing to
0.16 times the font size

**Control Recommendations:** Allow for text spacing override by assistive technology
and test with tools that simulate the spacing configurations specified. Text content
does not need to use these text spacing values as defaults, and there is no need to
implement controls for users to adjust text properties within the digital service.

**Rationale:** Ensures that end users, in particular those with low vision or dyslexia
are: a) Not restricted from overriding default text spacing through the use of
assistive technology, stylesheets or extensions. b) Content or functionality is not
lost and the content remains legible and functional.

### WP-19: Content on Hover or Focus

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 1.4.13 Content on Hover or Focus (AA)

**Control Statement:** Ensure content appearing on hover or focus a) Appears long
enough to be read and interacted with b) Does not disappear unexpectedly c) Can be
easily dismissed using a pointer device or keyboard

**Control Recommendations:** Design custom tooltips, sub-menus and other non-modal
popups which display on hover and focus to be perceivable and dismissible without
disrupting the overall user experience.

**Rationale:** Elements that appear on hover or focus can be difficult to manage. End
users with limited motor control may have trouble keeping their pointer steady, and
keyboard-only users need a reliable way to dismiss such content.

---

## WO — WCAG: Operable

"Controls to make interface elements easy to operate for all users."

### WO-1: Keyboard equivalent

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.1.1 Keyboard (A)

**Control Statement:** Ensure any action done using a pointer device can also be done
using a keyboard.

**Control Recommendations:** Provide keyboard operation for all the functionality of
the page unless the function requires path-dependent input such as handwriting. Avoid
requiring specific timings for individual keystrokes such as requirements to repeat or
execute multiple keystrokes within a short period of time.

**Rationale:** Ensures that there is no loss of functionality for users who rely on
keyboards such as those with motor impairments.

### WO-2: No Keyboard Trap

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.1.2 No Keyboard Trap (A)

**Control Statement:** Ensure that keyboard users can move keyboard focus away or out
from a component or section of the digital service.

**Control Recommendations:** Test forms, widgets, and custom elements with
keyboard-only navigation to confirm end users can exit all components using standard
keys (like Tab and Shift+Tab). If the key functionality of the component restricts the
focus to a subsection of the content, communicate clearly to users how to leave that
state and "untrap" the focus.

**Rationale:** A keyboard trap happens when keyboard focus is moved to a component or
subsection of the digital service without a way of the end user navigating back out
using a keyboard interface. End users who who rely on exclusive keyboard interface
usage such as people with vision and physical disabilities get stuck and are unable to
proceed to other parts of the service or complete a critical transaction.

### WO-3: Character Key Shortcuts

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 2.1.4 Character Key Shortcuts (A)

**Control Statement:** Provide a mechanism to disable or remap shortcuts that are
activated using only one character key press.

**Control Recommendations:** If character key shortcuts are used, provide end users
with the ability to disable or remap them. Implement keyboard settings within the
interface for customisation, ensuring shortcuts do not interfere with common keyboard
interactions.

**Rationale:** Reduces the risk of accidental activation of keyboard shortcuts for
keyboard users and speech input users, whose dictation is interpreted as strings of
letters.

*[Site note: this is an A-level SC in WCAG, yet DSS places it at Level 2 in the Others
profile — another reason not to treat DSS levels as a WCAG conformance statement.]*

### WO-4: Adjustable Timings

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.2.1 Timing Adjustable (A)

**Control Statement:** Allow time limits to be turned off, adjusted, or extended.

**Control Recommendations:** Avoid time-dependent functions unless absolutely
necessary. Ensure timers are non-disruptive and adjustable or extendable. Not required
when the time limit is: a) Mandatory from a legal point of view b) Required as part of
a real-time event where extensions would invalidate the activity c) Longer than 20
hours

**Rationale:** Persons with disabilities may need more time to complete complex tasks
such as filling out lengthy grant forms. Designing functions that are not
time-dependent or allow for adjustable timings will help everyone, especially people
with disabilities, succeed at completing these tasks.

### WO-5: Pause, Stop, Hide

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.2.2 Pause, Stop, Hide (A)

**Control Statement:** Provide a function to pause, stop, hide or control the frequency
of moving, blinking, scrolling or auto-updating content that occur in parallel with
other content.

**Control Recommendations:** Content changes refer to, but are not exclusive to,
auto-updating information, animations containing essential information or similar
components. Allow users to pause, stop, or hide content that automatically moves,
blinks, scrolls or auto-updates for more than 5 seconds.

**Rationale:** Content that moves or auto-updates can be a barrier to anyone who has
trouble reading stationary text quickly, tracking moving objects or noticing page
changes easily. It can also cause problems for screen readers.

### WO-6: Reduce Flash Triggers

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.3.1 Three Flashes or Below Threshold (A)

**Control Statement:** Avoid content that flashes more than three times per second or
provide a warning and the option to skip such content.

**Control Recommendations:** Provide a clearly displayed warning message such as "This
video may potentially trigger seizures for people with photosensitive epilepsy. Viewer
discretion is advised." Excludes flashes contained in a small area, are low contrast or
include a small amount of the colour red.

**Rationale:** Flashing content can trigger seizures in end users with photosensitive
epilepsy leading to serious health risks for these users.

### WO-7: Bypass Repeating Content

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.4.1 Bypass Blocks (A)

**Control Statement:** Provide a means of skipping repetitive blocks of content that
appear across multiple pages.

**Control Recommendations:** Implement visible and keyboard accessible link(s) for end
users to skip repeated content blocks and/or group blocks of repeated material in a way
that can be skipped through the use of ARIA landmarks or heading markup.

**Rationale:** End users who navigate sequentially with keyboards or screen readers
often encounter repeated content such as headers and navigation links across multiple
pages. Providing a mechanism to bypass these repetitive sections enables users to
access the main content more efficiently.

### WO-8: Page Title And Purpose

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.4.2 Page Titled (A)

**Control Statement:** Provide a page title describing the purpose of every web page or
distinct Single-Page Application view served from the same Uniform Resource Identifier
(URI).

**Control Recommendations:** Provide a clear and succinct page title that describes the
purpose of the page. For example, "Budget 2024 Support Schemes Calculator" is a clear
title stating the page contains a calculator for Support Schemes from Budget 2024.

**Rationale:** Clear, descriptive titles provide quick context, enabling all end users
(including users of assistive technologies) to quickly understand where they are
without having to scan page content. They also facilitate efficient navigation in site
maps and search results, allowing rapid identification of relevant information.

### WO-9: Sequential Focus Order

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.4.3 Focus Order (A)

**Control Statement:** Ensure focusable components receive focus in an order that
preserves meaning and operability when the navigation sequences affect meaning or
operation.

**Control Recommendations:** When a user triggers a focusable element like a modal
dialog via an element (button or link), the keyboard focus should be set to within the
modal and limited to the elements of modal until dismissed. When the modal is
dismissed, the keyboard focus should logically return to the original trigger element
to minimise confusion for the user.

**Rationale:** Allows keyboard users to navigate in a sequence that reflects the
content's logical structure, preventing disorientation from unexpected tabbing focus.
This approach accommodates various valid navigation patterns while preserving content
coherence. Implementing this improves accessibility, often results in cleaner markup,
and can enhance SEO, benefiting all users.

### WO-10: Link Text And Purpose

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.4.4 Link Purpose (In Context) (A)

**Control Statement:** Ensure that link text identifies the purpose of the link and can
be interpreted easily on its own.

**Control Recommendations:** Avoid using vague link text such as "click here" or "read
more".

**Rationale:** Descriptive and meaningful link text helps users understand the content
and purpose of each link without needing to read the surrounding text. This is
especially important for screen reader users who often navigate web pages by jumping
from one link to another. It also improves the SEO value of a page and helps all users
find the information they need more efficiently.

### WO-11: Multiple Ways

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 2.4.5 Multiple Ways (AA)

**Control Statement:** Provide at least two ways to reach the same content.

**Control Recommendations:** Focus on information architecture and implement multiple
ways to reach content such as clear and logical navigation structures, search function
and shortcuts.

**Rationale:** Providing multiple ways to access content allows end users to locate
content in ways that best meet their needs. Users may find one navigation path easier
or more comprehensible than another, improving both the user experience of the service
and the discoverability of content.

### WO-12: Headings and Labels

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.4.6 Headings and Labels (AA)

**Control Statement:** Provide descriptive headers and labels that identify the context
of surrounding text and the component's purpose.

**Control Recommendations:** Do not disable platform or user-agent default visual focus
indicators. If default focus indicators are not available or do not meet other
accessible guidelines like colour contrast, modify the background colour or border of
the element with focus. Ensure that 'floating' components like widgets and sticky
headers do not cover elements receiving focus.

**Rationale:** Allows end users to quickly identify which element or control has
keyboard focus. This is especially important for users relying exclusively on keyboards
to navigate.

*[Site note: as of 5 March 2026 the site's Recommendations and Rationale for WO-12 are
verbatim duplicates of WO-13's focus-indicator text and do not match the WO-12
statement — this looks like a publishing error. Implement to the statement (descriptive
headings and labels, per WCAG 2.4.6) and check the live page for a correction.]*

### WO-13: Focus Visible and Not Obscured

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.4.7 Focus Visible (AA) + 2.4.11 Focus Not Obscured (Minimum) (AA)

**Control Statement:** Ensure components receiving focus have distinguishable
indicators and are not obscured by other elements.

**Control Recommendations:** Do not disable platform or user-agent default visual focus
indicators. If default focus indicators are not available or do not meet other
accessible guidelines like colour contrast, modify the background colour or border of
the element with focus. Ensure that 'floating' components like widgets and sticky
headers do not cover elements receiving focus.

**Rationale:** Allows end users to quickly identify which element or control has
keyboard focus. This is especially important for users relying exclusively on keyboards
to navigate.

### WO-14: Simple Pointer Alternatives

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 2.5.1 Pointer Gestures (A)

**Control Statement:** Provide single-point alternatives to multipoint or path-based
interactions or gestures.

**Control Recommendations:** If multipoint or path-based gestures such as sliders and
drag-and-drop functions are used, provide alternative options to perform the same
interaction through simple single-point alternatives.

**Rationale:** Interactions that involve complicated gestures or precise movements such
as dragging or pinching can be challenging or impossible for end users with mobility
disabilities, elderly users, or those using adaptive input devices.

*[Site note: the drag-and-drop wording also substantially covers WCAG 2.2's new SC
2.5.7 Dragging Movements (AA), which has no separate DSS control.]*

### WO-15: Pointer Cancellation

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 2.5.2 Pointer Cancellation (A)

**Control Statement:** Provide a predictable and consistent way to cancel or undo
pointer interactions.

**Control Recommendations:** Implement clear and accessible methods to cancel critical
actions such as an "undo" function. Confirmation dialogs can be used as a secondary
confirmation for critical actions. Unless absolutely necessary, only execute a function
when the click or touch is released (up-event) instead of when the click or touch is
made (down-event). This gives end users the opportunity to cancel the activation after
by moving their pointer or finger away from the target before releasing.

**Rationale:** People with various disabilities can accidentally initiate touch or
mouse events. Allowing such end users to easily recover from such unintended pointer
actions minimises unintended consequences such as accidental submissions.

### WO-16: Label In Name

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.5.3 Label in Name (A)

**Control Statement:** Ensure that visible text labels of user interface components
match or are contained within their programmatic or accessible names.

**Control Recommendations:** Ensure that accessibility labels meaningfully describe the
equivalent visual UI element by containing both the visible text label and other
contextual descriptors that help assistive technology users fully understand the
purpose and interaction.

**Rationale:** Matching visible text labels with the programmatic component supports
the use of assistive technologies such as allowing speech-input users to navigate by
speaking the visible text labels of components.

### WO-17: Motion Actuation

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.5.4 Motion Actuation (A)

**Control Statement:** Provide an option to disable motion control for motion-operated
features, and provide alternative means to operate such features.

**Control Recommendations:** When implementing motion-operated features, provide a way
to disable motion actuation and offer alternative means to operate these features
through user interface components. Not required when motion is essential to the
function, such as in pedometers that require device motion to count steps.

**Rationale:** End users with motor impairments may have difficulty holding or moving a
device steadily, which can prevent them from using motion-operated features and may
cause accidental triggering of functions.

### WO-18: Minimum Pointer Target Size

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 2.5.8 Target Size (Minimum) (AA)

**Control Statement:** Ensure that interactive areas for pointer input are at least 24
by 24 CSS pixels.

**Control Recommendations:** Use min-height and min-width to ensure sufficient target
spacing. If targets have to be smaller than 24-pixels, they must be spaced so that a
24-pixel area around each target does not overlap adjacent targets. Follow platform
guidelines and consider larger target sizes for mobile applications and mobile web
browsing where touch is the input mechanism. Not required if the size of the
interactive area is constrained by the line-height of non-interactive text such as text
links within a body of text.

**Rationale:** End users with physical and fine motor disabilities require more effort
to accurately activate small targets or targets that are close to each other. Ensuring
pointer inputs are large enough with sufficient spacing between targets reduces the
likelihood of errors from accidentally activating the wrong control.

---

## WU — WCAG: Understandable

"Controls to ensure content and user interfaces are clear and comprehensible."

### WU-1: Language of Page

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.1.1 Language of Page (A)

**Control Statement:** Ensure that the primary language on a page is programmatically
determined.

**Control Recommendations:** For websites, specify the primary language of each webpage
using the lang attribute in the HTML tag. For mobile apps, set the language of the app
content using the platform's appropriate language or accessibility attribute such the
accessibilityLanguage attribute for iOS. For PDFs, use the /Lang entry to specify the
language of the document or section.

**Rationale:** Specifying the language ensures that assistive technology can present
content to end users using the correct language settings. This includes pronunciation
rules and rendering of display characters and scripts.

### WU-2: Language of Parts

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.1.2 Language of Parts (AA)

**Control Statement:** Ensure the language of words or sections that differ from the
page's primary language is programmatically determined.

**Control Recommendations:** Specify the language of text that differs from the primary
language of the page using the lang attribute in HTML elements or the platform's
equivalent language tagging feature.

**Rationale:** Allows assistive technology to identify language changes and properly
present content in the correct intonation and proper pronunciation to end users.

### WU-3: Unusual Words

Levels: Others **2** · High Impact **1** — WCAG 2.2 SC (inferred): 3.1.3 Unusual Words (AAA)

**Control Statement:** Provide definitions for technical jargon and unusual terms.

**Control Recommendations:** Avoid jargon and unusual terms where possible. If
absolutely necessary, provide contextual help such as inline explanations, tooltips, or
glossaries.

**Rationale:** Slang, jargon, metaphors, and figures of speech may not be understood by
some groups of end users. Identifying and providing relevance guidance make such
content more accessible to everyone.

### WU-4: Abbreviations

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.1.4 Abbreviations (AAA)

**Control Statement:** Provide the expanded form of abbreviations.

**Control Recommendations:** Provide expanded forms of abbreviations the first time
they appear on a page or flow, or provide contextual help such as inline explanations,
tooltips, or glossaries. Not required for common abbreviations such as PDF and SMS
where presenting the expanded form is unnecessary for understanding of meaning, and may
negatively affect the reading experience.

**Rationale:** Abbreviations or acronyms may not be understood by some end users,
especially when used for the first time in a page or section.

### WU-5: Changes On Focus

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.2.1 On Focus (A)

**Control Statement:** Avoid changing the context when a user interface component
receives focus

**Control Recommendations:** If a component triggers an event when it receives focus,
the context should not be changed. Avoid actions such as form submissions, opening a
new window and changing focus to another component when a component receives focus.

**Rationale:** Unexpected changes of context triggered by focus change can be
disorienting to users of assistive technology. Ensuring that context changes are
predictable helps end users feel secure and in control while navigating a site.

### WU-6: Changes On Input

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.2.2 On Input (A)

**Control Statement:** Provide advance warning when input causes a change of context.

**Control Recommendations:** Clicking on links or buttons are not considered inputs or
changing the setting of that control in the context of this control. Explicitly inform
end users if provision of input like checking a checkbox or entering text into a text
field results in a change in context. Changes in context include responses like
navigation to a new page or section, submission, or opening a new window.
Alternatively, provide controls such as buttons that allow end users to intentionally
trigger actions like confirming a selection or submission.

**Rationale:** Unexpected changes of context triggered by input can be disorienting to
users of assistive technology. Ensuring that context changes are predictable helps
users feel secure and in control while navigating a site.

### WU-7: Consistent Navigation

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.2.3 Consistent Navigation (AA)

**Control Statement:** Implement a primary or main navigation panel that: is placed at
or near the top of the website; is not hidden or collapsed within an icon on desktop
for websites; presents navigation links in the same relative order on each page

**Control Recommendations:** Test the top navigation component with users to ensure it
is usable and accessible.

**Rationale:** Unexpected changes of context triggered by focus change can be
disorienting to end users with sensory or cognitive impairment, or users of assistive
technology.

*[Site note: the rationale text appears copy-pasted from WU-5/WU-6; the statement goes
beyond WCAG 3.2.3 by prescribing top placement and no icon-collapsed nav on desktop —
these SG-specific requirements are normative here.]*

### WU-8: Consistent Identification

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.2.4 Consistent Identification (AA)

**Control Statement:** Identify and label repeated or related components consistently
within the digital service.

**Control Recommendations:** Ensure that text used to identify a component such as
label, name, or text alternatives are identical for each user interface component with
the same function within the digital service.

**Rationale:** Allows end users to quickly learn and understand navigation, design and
interaction patterns within the digital service. This reduces cognitive load and
increase efficiency of task completion.

### WU-9: Consistent Help

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.2.6 Consistent Help (A)

**Control Statement:** Place help and support mechanisms consistently across multiple
pages.

**Control Recommendations:** Implementing the tl-4: Official Government Footer ensures
consistent placement of contact and FAQ across multiple pages. Ensure that other help
and support mechanisms such as messaging systems or chatbots are also consistently
placed across multiple pages.

**Rationale:** Help and assistance are key aspects of a digital service. Consistent
placement makes it easy for end users, especially those who may struggle with complex
or unfamiliar interfaces to find help and support mechanisms.

### WU-10: Error Identification

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.3.1 Error Identification (A)

**Control Statement:** Indicate input errors by: a) Visually and audibly identifying
the component or section that generated the error b) Providing a text description of
the error

**Control Recommendations:** Clearly associate error messages with the source component
or section. Ensure the error is easily identifiable and noticeable visually and for
users of screen readers by using techniques such as ARIA attributes and requirements in
wp-11.

**Rationale:** Helping end users easily and quickly identify, locate and understand
errors minimises the frustration of encountering and resolving errors.

### WU-11: Error Suggestion

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.3.3 Error Suggestion (AA)

**Control Statement:** Ensure that error messages: a) Explain what went wrong in
non-technical language. b) Explain how to correct the issue or provide alternative
actions (If suggestions for correction are known)

**Control Recommendations:** Write error messages in plain language that is understood
by end users of different backgrounds, and helps the user understand or resolve the
issue. This applies to all error messages including inline form errors and system error
pages such as 404, 500 errors.

**Rationale:** Error messages that are not clear or do not provide useful and
actionable information prevent end users from completing their tasks and lead to
frustration.

### WU-12: Error Prevention

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.3.4 Error Prevention (Legal, Financial, Data) (AA)

**Control Statement:** Prevent errors by: a) Checking user-entered data for errors
and/or providing a mechanism to review, confirm, and correct information before final
submission b) Allow submissions to be reversed (if feasible)

**Control Recommendations:** Implement proper error validation. Provide a summary page
or section for users to review and correct their inputs/information before submission.
This is essential for multi-page forms which are difficult to review, and transactions
with significant consequences such as those involving payments or having legal
implications.

**Rationale:** Providing ways for end users to confirm, correct, or reverse important
submissions reduces the chance of errors.

### WU-13: Redundant Entry

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.3.7 Redundant Entry (A)

**Control Statement:** Avoid requiring re-entry of information already provided within
the same process.

**Control Recommendations:** Either auto-populate or allow the end user to select
information that was already provided. This is not required if the information is
required to ensure the security of the content (E.g. Confirm password) or if the
previously entered information is no longer valid.

**Rationale:** Repetitive data entry requires unnecessary effort especially for end
users with cognitive or motor impairments who may struggle with entering information.

### WU-14: Accessible Authentication (Minimum)

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 3.3.8 Accessible Authentication (Minimum) (AA)

**Control Statement:** Provide accessible authentication alternatives that do not
require recalling, solving, or transcribing information.

**Control Recommendations:** Provide at least 1 non-password authentication such as
Singpass QR login or text/email based one-time codes.

**Rationale:** End users with cognitive impairments have difficulties recalling or
performing cognitively demanding actions.

---

## WR — WCAG: Robust

"Controls to ensure content remains accessible across various technologies and
assistive tools."

### WR-1: Name, Role, Value

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 4.1.2 Name, Role, Value (A)

**Control Statement:** Ensure that essential information of custom components and
controls can be identified and read by assistive technologies.

**Control Recommendations:** Essential information including name, roles, properties,
values, states, and state changes are provided using techniques like ARIA labels.
Standard HTML controls should already meet this criterion when used according to
specification. (example: text input field)

**Rationale:** Enables end users of assistive technology to properly understand and
interact with custom components.

### WR-2: Status Messages

Levels: Others **1** · High Impact **1** — WCAG 2.2 SC (inferred): 4.1.3 Status Messages (AA)

**Control Statement:** Ensure that assistive technology can identify and announce
system status changes that don't receive focus.

**Control Recommendations:** Use ARIA roles and properties to inform users of status
changes, such as when an incorrect text in an input is entered and a status message
appears above.

**Rationale:** Allows screen readers to identify and announce changes to content that
may otherwise be missed by users of assistive technologies. This benefits users with
visual impairments who unlike sighted users may not notice changes outside of their
area of focus.
