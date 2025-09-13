# frozen_string_literal: true

require_relative "lib/turboflow/version"

Gem::Specification.new do |spec|
  spec.name = "turboflow-rails"
  spec.version = TurboFlow::VERSION
  spec.authors = ["Your Name"]
  spec.email = ["your.email@example.com"]

  spec.summary = "Smooth page transitions for Rails applications with Turbo"
  spec.description = "TurboFlow brings native app-like page transitions to Rails applications using Hotwire Turbo and the View Transitions API"
  spec.homepage = "https://github.com/Nickiam7/turboflow"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 2.7.0"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/Nickiam7/turboflow"
  spec.metadata["changelog_uri"] = "https://github.com/Nickiam7/turboflow/blob/main/CHANGELOG.md"

  spec.files = Dir.chdir(__dir__) do
    Dir["{app,config,db,lib,vendor}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end

  spec.add_dependency "rails", ">= 7.0.0"
  spec.add_dependency "turbo-rails", ">= 1.0.0"
end