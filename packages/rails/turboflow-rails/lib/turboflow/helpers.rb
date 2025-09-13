# frozen_string_literal: true

module TurboFlow
  module Helpers
    def turboflow_meta_tags
      safe_join([
        tag(:meta, name: "view-transition", content: "same-origin"),
        javascript_include_tag("turboflow", "data-turbo-track": "reload", defer: true)
      ])
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
      html_options["data-turbo-flow"] = flow if flow

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
      html_options["data-turbo-flow"] = flow if flow

      button_to(name, options, html_options)
    end

    def form_flow_with(**options, &block)
      flow = options.delete(:flow)
      success_flow = options.delete(:success_flow)
      error_flow = options.delete(:error_flow)

      options["data-turbo-flow"] = flow if flow
      options["data-turbo-flow-success"] = success_flow if success_flow
      options["data-turbo-flow-error"] = error_flow if error_flow

      form_with(**options, &block)
    end

    def turboflow_frame_tag(id = nil, **options, &block)
      flow = options.delete(:flow)
      options["data-turbo-flow"] = flow if flow

      turbo_frame_tag(id, **options, &block)
    end

    def turboflow_morph_target(id, tag: :div, **options, &block)
      options[:id] = id
      options["data-turbo-flow-target"] = "morph"

      content_tag(tag, **options, &block)
    end

    def turboflow_element(id, flow: "morph", tag: :div, **options, &block)
      options[:id] = id
      options["data-turbo-flow-target"] = flow

      content_tag(tag, **options, &block)
    end

    def turboflow_config(options = {})
      base_config = TurboFlow.config.to_h
      config = base_config.merge(
        defaultTransition: options[:default_transition] || base_config[:defaultTransition],
        duration: options[:duration] || base_config[:duration],
        easing: options[:easing] || base_config[:easing],
        debug: options[:debug] || base_config[:debug]
      )

      javascript_tag(nonce: true) do
        raw <<~JS
          document.addEventListener('DOMContentLoaded', function() {
            if (window.TurboFlow) {
              window.turboflow = new TurboFlow(#{config.to_json});
              window.turboflow.init();
            }
          });
        JS
      end
    end
  end
end
