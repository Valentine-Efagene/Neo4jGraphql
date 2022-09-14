const { readFile } = require("fs/promises");
const { ApolloServer } = require("apollo-server");
const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
const { exit } = require("process");
require("dotenv").config();

async function getTypeDefs() {
  try {
    const typeDefs = await readFile(__dirname + "/schema.graphql", {
      encoding: "utf8",
    });
    return typeDefs;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function startServer() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );

  const neoSchema = new Neo4jGraphQL({ typeDefs: await getTypeDefs(), driver });

  neoSchema.getSchema().then((schema) => {
    const server = new ApolloServer({
      schema,
    });

    server.listen().then(({ url }) => {
      console.log(`GraphQL server ready on ${url}`);
    });
  });
}

startServer();
