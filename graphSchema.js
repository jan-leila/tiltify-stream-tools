const { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLFloat, GraphQLInt, GraphQLBoolean } = require('graphql');

const shortid = require('shortid');

let sources = [];
let ranges = [];
function getSource(id){
  for(let i in sources){
    if(sources[i].id === id){
      return i;
    }
  }
}

function getRange(id){
  for(let i in ranges){
    if(ranges[i]._id === id){
      return ranges[i];
    }
  }
}

function rangeWithSource({ id, _id, ...args}){
  for(let i in sources){
    if(sources[i].id === id){
      return { source: sources[i], id: _id, ...args };
    }
  }
  return { source: { id: -1 }, id: _id, ...args };
}

module.exports = {
  sources,
  ranges,
  schema: ({ obs, address, password  }) => {
    obs.connect({ address, password })
    .then(() => {
      obs.on('SceneItemAdded', ({ 'scene-name': scene, 'item-name': name, 'item-id': id}) => {
        if(scene !== 'donations'){
          return;
        }
        sources.push({ name, id, length: 1000 });
      });
      obs.on('SceneItemRemoved', ({ 'scene-name': scene, 'item-id': id}) => {
        if(scene !== 'donations'){
          return;
        }
        sources = sources.filter((source) => {
          return source.id !== id;
        });
      });
      return obs.send('GetSceneList');
    })
    .then(({ scenes }) => {
      for(let i in scenes){
        if(scenes[i].name === 'donations'){
          return Promise.resolve(scenes[i]);
        }
      }
      return Promise.reject("donation scene not found");
    })
    .then(({ sources: _sources }) => {
      sources = [ ...sources, ..._sources.map(({ name, id }) => {
        // TODO: load length from file
        return { name, id, length: 1000 };
      }) ];
    })
    .catch(console.log);

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
          source: { type: GraphQLNonNull(SourceType) },
          weight: { type: GraphQLNonNull(GraphQLFloat) },
          min: { type: GraphQLNonNull(GraphQLFloat) },
          max: { type: GraphQLNonNull(GraphQLFloat) },
          id: { type: GraphQLNonNull(GraphQLString) },
        };
      },
    });

    const RootQueryType = new GraphQLObjectType({
      name: 'Query',
      description: '',
      fields: () => {
        return {
          get_sources: {
            type: GraphQLList(SourceType),
            description: 'get a list of sources in obs',
            resolve: () => {
              return sources;
            },
          },
          get_donation_ranges: {
            type: GraphQLList(DonationRangeType),
            description: 'get a list of the donation ranges that are defined',
            resolve: () => {
              return ranges.map(({ ...args }) => {
                return rangeWithSource(args);
              });
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
            resolve: (obj, { id, ...args }) => {
              let i = getSource(id);
              sources[i] = { ...sources[i], ...args };
              // TODO: save length
              return sources[i];
            },
          },
          play_source: {
            type: SourceType,
            description: 'update source info',
            args: {
              id: { type: GraphQLNonNull(GraphQLInt), },
            },
            resolve: (obj, { id }) => {
              let i = getSource(id);
              console.log(id);
              // TODO: play source
              return sources[i];
            },
          },
          create_range: {
            type: DonationRangeType,
            description: 'create a new donation range',
            args: {
              weight: { type: GraphQLFloat, },
              min: { type: GraphQLFloat, },
              max: { type: GraphQLFloat, },
              source: { type: GraphQLInt, },
            },
            resolve: (obj, { weight = 1, min = -1, max = -1, source = -1 }) => {
              let range = { weight, min, max, id: source, _id: shortid.generate() };
              ranges.push(range);
              return rangeWithSource(range);
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
              source: { type: GraphQLInt, },
            },
            resolve: (obj, { id: _id, source: id, ...args}) => {
              let range = getRange(_id);
              if(id){
                return rangeWithSource({ ...range, id, ...args });
              }
              return rangeWithSource({ ...range, ...args });
            },
          }
        };
      }
    });

    return new GraphQLSchema({
      query: RootQueryType,
      mutation: RootMutationType,
    });
  }
}
