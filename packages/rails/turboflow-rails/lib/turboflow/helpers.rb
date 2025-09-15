# frozen_string_literal: true

module TurboFlow
  module Helpers
    def turboflow_meta_tags
      safe_join([
        tag(:meta, name: "view-transition", content: "same-origin"),
        turboflow_config_script,
        turboflow_script_tag
      ])
    end

    def turboflow_script_tag
      javascript_include_tag("turboflow", "data-turbo-track": "reload")
    end

    def turboflow_body_tag(options = {}, &block)
      content_tag(:body, options, &block)
    end

    def turboflow_config_script
      config = TurboFlow.configuration

      javascript_tag do
        <<~JS.html_safe
          window.TurboFlowConfig = {
            defaultTransition: '#{config.default_transition}',
            duration: #{config.duration},
            easing: '#{config.easing}',
            debug: #{config.debug}
          };

          if (window.TurboFlow) {
            window.TurboFlow.configure(window.TurboFlowConfig);
          } else {
            document.addEventListener('DOMContentLoaded', function() {
              if (window.TurboFlow) {
                window.TurboFlow.configure(window.TurboFlowConfig);
              }
            });
          }
        JS
      end
    end

    def link_flow_to(name = nil, options = nil, html_options = nil, &block)
      if block_given?
        html_options = options || {}
        options = name
        name = capture(&block)
      else
        html_options ||= {}
      end

      flow = html_options.delete(:flow)
      html_options["data-turbo-flow"] = flow.to_s if flow

      link_to(name, options, html_options)
    end

    def button_flow_to(name = nil, options = nil, html_options = nil, &block)
      if block_given?
        html_options = options || {}
        options = name
        name = capture(&block)
      else
        html_options ||= {}
      end

      flow = html_options.delete(:flow)
      html_options["data-turbo-flow"] = flow.to_s if flow

      button_to(name, options, html_options)
    end
  end
end
