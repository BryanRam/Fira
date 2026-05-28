import neo4j, { type Driver, type QueryResult } from "neo4j-driver";

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

export const driver: Driver | null = uri && user && password ? neo4j.driver(uri, neo4j.auth.basic(user, password)) : null;

export async function runQuery(cypher: string, params: Record<string, unknown> = {}): Promise<QueryResult> {
  if (!driver) {
    throw new Error("Neo4j is not configured.");
  }

  const session = driver.session();
  try {
    return await session.run(cypher, params);
  } finally {
    await session.close();
  }
}
