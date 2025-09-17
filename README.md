# TurboFlow

> Beautiful, smooth page transitions for Rails and Hotwire applications using the native View Transitions API

## Why TurboFlow?

Modern users expect smooth, app-like experiences on the web. While Turbo Drive eliminates full page reloads, the instant page swaps can feel jarring. TurboFlow bridges this gap by adding beautiful, customizable transitions between pages - making your Rails app feel as smooth as a native mobile application.

### The Problem
- Instant page changes in Turbo can feel abrupt and disorienting
- Users lose context during navigation
- Traditional web apps feel static compared to native apps
- Complex JavaScript animation libraries are heavy and hard to maintain

### The Solution
TurboFlow leverages the browser's native View Transitions API to deliver:
- **Smooth, hardware-accelerated transitions** that feel native
- **Zero JavaScript configuration required** for basic usage - just HTML data attributes
- **Automatic Turbo integration** - works with your existing Hotwire setup
- **Tiny footprint** - under 10KB gzipped, no dependencies

## Features

### Built-in Transitions
Choose from beautiful, pre-designed transitions:
- **fade** - Smooth opacity cross-fade
- **slide** - iOS-style sliding navigation
- **zoom** - Scale and fade like native modals
- **flip** - Engaging 3D card flip effect
- **morph** - Seamlessly transform elements between pages
- **more coming soon** - Aninations will be added regularly

Default transition is **fade**

### Smart Defaults
- Automatically detects navigation direction (forward/back)
- Different transitions for different actions (links, forms, frames)
- Respects user preferences (`prefers-reduced-motion`)
- Falls back gracefully in older browsers

### Developer Friendly
```erb
<!-- With Rails helpers -->
<%= link_to "About", about_path, data: { "turbo-flow": "slide" } %>

<!-- With Turboflow helpers -->
<%= link_flow_to "About", about_path, flow: :slide %>
```

### Seamless Integration
- Works with Turbo Drive, Frames, and Streams
- No changes to controllers or routes
- Progressive enhancement - your app works without JavaScript
- Compatible with Stimulus and other Hotwire tools

## See It In Action

Demos coming soon

Watch how TurboFlow transforms a standard Rails app:
- Navigation feels smooth and intentional
- Users maintain context with directional transitions
- Forms zoom in/out for focused interactions
- Content morphs seamlessly between states

## Packages

This monorepo contains:

- [`packages/core`](./packages/core) - Core JavaScript library (NPM package @turboflow/core)
- [`packages/rails/turboflow-rails`](./packages/rails/turboflow-rails) - Rails integration (Ruby gem)

**NOTE:** Both NPM and Ruby Gem packages are coming soon.

## Quick Start

### Rails Installation

Add to your Gemfile:
```ruby
gem 'turboflow-rails'
```

Run the installer:
```bash
bundle install
bin/rails generate turbo_flow:install
```

Start using transitions:
```erb
<!-- Links with transitions -->
<%= link_flow_to "Next Page", page_path, flow: :slide %>

<!-- Forms that zoom -->
<%= form_with model: @post, data: { "turbo-flow": "zoom" } do |f| %>
  <!-- form fields -->
<% end %>

<!-- Elements that morph -->
<div id="hero-banner" data-turbo-flow-target="morph">
  <!-- morphs between pages -->
</div>
```

### JavaScript/HTML Installation

For non-Rails projects:
```bash
npm install @turboflow/core
```


```html
<head>
  <title>TurboFlow</title>

  //Include view-transition meta tag (REQUIRED)
  <meta name="view-transition" content="same-origin" />

  // Include @hotwired/turbo
  <script type="module">
    import * as Turbo from 'https://cdn.jsdelivr.net/npm/@hotwired/turbo@8.0.12/+esm'
  </script>

  // Include link to turboflow js
  <script src="turboflow.umd.js" defer></script>
</head>
```

```html
// Add turboflow data attribute to HTML element
<a href="/page" data-turbo-flow="slide">Slide to page</a>
```

## Browser Support

TurboFlow uses the View Transitions API with automatic fallbacks:
- ✅ Chrome 111+ - Full support with native API
- ✅ Edge 111+ - Full support with native API
- ⚠️ Safari - Graceful fallback (no transitions)
- ⚠️ Firefox - Graceful fallback (no transitions)

Your app remains fully functional in all browsers - older browsers simply won't show transitions.

## Documentation

See the full documentation at [turboflow.dev](https://turboflow.dev) or check the package docs:
- [JavaScript API Reference](./packages/core/README.md)
- [Rails Integration Guide](./packages/rails/turboflow-rails/README.md)
- [Examples](#) (coming soon)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © TurboFlow Team
