const { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLFloat, GraphQLInt, GraphQLBoolean } = require('graphql');

module.exports = ({ Source, Range }) => {

  const SourceType = new GraphQLObjectType({
    name: 'source',
    description: '',
    fields: () => {
      return {
        id: { type: GraphQLNonNull(GraphQLInt), },
        name: { type: GraphQLString, },
        length: { type: GraphQLNonNull(GraphQLInt), },
      };
    },
  });

  const DonationRangeType = new GraphQLObjectType({
    name: "donation_range",
    description: '',
    fields: () => {
      return {
        id: { type: GraphQLNonNull(GraphQLString) },
        min: { type: GraphQLNonNull(GraphQLFloat) },
        max: { type: GraphQLNonNull(GraphQLFloat) },
        weight: { type: GraphQLNonNull(GraphQLFloat) },
        sources: {
          type: GraphQLNonNull(GraphQLList(SourceType)),
          resolve: (parent) => {
            return parent.sources.map((source) => {
              return Source.getInstance(source);
            }).filter((source) => { return source !== undefined });
          },
        },
      };
    },
  });

  const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: '',
    fields: () => {
      return {
        get_source: {
          type: SourceType,
          description: 'get a single source in obs',
          args: {
            id: { type: GraphQLNonNull(GraphQLInt), },
          },
          resolve: (obj, { id }) => {
            return Source.getInstance(id);
          },
        },
        get_sources: {
          type: GraphQLList(SourceType),
          description: 'get a list of sources in obs',
          resolve: () => {
            return Source.getInstances();
          },
        },
        get_ranges: {
          type: GraphQLList(DonationRangeType),
          description: 'get a list of the donation ranges that are defined',
          resolve: () => {
            return Range.getInstances();
          },
        },
      };
    }
  });

  const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: '',
    fields: () => {
      return {
        update_source: {
          type: SourceType,
          description: 'update source info',
          args: {
            id: { type: GraphQLNonNull(GraphQLInt), },
            length: { type: GraphQLInt },
          },
          resolve: (obj, { id, length }) => {
            let source = Source.getInstance(id);
            if(length){
              source.setArgs({ length });
            }
            return source;
          },
        },
        play_source: {
          type: SourceType,
          description: 'update source info',
          args: {
            id: { type: GraphQLNonNull(GraphQLInt), },
          },
          resolve: (obj, { id }) => {
            let source = Source.getInstance(id);
            source.play();
            return source;
          },
        },
        create_range: {
          type: DonationRangeType,
          description: 'create a new donation range',
          args: {
            weight: { type: GraphQLFloat, },
            min: { type: GraphQLFloat, },
            max: { type: GraphQLFloat, },
            sources: { type: GraphQLList(GraphQLInt), },
          },
          resolve: (obj, args) => {
            return new Range(args);
          },
        },
        update_range: {
          type: DonationRangeType,
          description: 'edit a donation range',
          args: {
            id: { type: GraphQLNonNull(GraphQLString), },
            weight: { type: GraphQLFloat, },
            min: { type: GraphQLFloat, },
            max: { type: GraphQLFloat, },
            sources: { type: GraphQLList(GraphQLInt), },
          },
          resolve: (obj, { id, ...args}) => {
            let range = Range.getInstance(id);
            range.setArgs(args);
            return range;
          },
        },
        delete_range: {
          type: DonationRangeType,
          description: 'delete a donation range',
          args: {
            id: { type: GraphQLNonNull(GraphQLString), },
          },
          resolve: (obs, { id }) => {
            return Range.delete(id);
          },
        },
        play_range: {
          type: SourceType,
          description: 'update source info',
          args: {
            id: { type: GraphQLNonNull(GraphQLInt), },
          },
          resolve: (obj, { id }) => {
            let range = Ranges.getInstance(id);
            range.play();
            return range;
          },
        },
      };
    }
  });

  let schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
  });
  return schema
}
