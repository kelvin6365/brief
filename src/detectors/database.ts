/**
 * Database detection
 */

import type { DetectionContext, DatabaseInfo } from "./types.js";
import { hasDependency, hasFile, hasPythonPackage } from "./utils.js";

interface DatabaseDefinition {
  name: string;
  detect: (context: DetectionContext) => { confidence: number; source: string; orm?: string } | null;
}

const databaseDefinitions: DatabaseDefinition[] = [
  // ORMs (check first as they indicate database usage)
  {
    name: "PostgreSQL",
    detect: (ctx) => {
      // Prisma with PostgreSQL
      if (hasDependency(ctx, "@prisma/client") || hasDependency(ctx, "prisma")) {
        const hasSchema = hasFile(ctx, "prisma/schema.prisma");
        if (hasSchema) {
          return {
            confidence: 85,
            source: "prisma (schema.prisma)",
            orm: "Prisma",
          };
        }
      }

      // Direct PostgreSQL drivers
      if (hasDependency(ctx, "pg") || hasDependency(ctx, "postgres") || hasDependency(ctx, "@vercel/postgres")) {
        return {
          confidence: 90,
          source: "pg/postgres driver",
        };
      }

      // Python
      if (hasPythonPackage(ctx, "psycopg2") || hasPythonPackage(ctx, "asyncpg")) {
        return {
          confidence: 90,
          source: "psycopg2/asyncpg driver",
        };
      }

      return null;
    },
  },
  {
    name: "MySQL",
    detect: (ctx) => {
      if (hasDependency(ctx, "mysql") || hasDependency(ctx, "mysql2")) {
        return {
          confidence: 90,
          source: "mysql/mysql2 driver",
        };
      }

      if (hasPythonPackage(ctx, "pymysql") || hasPythonPackage(ctx, "mysqlclient")) {
        return {
          confidence: 90,
          source: "pymysql driver",
        };
      }

      return null;
    },
  },
  {
    name: "MongoDB",
    detect: (ctx) => {
      if (hasDependency(ctx, "mongodb")) {
        return {
          confidence: 90,
          source: "mongodb driver",
        };
      }

      if (hasDependency(ctx, "mongoose")) {
        return {
          confidence: 95,
          source: "mongoose ODM",
          orm: "Mongoose",
        };
      }

      if (hasPythonPackage(ctx, "pymongo") || hasPythonPackage(ctx, "motor")) {
        return {
          confidence: 90,
          source: "pymongo driver",
        };
      }

      return null;
    },
  },
  {
    name: "SQLite",
    detect: (ctx) => {
      if (hasDependency(ctx, "sqlite3") || hasDependency(ctx, "better-sqlite3")) {
        return {
          confidence: 90,
          source: "sqlite3/better-sqlite3 driver",
        };
      }

      if (hasDependency(ctx, "@libsql/client") || hasDependency(ctx, "libsql")) {
        return {
          confidence: 85,
          source: "libsql client (Turso)",
        };
      }

      return null;
    },
  },
  {
    name: "Redis",
    detect: (ctx) => {
      if (hasDependency(ctx, "redis") || hasDependency(ctx, "ioredis")) {
        return {
          confidence: 90,
          source: "redis/ioredis client",
        };
      }

      if (hasDependency(ctx, "@upstash/redis")) {
        return {
          confidence: 90,
          source: "@upstash/redis client",
        };
      }

      if (hasPythonPackage(ctx, "redis")) {
        return {
          confidence: 90,
          source: "redis-py client",
        };
      }

      return null;
    },
  },

  // ORMs as separate detections
  {
    name: "Prisma",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@prisma/client") && !hasDependency(ctx, "prisma")) return null;
      const hasSchema = hasFile(ctx, "prisma/schema.prisma");
      return {
        confidence: hasSchema ? 95 : 80,
        source: hasSchema ? "@prisma/client + schema" : "@prisma/client",
        orm: "Prisma",
      };
    },
  },
  {
    name: "Drizzle",
    detect: (ctx) => {
      if (!hasDependency(ctx, "drizzle-orm")) return null;
      const hasConfig = hasFile(ctx, "drizzle.config.ts") || hasFile(ctx, "drizzle.config.js");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "drizzle-orm + config" : "drizzle-orm",
        orm: "Drizzle",
      };
    },
  },
  {
    name: "TypeORM",
    detect: (ctx) => {
      if (!hasDependency(ctx, "typeorm")) return null;
      return {
        confidence: 85,
        source: "typeorm",
        orm: "TypeORM",
      };
    },
  },
  {
    name: "Sequelize",
    detect: (ctx) => {
      if (!hasDependency(ctx, "sequelize")) return null;
      return {
        confidence: 85,
        source: "sequelize",
        orm: "Sequelize",
      };
    },
  },
  {
    name: "Knex",
    detect: (ctx) => {
      if (!hasDependency(ctx, "knex")) return null;
      const hasConfig = hasFile(ctx, "knexfile.js") || hasFile(ctx, "knexfile.ts");
      return {
        confidence: hasConfig ? 90 : 80,
        source: hasConfig ? "knex + knexfile" : "knex",
        orm: "Knex",
      };
    },
  },

  // Python ORMs
  {
    name: "SQLAlchemy",
    detect: (ctx) => {
      if (!hasPythonPackage(ctx, "sqlalchemy")) return null;
      return {
        confidence: 90,
        source: "sqlalchemy",
        orm: "SQLAlchemy",
      };
    },
  },
  {
    name: "Django ORM",
    detect: (ctx) => {
      if (!hasPythonPackage(ctx, "django")) return null;
      const hasModels = ctx.files.some((f) => f.endsWith("models.py"));
      if (!hasModels) return null;
      return {
        confidence: 85,
        source: "django with models.py",
        orm: "Django ORM",
      };
    },
  },

  // Other databases
  {
    name: "Supabase",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@supabase/supabase-js")) return null;
      return {
        confidence: 90,
        source: "@supabase/supabase-js",
      };
    },
  },
  {
    name: "Firebase",
    detect: (ctx) => {
      if (!hasDependency(ctx, "firebase") && !hasDependency(ctx, "firebase-admin")) return null;
      return {
        confidence: 90,
        source: "firebase/firebase-admin",
      };
    },
  },
  {
    name: "PlanetScale",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@planetscale/database")) return null;
      return {
        confidence: 90,
        source: "@planetscale/database",
      };
    },
  },
  {
    name: "DynamoDB",
    detect: (ctx) => {
      if (
        !hasDependency(ctx, "@aws-sdk/client-dynamodb") &&
        !hasDependency(ctx, "aws-sdk") &&
        !hasPythonPackage(ctx, "boto3")
      )
        return null;
      // Lower confidence as AWS SDK could be used for many things
      return {
        confidence: 60,
        source: "AWS SDK (may include DynamoDB)",
      };
    },
  },
];

/**
 * Detect databases and ORMs used in the project
 */
export function detectDatabase(context: DetectionContext): DatabaseInfo[] {
  const detected: DatabaseInfo[] = [];

  for (const definition of databaseDefinitions) {
    const result = definition.detect(context);
    if (result) {
      detected.push({
        name: definition.name,
        confidence: result.confidence,
        source: result.source,
        orm: result.orm,
      });
    }
  }

  // Sort by confidence (highest first)
  return detected.sort((a, b) => b.confidence - a.confidence);
}
