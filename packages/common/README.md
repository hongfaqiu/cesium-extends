# @cesium-extends/common

- `Widget` is a base class that you can extend to create your own widgets. You can import it into your project:
- `DomUtil` is a utility class that provides some DOM manipulation methods.
  [中文 Readme](./README_CN.md)

## Installation

```bash
npm install --save @cesium-extends/common
```

## Usage

```javascript
import { Widget, DomUtil } from "@cesium-extends/common";
```

## Widget

`Widget` is a base class for widgets based on Cesium applications. It provides some common widget manipulation methods and properties.

### API

#### `constructor(viewer: Cesium.Viewer, wrapper: HTMLElement)`

Creates a new instance of the `Widget` class and attaches it to the specified Cesium Viewer.

##### Parameters

- `viewer`: The Cesium Viewer instance to attach the widget to.
- `wrapper`: The DOM element to mount the widget to.

#### `enabled`

A boolean property that controls whether the widget is enabled or not.

#### `ready`

A boolean property indicating whether the widget is ready or not.

#### `setContent(content: string | Element): Widget`

A method for setting the content of the widget.

##### Parameters

- `content`: A string or DOM element representing the content to set.

#### `hide()`

A method for hiding the widget.

#### `show()`

A method for showing the widget.

#### `destroy()`

A method for destroying the widget.

## DomUtil

`DomUtil` is a utility class that provides some DOM manipulation methods.

### API

#### `create(tagName: string, className: string, container: Element | null = null): HTMLElement`

Creates an HTML element with the specified `tagName`, sets its class to `className`, and optionally appends it to the `container` element.

##### Parameters

- `tagName`: The HTML tag name to create.
- `className`: The class name to set on the HTML element.
- `container` (optional): The container element to append the new element to.

#### `parseDom(domStr: string, className: string): HTMLDivElement`

Parses a string into a DOM element and returns a DIV element containing the element.

##### Parameters

- `domStr`: The string to parse.
- `className`: The class name to set on the DIV element.
