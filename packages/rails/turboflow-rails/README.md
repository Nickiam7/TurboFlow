# TurboFlow Rails

Smooth page transitions for Rails applications with Hotwire Turbo.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'turboflow-rails'
```

And then execute:
```bash
bundle install
```

Run the install generator:
```bash
bin/rails generate turbo_flow:install
```

This will:
- Create a configuration file at `config/initializers/turboflow.rb`
- Add `turboflow_meta_tags` to your application layout
- Update your `<body>` tag to use the `turboflow_body_tag` helper

## Setup

The install generator automatically updates your application layout with:

```erb
<!-- In <head> section -->
<%= turboflow_meta_tags %>

<!-- Replace <body> with -->
<%= turboflow_body_tag class: "your-classes" do %>
  <!-- your content -->
<% end %>
```

The `turboflow_meta_tags` helper includes:
- View Transitions API meta tag
- TurboFlow configuration script
- TurboFlow JavaScript library

## Usage

### Basic Links

```erb
<%= link_flow_to "About", about_path, flow: :slide %>
<%= link_flow_to "Contact", contact_path, flow: :zoom %>
<%= button_flow_to "Delete", post_path, flow: :fade, method: :delete %>
```

### Forms

```erb
<%= form_flow_with model: @post, flow: :slide, success_flow: :fade do |form| %>
  <!-- form fields -->
<% end %>
```

### Turbo Frames

```erb
<%= turboflow_frame_tag "modal", flow: :zoom do %>
  <!-- frame content -->
<% end %>
```

### Morphing Elements

```erb
<%= turboflow_morph_target :hero do %>
  <h1>This will morph between pages</h1>
<% end %>

<%= turboflow_element :card, flow: :fade do %>
  <p>Custom element transition</p>
<% end %>
```

## Configuration

Create an initializer `config/initializers/turboflow.rb`:

```ruby
TurboFlow.configure do |config|
  config.default_transition = :fade
  config.duration = 300
  config.easing = "ease-out"
  config.debug = Rails.env.development?
  config.reduced_motion = :respect  # :respect | :force | :disable
end
```

## Available Transitions

- `fade` - Fade in/out
- `slide` - Slide horizontally
- `slideUp` - Slide vertically up
- `slideDown` - Slide vertically down
- `zoom` - Scale in/out
- `flip` - 3D flip
- `morph` - Morph between elements with same ID

## License

MIT License