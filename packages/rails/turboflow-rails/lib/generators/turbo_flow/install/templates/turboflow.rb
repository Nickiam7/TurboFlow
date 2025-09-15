# frozen_string_literal: true

TurboFlow.configure do |config|
  # Default transition for all links
  # Options: :fade, :slide, :slideUp, :slideDown, :slideLeft, :slideRight, :zoom, :flip
  config.default_transition = :fade

  # Animation duration in milliseconds
  config.duration = 300

  # CSS easing function
  config.easing = "ease-out"

  # Enable debug logging
  config.debug = Rails.env.development?
end