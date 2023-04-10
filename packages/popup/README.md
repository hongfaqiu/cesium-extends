# @cesium-extends/popup

A lightweight and easy-to-use popup component for CesiumJS.
[中文 Readme](./README_CN.md)

## Installation

To install `@cesium-extends/popup`, run:

```bash
npm install @cesium-extends/popup
```

## Usage

Here's an example of how to use `@cesium-extends/popup`:

```javascript
import Popup from "@cesium-extends/popup";
import { Viewer } from "cesium";

const viewer = new Viewer("cesiumContainer");

const options = {
  position: [120, 30, 0],
  element: document.getElementById("popup"),
  offset: [10, 10],
};

const popup = new Popup(viewer, options);

// Update the popup's position
popup.position = [121, 31, 0];

// Destroy the popup
popup.destroy();
```

### PopupOptions

The `PopupOptions` interface has the following properties:

- `position`: The position of the popup, specified as an array of `[longitude, latitude, height]`. If `null`, the popup will be hidden.
- `element`: The HTML element that represents the popup.
- `offset` (optional): An array of `[xOffset, yOffset]` that specifies the offset of the popup from its position.

### Properties

- `position`: Gets or sets the position of the popup.
- `destroyed`: Indicates whether the popup has been destroyed.

### Methods

- `switchElementShow(val: boolean)`: Shows or hides the popup.
- `setPosition()`: Updates the position of the popup.
- `destroy()`: Destroys the popup, removing any event listeners and cleaning up resources.
