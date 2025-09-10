# @turboflow/core

Dynamic page transitions for Turbo applications.

## Installation

```bash
npm install @turboflow/core
```

## Usage

```javascript
import TurboFlow from '@turboflow/core'

const turboflow = new TurboFlow({
  defaultTransition: 'slide',
  duration: 300
})

turboflow.init()
```

Or use via CDN with auto-initialization:

```html
<script src="https://unpkg.com/@turboflow/core"></script>
```