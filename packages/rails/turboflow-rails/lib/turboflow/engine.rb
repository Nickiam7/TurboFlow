# frozen_string_literal: true

module TurboFlow
  class Engine < ::Rails::Engine
    isolate_namespace TurboFlow

    initializer "turboflow.helpers" do
      ActiveSupport.on_load(:action_view) do
        include TurboFlow::Helpers
      end
    end

    initializer "turboflow.assets" do |app|
      app.config.assets.paths << Engine.root.join("app/assets/javascripts")
      app.config.assets.precompile += %w[
        turboflow.js
      ]
    end
  end
end
