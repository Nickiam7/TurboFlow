# frozen_string_literal: true

require "turboflow/version"
require "turboflow/configuration"
require "turboflow/engine"
require "turboflow/helpers"

module TurboFlow
  class << self
    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield(configuration)
    end
  end
end