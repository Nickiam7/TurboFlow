# frozen_string_literal: true

module TurboFlow
  class Engine < ::Rails::Engine
    isolate_namespace TurboFlow

    initializer "turboflow.assets" do
      if Rails.application.config.respond_to?(:assets)
        Rails.application.config.assets.precompile += %w[
          turboflow/index.js
        ]
      end
    end

    initializer "turboflow.helpers" do
      ActiveSupport.on_load(:action_view) do
        include TurboFlow::Helpers
      end
    end

    initializer "turboflow.importmap", before: "importmap" do |app|
      if defined?(Importmap)
        app.config.importmap.paths << Engine.root.join("config/importmap.rb")
        app.config.importmap.cache_sweepers << Engine.root.join("app/javascript")
      end
    end
  end
end