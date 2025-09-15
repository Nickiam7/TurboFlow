# frozen_string_literal: true

module TurboFlow
  class Configuration
    attr_accessor :default_transition, :duration, :easing, :debug

    def initialize
      @default_transition = :fade
      @duration = 300
      @easing = "ease-out"
      @debug = false
    end
  end
end