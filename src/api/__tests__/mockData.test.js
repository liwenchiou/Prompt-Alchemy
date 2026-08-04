import { describe, it, expect } from "vitest";
import {
  getParameterById,
  getParameterName,
  getParametersByType,
  getPrompts,
  getPromptById,
  skillItemsTable,
} from "../mocks/mockData";

describe("Relational Mock Database Helper Tests", () => {
  describe("getParameterById", () => {
    it("should return the correct parameter details for a valid ID", () => {
      const paramId = "cat-frontend-uuid-0000-000000000001";
      const param = getParameterById(paramId);
      expect(param).toBeDefined();
      expect(param.name).toBe("前端開發");
      expect(param.type).toBe("category");
    });

    it("should return undefined for a non-existent ID", () => {
      const param = getParameterById("invalid-id");
      expect(param).toBeUndefined();
    });
  });

  describe("getParameterName", () => {
    it("should return the name string for a valid ID", () => {
      const name = getParameterName("role-admin-uuid-0000-000000000001");
      expect(name).toBe("Admin");
    });

    it("should return an empty string for an invalid ID", () => {
      const name = getParameterName("invalid-id");
      expect(name).toBe("");
    });
  });

  describe("getParametersByType", () => {
    it("should return only parameters of the specified type", () => {
      const categories = getParametersByType("category");
      expect(categories.length).toBeGreaterThan(0);
      categories.forEach((cat) => {
        expect(cat.type).toBe("category");
        expect(cat.is_active).toBe(true);
      });
    });

    it("should return empty list if no active parameters match the type", () => {
      const results = getParametersByType("non-existent-type");
      expect(results).toEqual([]);
    });
  });

  describe("getPrompts", () => {
    it("should return only active prompts", () => {
      const prompts = getPrompts();
      expect(prompts.length).toBeGreaterThan(0);
      prompts.forEach((prompt) => {
        expect(prompt.is_active).toBe(true);
      });
    });
  });

  describe("getPromptById", () => {
    it("should fetch details for a valid prompt ID", () => {
      const firstPrompt = skillItemsTable[0];
      const prompt = getPromptById(firstPrompt.id);
      expect(prompt).toBeDefined();
      expect(prompt.title).toBe(firstPrompt.title);
    });

    it("should return undefined for a non-existent prompt ID", () => {
      const prompt = getPromptById("invalid-prompt-uuid");
      expect(prompt).toBeUndefined();
    });
  });

  describe("skillItemsTable example_output structure", () => {
    it("should have example_output as a block array for all items", () => {
      skillItemsTable.forEach((item) => {
        expect(item.example_output).toBeDefined();
        expect(Array.isArray(item.example_output)).toBe(true);
        item.example_output.forEach((block) => {
          expect(block.type).toBeTypeOf("string");
          expect(["text", "image", "video", "html"]).toContain(block.type);
          expect(block.data).toBeTypeOf("object");
          expect(block.data.context).toBeTypeOf("string");
          expect(block.seq).toBeTypeOf("number");
        });
      });
    });

    it("should return video URLs ending in .mp4 for the new Gemini video generator prompts", () => {
      const videoPrompts = skillItemsTable.filter(
        (item) =>
          item.id === "prompt-uuid-0001-0000-000000000008" ||
          item.id === "prompt-uuid-0001-0000-000000000009"
      );
      expect(videoPrompts.length).toBe(2);
      videoPrompts.forEach((item) => {
        const videoBlocks = item.example_output.filter(
          (b) => b.type === "video"
        );
        expect(videoBlocks.length).toBeGreaterThan(0);
        videoBlocks.forEach((media) => {
          expect(media.data.context).toMatch(/\.mp4(\?|#|$)/i);
        });
      });
    });
  });
});
