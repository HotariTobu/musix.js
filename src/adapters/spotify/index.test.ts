import { describe, expect, test } from "bun:test";
import type { SpotifyAdapter, SpotifyConfig } from "../../core/types";

// Import the factory function (will fail until FR-001 is implemented)
import { createSpotifyAdapter } from "./index";

// AC-001: Adapter initialization [FR-001]
describe("createSpotifyAdapter", () => {
  describe("Factory Function", () => {
    // AC-001: Given valid Client ID and Client Secret
    test("should be exported and be a function", () => {
      expect(createSpotifyAdapter).toBeDefined();
      expect(typeof createSpotifyAdapter).toBe("function");
    });

    // AC-001: When createSpotifyAdapter is called, Then SpotifyAdapter instance is returned
    test("should return an object when called with valid config", () => {
      // Given: valid Client ID and Client Secret
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: createSpotifyAdapter is called
      const adapter = createSpotifyAdapter(config);

      // Then: an object is returned
      expect(adapter).toBeDefined();
      expect(typeof adapter).toBe("object");
      expect(adapter).not.toBeNull();
    });

    // AC-001: Instance has all required methods
    test("should return adapter with getTrack method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: getTrack method exists and is a function
      expect(adapter.getTrack).toBeDefined();
      expect(typeof adapter.getTrack).toBe("function");
    });

    test("should return adapter with searchTracks method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: searchTracks method exists and is a function
      expect(adapter.searchTracks).toBeDefined();
      expect(typeof adapter.searchTracks).toBe("function");
    });

    test("should return adapter with getAlbum method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: getAlbum method exists and is a function
      expect(adapter.getAlbum).toBeDefined();
      expect(typeof adapter.getAlbum).toBe("function");
    });

    test("should return adapter with getArtist method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: getArtist method exists and is a function
      expect(adapter.getArtist).toBeDefined();
      expect(typeof adapter.getArtist).toBe("function");
    });

    test("should return adapter with getPlaylist method", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: getPlaylist method exists and is a function
      expect(adapter.getPlaylist).toBeDefined();
      expect(typeof adapter.getPlaylist).toBe("function");
    });
  });

  describe("Adapter Interface Compliance", () => {
    // AC-001: Verify the returned object conforms to SpotifyAdapter interface
    test("should return object that satisfies SpotifyAdapter interface", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: adapter has all required methods from SpotifyAdapter interface
      const expectedMethods = [
        "getTrack",
        "searchTracks",
        "getAlbum",
        "getArtist",
        "getPlaylist",
      ];

      for (const method of expectedMethods) {
        expect(adapter).toHaveProperty(method);
        expect(typeof adapter[method as keyof SpotifyAdapter]).toBe("function");
      }
    });

    test("should return object assignable to SpotifyAdapter type", () => {
      // Given: valid config
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: adapter is created
      const adapter = createSpotifyAdapter(config);

      // Then: TypeScript should accept assignment to SpotifyAdapter type
      const typedAdapter: SpotifyAdapter = adapter;
      expect(typedAdapter).toBeDefined();
    });
  });

  describe("Configuration Handling", () => {
    // AC-001: Config with clientId and clientSecret
    test("should accept config with clientId and clientSecret", () => {
      // Given: config with both required fields
      const config: SpotifyConfig = {
        clientId: "my-client-id",
        clientSecret: "my-client-secret",
      };

      // When/Then: should not throw
      expect(() => createSpotifyAdapter(config)).not.toThrow();
    });

    test("should handle different clientId values", () => {
      // Given: configs with different clientId formats
      const configs = [
        { clientId: "short", clientSecret: "secret" },
        { clientId: "a1b2c3d4e5f6g7h8", clientSecret: "secret" },
        { clientId: "client-with-dashes", clientSecret: "secret" },
        { clientId: "CLIENT_UPPERCASE", clientSecret: "secret" },
      ];

      // When/Then: all should create adapters successfully
      for (const config of configs) {
        const adapter = createSpotifyAdapter(config);
        expect(adapter).toBeDefined();
        expect(typeof adapter).toBe("object");
      }
    });

    test("should handle different clientSecret values", () => {
      // Given: configs with different clientSecret formats
      const configs = [
        { clientId: "client", clientSecret: "short" },
        { clientId: "client", clientSecret: "a1b2c3d4e5f6g7h8i9j0" },
        { clientId: "client", clientSecret: "secret-with-dashes" },
        { clientId: "client", clientSecret: "SECRET_UPPERCASE" },
      ];

      // When/Then: all should create adapters successfully
      for (const config of configs) {
        const adapter = createSpotifyAdapter(config);
        expect(adapter).toBeDefined();
        expect(typeof adapter).toBe("object");
      }
    });
  });

  describe("Multiple Instances", () => {
    // Verify that multiple adapter instances can be created
    test("should allow creating multiple adapter instances", () => {
      // Given: multiple configs
      const config1: SpotifyConfig = {
        clientId: "client-1",
        clientSecret: "secret-1",
      };
      const config2: SpotifyConfig = {
        clientId: "client-2",
        clientSecret: "secret-2",
      };

      // When: multiple adapters are created
      const adapter1 = createSpotifyAdapter(config1);
      const adapter2 = createSpotifyAdapter(config2);

      // Then: both adapters exist and are distinct objects
      expect(adapter1).toBeDefined();
      expect(adapter2).toBeDefined();
      expect(adapter1).not.toBe(adapter2);
    });

    test("should create independent adapter instances", () => {
      // Given: same config used twice
      const config: SpotifyConfig = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      };

      // When: two adapters are created with the same config
      const adapter1 = createSpotifyAdapter(config);
      const adapter2 = createSpotifyAdapter(config);

      // Then: they should be independent instances
      expect(adapter1).not.toBe(adapter2);
      expect(adapter1.getTrack).toBeDefined();
      expect(adapter2.getTrack).toBeDefined();
    });
  });
});
