package main

import "testing"

func TestNmoonGPT61CatalogAndRouting(t *testing.T) {
	for _, tc := range []struct {
		model         string
		name          string
		context       int
		defaultEffort string
		ultra         bool
	}{
		{"gpt-6.1-sol", "GPT-6.1 Sol", 272000, "low", true},
		{"gpt-6-sol", "GPT-6 Sol", 256000, "medium", true},
		{"gpt-6-luna", "GPT-6 Luna", 256000, "medium", false},
	} {
		info := manifestRegistryModelInfo(tc.model, "", 0)
		if info.UserDefined || info.Thinking == nil || len(info.Thinking.Levels) == 0 {
			t.Fatalf("%s must keep shipped thinking capabilities", tc.model)
		}
		levels := info.Thinking.Levels
		if tc.ultra && levels[len(levels)-1] != "ultra" {
			t.Fatalf("%s ultra missing: %v", tc.model, levels)
		}
		if !tc.ultra && levels[len(levels)-1] == "ultra" {
			t.Fatalf("%s must not expose ultra: %v", tc.model, levels)
		}
		response := buildCodexClientModelsResponse([]string{tc.model}, &apiKeySpec{}, nil, nil)
		models := response["models"].([]map[string]any)
		if len(models) != 1 || models[0]["slug"] != tc.model || models[0]["display_name"] != tc.name || models[0]["use_responses_lite"] != true {
			t.Fatalf("%s catalog identity missing: %#v", tc.model, models)
		}
		ollamaLevels := ollamaReasoningEfforts(tc.model)
		if (ollamaLevels[len(ollamaLevels)-1] == "ultra") != tc.ultra {
			t.Fatalf("%s Ollama reasoning mismatch", tc.model)
		}
		if ollamaContextLength(tc.model) != tc.context || ollamaDefaultReasoningEffort(tc.model) != tc.defaultEffort {
			t.Fatalf("%s context/reasoning defaults missing", tc.model)
		}
	}
}
