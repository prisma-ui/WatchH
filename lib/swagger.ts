export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "WatchHentai Scraper API",
    version: "1.0.0",
    description: "REST API scraper for watchhentai.net",
  },
  servers: [{ url: "/api", description: "API Base" }],
  tags: [
    { name: "Home", description: "Homepage data" },
    { name: "Episodes", description: "Episode listings" },
    { name: "Trending", description: "Trending content" },
    { name: "Series", description: "Series listings & detail" },
    { name: "Calendar", description: "Release calendar" },
    { name: "Search", description: "Search" },
    { name: "Watch", description: "Watch/video page" },
    { name: "Genres", description: "Genre listing" },
  ],
  paths: {
    "/home": {
      get: {
        tags: ["Home"],
        summary: "Get homepage data (slider, recent episodes, hentai series)",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    slider: { type: "array", items: { $ref: "#/components/schemas/SliderItem" } },
                    recentEpisodes: { type: "array", items: { $ref: "#/components/schemas/EpisodeCard" } },
                    hentaiSeries: { type: "array", items: { $ref: "#/components/schemas/SeriesCard" } },
                  },
                },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/videos": {
      get: {
        tags: ["Episodes"],
        summary: "Get list of hentai episodes",
        parameters: [{ $ref: "#/components/parameters/page" }],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    episodes: { type: "array", items: { $ref: "#/components/schemas/EpisodeCard" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/trending": {
      get: {
        tags: ["Trending"],
        summary: "Get trending hentai",
        parameters: [{ $ref: "#/components/parameters/page" }],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: { type: "array", items: { type: "object" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/series": {
      get: {
        tags: ["Series"],
        summary: "Get hentai series list with optional genre/year filter",
        parameters: [
          { $ref: "#/components/parameters/page" },
          {
            name: "genre",
            in: "query",
            description: "Genre slug (e.g. uncensored, harem, school-girls)",
            schema: { type: "string" },
          },
          {
            name: "year",
            in: "query",
            description: "Release year (e.g. 2025, 2024)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    series: { type: "array", items: { $ref: "#/components/schemas/SeriesCard" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/series/{slug}": {
      get: {
        tags: ["Series"],
        summary: "Get series detail page",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            description: "Series slug (e.g. paihame-kazoku-id-01)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SeriesDetail" },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/calendar": {
      get: {
        tags: ["Calendar"],
        summary: "Get hentai release calendar",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    calendar: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/search": {
      get: {
        tags: ["Search"],
        summary: "Search for hentai series/episodes",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Search keywords",
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/page" },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string" },
                    results: { type: "array", items: { type: "object" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          400: { description: "Missing query parameter" },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/watch/{slug}": {
      get: {
        tags: ["Watch"],
        summary: "Get video/watch page data",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            description: "Video slug (e.g. paihame-kazoku-episode-1-id-01)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WatchDetail" },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/genres": {
      get: {
        tags: ["Genres"],
        summary: "Get all genres with name, slug, and series count",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    genres: { type: "array", items: { $ref: "#/components/schemas/GenreItem" } },
                  },
                },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/genres/{slug}": {
      get: {
        tags: ["Genres"],
        summary: "Get series filtered by genre slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            description: "Genre slug (e.g. uncensored, harem, school-girls)",
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/page" },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    slug: { type: "string" },
                    series: { type: "array", items: { $ref: "#/components/schemas/SeriesCard" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          500: { $ref: "#/components/responses/Error" },
        },
      },
    },
  },
    parameters: {
      page: {
        name: "page",
        in: "query",
        description: "Page number",
        schema: { type: "integer", default: 1, minimum: 1 },
      },
    },
    responses: {
      Error: {
        description: "Server error",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "string" },
              },
            },
          },
        },
      },
    },
    schemas: {
      GenreItem: {
        type: "object",
        properties: {
          name: { type: "string" },
          slug: { type: "string" },
          count: { type: "integer" },
          link: { type: "string" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          current: { type: "integer" },
          total: { type: "integer" },
        },
      },
      SliderItem: {
        type: "object",
        properties: {
          title: { type: "string" },
          year: { type: "string" },
          link: { type: "string" },
          backdrop: { type: "string" },
        },
      },
      EpisodeCard: {
        type: "object",
        properties: {
          series: { type: "string" },
          episode: { type: "string" },
          link: { type: "string" },
          thumbnail: { type: "string" },
          subType: { type: "string", description: "SUB / RAW / DUB" },
          censored: { type: "string", description: "CEN / UNC" },
          ago: { type: "string" },
          views: { type: "string" },
        },
      },
      SeriesCard: {
        type: "object",
        properties: {
          title: { type: "string" },
          link: { type: "string" },
          thumbnail: { type: "string" },
          year: { type: "string" },
          censored: { type: "string", description: "CEN / UNC" },
        },
      },
      SeriesDetail: {
        type: "object",
        properties: {
          title: { type: "string" },
          poster: { type: "string" },
          date: { type: "string" },
          network: { type: "string" },
          genres: { type: "array", items: { type: "string" } },
          rating: { type: "string" },
          ratingCount: { type: "string" },
          synopsis: { type: "string" },
          episodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                link: { type: "string" },
                date: { type: "string" },
                thumbnail: { type: "string" },
              },
            },
          },
          gallery: { type: "array", items: { type: "string" } },
          details: { type: "object", additionalProperties: { type: "string" } },
          related: { type: "array", items: { type: "object" } },
        },
      },
      WatchDetail: {
        type: "object",
        properties: {
          title: { type: "string" },
          genres: { type: "array", items: { type: "string" } },
          posted: { type: "string" },
          views: { type: "string" },
          duration: { type: "string" },
          thumbnail: { type: "string" },
          player: {
            type: "object",
            properties: {
              src: { type: "string" },
              videoUrl: { type: "string" },
              quality: { type: "string" },
            },
          },
          downloadLink: { type: "string" },
          navigation: {
            type: "object",
            properties: {
              prev: { type: "string", nullable: true },
              next: { type: "string", nullable: true },
              series: { type: "string" },
            },
          },
          synopsis: { type: "string" },
          episodeList: { type: "array", items: { type: "object" } },
          gallery: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};
