# frozen_string_literal: true

$LOAD_PATH.unshift File.expand_path("../lib", __dir__)

# Load Rails first
require "rails"
require "action_controller/railtie"
require "action_view/railtie"

# Now load turboflow-rails
require "turboflow-rails"

require "minitest/autorun"