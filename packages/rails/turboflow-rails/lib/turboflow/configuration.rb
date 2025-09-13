# frozen_string_literal: true

module TurboFlow
  class Configuration
    attr_accessor :default_transition, :duration, :easing, :debug,
                  :auto_inject, :reduced_motion, :cleanup_interval

    def initialize
      @default_transition = :fade
      @duration = 300
      @easing = "ease-out"
      @debug = ::Rails.env.development?
      @auto_inject = true
      @reduced_motion = :respect
      @cleanup_interval = 5000
    end

    def to_h
      {
        defaultTransition: default_transition.to_s,
        duration: duration,
        easing: easing,
        debug: debug,
        autoInject: auto_inject,
        reducedMotion: reduced_motion.to_s,
        cleanupInterval: cleanup_interval
      }
    end

    def to_json(*args)
      to_h.to_json(*args)
    end
  end

  class << self
    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield(configuration)
    end

    def config
      configuration
    end
  end
end