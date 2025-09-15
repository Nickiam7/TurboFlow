# frozen_string_literal: true

require "test_helper"

class TurboFlowTest < Minitest::Test
  def test_that_it_has_a_version_number
    refute_nil ::TurboFlow::VERSION
  end

  def test_configuration_defaults
    config = TurboFlow::Configuration.new
    
    assert_equal :fade, config.default_transition
    assert_equal 300, config.duration
    assert_equal "ease-out", config.easing
    assert_equal false, config.debug
  end

  def test_configure_block
    TurboFlow.configure do |config|
      config.default_transition = :slide
      config.duration = 500
      config.debug = true
    end

    assert_equal :slide, TurboFlow.configuration.default_transition
    assert_equal 500, TurboFlow.configuration.duration
    assert_equal true, TurboFlow.configuration.debug
  end

  def test_configuration_persists
    # Reset configuration first
    TurboFlow.instance_variable_set(:@configuration, nil)
    
    # First access creates default configuration
    config1 = TurboFlow.configuration
    assert_equal :fade, config1.default_transition
    
    # Modify it
    config1.default_transition = :zoom
    
    # Second access should return the same instance
    config2 = TurboFlow.configuration
    assert_equal :zoom, config2.default_transition
    assert_equal config1.object_id, config2.object_id
  end
end