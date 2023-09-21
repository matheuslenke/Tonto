export interface Configuration {
  Entity: {
    Attributes: boolean
  },
  Relation: {
    Cardinality: boolean,
    Associations: boolean,
    AssociationsEndNames: boolean
  },
  Datatype: boolean,
  Enumeration: boolean
};