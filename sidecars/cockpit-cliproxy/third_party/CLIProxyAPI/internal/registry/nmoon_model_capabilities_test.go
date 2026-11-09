package registry

import "testing"

func TestNmoonGPT6StaticCapabilities(t *testing.T) {
	for _, tc := range []struct {
		id         string
		context    int
		lastEffort string
	}{
		{"gpt-6.1-sol", 272000, "ultra"},
		{"gpt-6-sol", 256000, "ultra"},
		{"gpt-6-luna", 256000, "max"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			m := LookupStaticModelInfo(tc.id)
			if m == nil {
				t.Fatal("missing capabilities for API Key forwarding")
			}
			if m.ID != tc.id || m.ContextLength != tc.context || m.Thinking == nil {
				t.Fatalf("incorrect model metadata: %#v", m)
			}
			levels := m.Thinking.Levels
			if len(levels) == 0 || levels[len(levels)-1] != tc.lastEffort {
				t.Fatalf("incorrect reasoning levels: %v", levels)
			}
			m.Thinking.Levels[0] = "modified"
			if LookupStaticModelInfo(tc.id).Thinking.Levels[0] == "modified" {
				t.Fatal("lookup must return independent metadata")
			}
		})
	}
	if LookupStaticModelInfo("gpt-6-unavailable") != nil {
		t.Fatal("unknown models must not inherit GPT-6 capabilities")
	}
}
