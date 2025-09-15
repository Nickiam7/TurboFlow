# frozen_string_literal: true

require "rails/generators/base"

module TurboFlow
  class InstallGenerator < Rails::Generators::Base
    source_root File.expand_path("templates", __dir__)

    def create_initializer
      template "turboflow.rb", "config/initializers/turboflow.rb"
    end

    def update_application_layout
      return unless File.exist?(application_layout_path)

      insert_turboflow_meta_tags
      # No longer replacing body tags - just use regular <body> tags
    end

    def display_post_install_message
      say "\n" + "="*60, :blue
      say "TurboFlow installation complete!", :green
      say "="*60 + "\n", :blue

      say "\nLayout Updates:", :yellow
      say "   • turboflow_meta_tags added to <head>\n"

      say "\nUsage Examples:", :yellow
      say "   • Link with transition:"
      say "   • <%= link_flow_to 'About', about_path, flow: :slide %>\n"

      say "   • Button with transition:"
      say "   • <%= button_flow_to 'Submit', path, flow: :zoom %>\n"

      say "   • Available transitions: fade, slide, zoom, flip, morph\n"

      say "\nConfiguration:", :yellow
      say "   • Edit config/initializers/turboflow.rb to customize defaults\n"

      say "\nDocumentation:", :yellow
      say "   • https://github.com/Nickiam7/turboflow\n"
    end

    private

    def application_layout_path
      Rails.root.join("app/views/layouts/application.html.erb")
    end

    def insert_turboflow_meta_tags
      return if File.read(application_layout_path).include?("turboflow_meta_tags")

      # Use Thor's insert_into_file method for clean insertion
      insert_into_file application_layout_path,
                       "\n    <%= turboflow_meta_tags %>",
                       after: "<%= csp_meta_tag %>"

      say "   ✅ Added turboflow_meta_tags to layout", :green
    rescue Errno::ENOENT
      say "   ⚠️  Could not find csp_meta_tag in layout", :yellow
    end

    # No longer needed - regular body tags work fine
    # def replace_body_tags
    #   # Removed - TurboFlow works with regular <body> tags
    # end
  end
end
