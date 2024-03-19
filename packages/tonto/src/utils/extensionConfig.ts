export interface Configuration {
  Entity: {
    Attributes: boolean
  },
  Relation: {
    Cardinality: boolean,
    Stereotype: boolean,
    Name: boolean,
    EndNames: boolean
  },
  Datatype: boolean,
  Enumeration: boolean
};