# frozen_string_literal: true

TurboFlow.configure do |config|
  # Default transition animation for all links
  # Available: :fade, :slide, :slideUp, :slideDown, :zoom, :flip, :morph
  config.default_transition = :fade

  # Animation duration in milliseconds
  config.duration = 300

  # CSS easing function
  config.easing = "ease-out"

  # Enable debug mode (logs transitions and CSS generation)
  config.debug = Rails.env.development?

  # Automatically inject CSS for transitions
  config.auto_inject = true

  # Reduced motion handling
  # :respect - Follow user's prefers-reduced-motion setting
  # :force - Always animate regardless of user preference  
  # :disable - Never animate
  config.reduced_motion = :respect

  # Cleanup interval for unused CSS (milliseconds)
  config.cleanup_interval = 5000
end