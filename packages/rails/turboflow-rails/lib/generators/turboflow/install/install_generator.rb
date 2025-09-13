# frozen_string_literal: true

module TurboFlow
  module Generators
    class InstallGenerator < Rails::Generators::Base
      source_root File.expand_path("templates", __dir__)

      def create_initializer
        template "turboflow.rb", "config/initializers/turboflow.rb"
      end

      def add_to_application_layout
        say "Add the following to your application layout:", :green
        say "  <%= turboflow_meta_tags %>"
        say "  <%= turboflow_config %>"
      end
    end
  end
end